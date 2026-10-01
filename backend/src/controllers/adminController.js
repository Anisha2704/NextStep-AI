import mongoose from 'mongoose';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Assessment from '../models/Assessment.js';
import AssessmentResult from '../models/AssessmentResult.js';
import LearningPath from '../models/LearningPath.js';
import Resume from '../models/Resume.js';
import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import { sendError, sendSuccess } from '../utils/response.js';

const badId = (id) => !mongoose.isValidObjectId(id);

const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------
// 1. OVERVIEW & METRICS
// ----------------------------------------------------
export const overview = wrap(async (_req, res) => {
  const [
    students,
    admins,
    courses,
    assessments,
    activeAssessments,
    attempts,
    passedAttempts,
    roadmaps,
    resumes,
    recentUsers,
    announcementsCount
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'admin' }),
    Course.countDocuments(),
    Assessment.countDocuments(),
    Assessment.countDocuments({ active: true }),
    AssessmentResult.countDocuments(),
    AssessmentResult.countDocuments({ passed: true }),
    LearningPath.countDocuments(),
    Resume.countDocuments(),
    User.find().select('name email role createdAt education location').sort({ createdAt: -1 }).limit(6).lean(),
    Announcement.countDocuments(),
  ]);

  return sendSuccess(res, 200, 'Admin overview retrieved', {
    overview: {
      students,
      admins,
      courses,
      assessments,
      activeAssessments,
      attempts,
      passedAttempts,
      roadmaps,
      resumes,
      recentUsers: recentUsers.map((u) => ({ ...u, id: String(u._id) })),
      announcementsCount,
    },
  });
});

// ----------------------------------------------------
// 2. USER MANAGEMENT
// ----------------------------------------------------
export const listUsers = wrap(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const search = String(req.query.search || '').trim();

  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    User.find(query)
      .select('name email role location education createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return sendSuccess(res, 200, 'Users retrieved', {
    users: users.map((u) => ({
      ...u,
      id: String(u._id),
      _id: undefined,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  });
});

export const getUserDetails = wrap(async (req, res) => {
  if (badId(req.params.userId)) return sendError(res, 400, 'Invalid user ID.');

  const user = await User.findById(req.params.userId)
    .select('-password -__v')
    .lean();

  if (!user) return sendError(res, 404, 'User not found.');

  const [attemptsCount, resumeCount, learningPath] = await Promise.all([
    AssessmentResult.countDocuments({ user: user._id }),
    Resume.countDocuments({ user: user._id }),
    LearningPath.findOne({ user: user._id }).select('targetRole currentLevel modules').lean(),
  ]);

  return sendSuccess(res, 200, 'User details retrieved', {
    user: {
      ...user,
      id: String(user._id),
      _id: undefined,
      attemptsCount,
      resumeCount,
      hasLearningPath: Boolean(learningPath),
      learningPathTarget: learningPath?.targetRole || null,
    },
  });
});

export const updateUserRole = wrap(async (req, res) => {
  if (badId(req.params.userId)) return sendError(res, 400, 'Invalid user ID.');
  if (!['admin', 'student'].includes(req.body.role)) {
    return sendError(res, 400, 'Role must be either admin or student.');
  }

  const masterAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const targetUser = await User.findById(req.params.userId);
  if (!targetUser) return sendError(res, 404, 'User not found.');

  if (req.body.role === 'admin' && targetUser.email.toLowerCase() !== masterAdminEmail) {
    return sendError(res, 403, 'System policy allows only the primary master admin credential. Other users cannot be promoted to admin.');
  }

  if (targetUser.email.toLowerCase() === masterAdminEmail && req.body.role !== 'admin') {
    return sendError(res, 400, 'Cannot revoke admin role from the primary master administrator.');
  }

  targetUser.role = req.body.role;
  await targetUser.save();

  return sendSuccess(res, 200, 'User role updated successfully', {
    user: { id: String(targetUser._id), name: targetUser.name, email: targetUser.email, role: targetUser.role },
  });
});

// ----------------------------------------------------
// 3. COURSE MANAGEMENT
// ----------------------------------------------------
export const listCourses = wrap(async (req, res) => {
  const search = String(req.query.search || '').trim();
  const level = String(req.query.level || '').trim();

  const query = {};
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { provider: { $regex: search, $options: 'i' } },
      { skills: { $regex: search, $options: 'i' } },
    ];
  }
  if (level && level !== 'All') {
    query.level = level;
  }

  const courses = await Course.find(query).sort({ updatedAt: -1 }).lean();
  return sendSuccess(res, 200, 'Courses retrieved', { courses });
});

const courseFields = (body) => ({
  title: String(body.title || '').trim(),
  provider: String(body.provider || '').trim(),
  description: String(body.description || '').trim(),
  skills: Array.isArray(body.skills)
    ? body.skills.map((s) => String(s).trim()).filter(Boolean)
    : String(body.skills || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
  url: String(body.url || '').trim(),
  level: ['Beginner', 'Intermediate', 'Advanced', 'All levels'].includes(body.level) ? body.level : 'Beginner',
  duration: String(body.duration || '').trim(),
});

export const createCourse = wrap(async (req, res) => {
  const fields = courseFields(req.body);
  if (!fields.title) return sendError(res, 400, 'Course title is required.');
  if (fields.title.length < 2 || fields.title.length > 160) {
    return sendError(res, 400, 'Course title must be between 2 and 160 characters.');
  }

  const course = await Course.create(fields);
  return sendSuccess(res, 201, 'Course created successfully', { course });
});

export const updateCourse = wrap(async (req, res) => {
  if (badId(req.params.courseId)) return sendError(res, 400, 'Invalid course ID.');
  const fields = courseFields(req.body);
  if (!fields.title) return sendError(res, 400, 'Course title is required.');

  const course = await Course.findByIdAndUpdate(req.params.courseId, fields, {
    new: true,
    runValidators: true,
  });

  if (!course) return sendError(res, 404, 'Course not found.');
  return sendSuccess(res, 200, 'Course updated successfully', { course });
});

export const deleteCourse = wrap(async (req, res) => {
  if (badId(req.params.courseId)) return sendError(res, 400, 'Invalid course ID.');
  const course = await Course.findByIdAndDelete(req.params.courseId);
  if (!course) return sendError(res, 404, 'Course not found.');
  return sendSuccess(res, 200, 'Course deleted successfully');
});

// ----------------------------------------------------
// 4. ASSESSMENT MANAGEMENT
// ----------------------------------------------------
export const listAssessments = wrap(async (_req, res) => {
  const assessments = await Assessment.find().sort({ updatedAt: -1 }).lean();
  return sendSuccess(res, 200, 'Assessments retrieved', {
    assessments: assessments.map((a) => ({
      ...a,
      id: String(a._id),
      questionCount: a.questions ? a.questions.length : 0,
    })),
  });
});

export const getAssessmentDetails = wrap(async (req, res) => {
  if (badId(req.params.assessmentId)) return sendError(res, 400, 'Invalid assessment ID.');
  const assessment = await Assessment.findById(req.params.assessmentId).lean();
  if (!assessment) return sendError(res, 404, 'Assessment not found.');

  return sendSuccess(res, 200, 'Assessment details retrieved', {
    assessment: {
      ...assessment,
      id: String(assessment._id),
    },
  });
});

const validateAssessmentPayload = (body) => {
  if (!body || typeof body !== 'object') return 'Assessment body is required.';
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length < 3) {
    return 'Assessment title is required (at least 3 characters).';
  }
  if (!body.subject || typeof body.subject !== 'string') return 'Subject is required.';
  if (!Array.isArray(body.questions) || body.questions.length === 0) {
    return 'At least one question is required.';
  }

  for (let i = 0; i < body.questions.length; i++) {
    const q = body.questions[i];
    if (!q.prompt || typeof q.prompt !== 'string' || q.prompt.trim().length < 3) {
      return `Question #${i + 1} prompt is missing or too short.`;
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      return `Question #${i + 1} must have at least 2 options.`;
    }
    if (
      typeof q.correctAnswer !== 'number' ||
      q.correctAnswer < 0 ||
      q.correctAnswer >= q.options.length
    ) {
      return `Question #${i + 1} has an invalid correct answer index.`;
    }
  }

  return null;
};

export const createAssessment = wrap(async (req, res) => {
  const errorMsg = validateAssessmentPayload(req.body);
  if (errorMsg) return sendError(res, 400, errorMsg);

  const payload = {
    ...req.body,
    slug: req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    subjectSlug: req.body.subjectSlug || req.body.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    topicSlug: req.body.topicSlug || (req.body.topic || req.body.subject).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    active: req.body.active !== undefined ? Boolean(req.body.active) : true,
  };

  const assessment = await Assessment.create(payload);
  return sendSuccess(res, 201, 'Assessment created successfully', {
    assessment: { id: String(assessment._id), title: assessment.title },
  });
});

export const updateAssessment = wrap(async (req, res) => {
  if (badId(req.params.assessmentId)) return sendError(res, 400, 'Invalid assessment ID.');

  const assessment = await Assessment.findByIdAndUpdate(req.params.assessmentId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!assessment) return sendError(res, 404, 'Assessment not found.');
  return sendSuccess(res, 200, 'Assessment updated successfully', {
    assessment: { id: String(assessment._id), active: assessment.active, title: assessment.title },
  });
});

export const deleteAssessment = wrap(async (req, res) => {
  if (badId(req.params.assessmentId)) return sendError(res, 400, 'Invalid assessment ID.');

  const used = await AssessmentResult.exists({ assessment: req.params.assessmentId });
  if (used) {
    return sendError(
      res,
      409,
      'This assessment has student submission results. Pause it instead to preserve exam history.'
    );
  }

  const assessment = await Assessment.findByIdAndDelete(req.params.assessmentId);
  if (!assessment) return sendError(res, 404, 'Assessment not found.');
  return sendSuccess(res, 200, 'Assessment deleted successfully');
});

// ----------------------------------------------------
// 5. STUDENT ATTEMPT ANALYTICS
// ----------------------------------------------------
export const listAttempts = wrap(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const search = String(req.query.search || '').trim();
  const status = String(req.query.status || 'all').toLowerCase();

  const query = {};

  if (status === 'passed') query.passed = true;
  if (status === 'failed') query.passed = false;

  if (search) {
    // Search by assessment title or subject
    const matchingUsers = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');

    const userIds = matchingUsers.map((u) => u._id);

    query.$or = [
      { assessmentTitle: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { topic: { $regex: search, $options: 'i' } },
      { user: { $in: userIds } },
    ];
  }

  const [attempts, total] = await Promise.all([
    AssessmentResult.find(query)
      .populate('user', 'name email')
      .populate('assessment', 'title difficulty durationMinutes')
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    AssessmentResult.countDocuments(query),
  ]);

  return sendSuccess(res, 200, 'Assessment attempts retrieved', {
    attempts: attempts.map((att) => ({
      id: String(att._id),
      studentName: att.user?.name || 'Unknown Student',
      studentEmail: att.user?.email || 'N/A',
      assessmentTitle: att.assessmentTitle,
      difficulty: att.difficulty,
      score: att.score,
      totalQuestions: att.totalQuestions,
      percentage: att.percentage,
      passingScore: att.passingScore,
      passed: att.passed,
      submittedAt: att.submittedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  });
});

export const exportAttemptsCsv = wrap(async (_req, res) => {
  const attempts = await AssessmentResult.find()
    .populate('user', 'name email')
    .sort({ submittedAt: -1 })
    .lean();

  const headers = [
    'Student Name',
    'Student Email',
    'Assessment Title',
    'Subject',
    'Difficulty',
    'Score',
    'Total Questions',
    'Percentage',
    'Passing Score',
    'Status',
    'Submitted At',
  ];

  const rows = attempts.map((att) => [
    `"${(att.user?.name || 'Unknown').replace(/"/g, '""')}"`,
    `"${(att.user?.email || '').replace(/"/g, '""')}"`,
    `"${(att.assessmentTitle || '').replace(/"/g, '""')}"`,
    `"${(att.subject || '').replace(/"/g, '""')}"`,
    `"${att.difficulty || ''}"`,
    att.score,
    att.totalQuestions,
    `${att.percentage}%`,
    `${att.passingScore}%`,
    att.passed ? 'Passed' : 'Failed',
    `"${new Date(att.submittedAt).toLocaleString()}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="assessment-attempts-report.csv"');
  return res.status(200).send(csvContent);
});

// ----------------------------------------------------
// 6. ADMIN ANNOUNCEMENTS SYSTEM
// ----------------------------------------------------
export const listAnnouncements = wrap(async (_req, res) => {
  const announcements = await Announcement.find().sort({ createdAt: -1 }).lean();
  return sendSuccess(res, 200, 'Announcements retrieved', {
    announcements: announcements.map((a) => ({
      ...a,
      id: String(a._id),
    })),
  });
});

export const createAnnouncement = wrap(async (req, res) => {
  const { title, message, type = 'info', isPublished = true, broadcast = false } = req.body;

  if (!title || title.trim().length < 3) {
    return sendError(res, 400, 'Announcement title must be at least 3 characters.');
  }
  if (!message || message.trim().length < 5) {
    return sendError(res, 400, 'Announcement message must be at least 5 characters.');
  }

  const announcement = await Announcement.create({
    title: title.trim(),
    message: message.trim(),
    type: ['info', 'warning', 'success', 'urgent'].includes(type) ? type : 'info',
    isPublished: Boolean(isPublished),
    createdBy: req.user._id,
  });

  // If broadcast is true, send a Notification to all students
  if (broadcast && isPublished) {
    const students = await User.find({ role: 'student' }).select('_id');
    const notifications = students.map((st) => ({
      user: st._id,
      type: 'milestone',
      title: `📣 ${announcement.title}`,
      message: announcement.message.slice(0, 480),
      link: '/dashboard',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  }

  return sendSuccess(res, 201, 'Announcement created successfully', { announcement });
});

export const updateAnnouncement = wrap(async (req, res) => {
  if (badId(req.params.announcementId)) return sendError(res, 400, 'Invalid announcement ID.');

  const announcement = await Announcement.findByIdAndUpdate(req.params.announcementId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!announcement) return sendError(res, 404, 'Announcement not found.');
  return sendSuccess(res, 200, 'Announcement updated successfully', { announcement });
});

export const deleteAnnouncement = wrap(async (req, res) => {
  if (badId(req.params.announcementId)) return sendError(res, 400, 'Invalid announcement ID.');
  const announcement = await Announcement.findByIdAndDelete(req.params.announcementId);
  if (!announcement) return sendError(res, 404, 'Announcement not found.');

  return sendSuccess(res, 200, 'Announcement deleted successfully');
});

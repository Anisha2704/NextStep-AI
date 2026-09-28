import mongoose from 'mongoose';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Assessment from '../models/Assessment.js';
import AssessmentResult from '../models/AssessmentResult.js';
import LearningPath from '../models/LearningPath.js';
import Resume from '../models/Resume.js';
import { sendError, sendSuccess } from '../utils/response.js';

const badId = (id) => !mongoose.isValidObjectId(id);
const fail = (res, error) => sendError(res, error.code || 400, error.message || 'Invalid request.');
const wrap = (fn) => async (req, res, next) => { try { await fn(req, res, next); } catch (error) { next(error); } };

export const overview = wrap(async (_req, res) => {
  const [students, admins, courses, assessments, activeAssessments, attempts, roadmaps, resumes, recentUsers] = await Promise.all([
    User.countDocuments({ role: 'student' }), User.countDocuments({ role: 'admin' }), Course.countDocuments(),
    Assessment.countDocuments(), Assessment.countDocuments({ active: true }), AssessmentResult.countDocuments(),
    LearningPath.countDocuments(), Resume.countDocuments(), User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(6).lean(),
  ]);
  return sendSuccess(res, 200, 'Admin overview retrieved', { overview: { students, admins, courses, assessments, activeAssessments, attempts, roadmaps, resumes, recentUsers } });
});

export const listUsers = wrap(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const search = String(req.query.search || '').trim();
  const query = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
  const [users, total] = await Promise.all([
    User.find(query).select('name email role location education.college createdAt updatedAt').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(query),
  ]);
  return sendSuccess(res, 200, 'Users retrieved', { users: users.map((u) => ({ ...u, id: String(u._id), _id: undefined })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const updateUserRole = wrap(async (req, res) => {
  if (badId(req.params.userId)) return sendError(res, 400, 'Invalid user ID.');
  if (!['admin', 'student'].includes(req.body.role)) return sendError(res, 400, 'Role must be admin or student.');
  if (String(req.user._id) === req.params.userId && req.body.role !== 'admin') return sendError(res, 400, 'You cannot remove your own admin access.');
  const user = await User.findByIdAndUpdate(req.params.userId, { role: req.body.role }, { new: true, runValidators: true }).select('name email role');
  if (!user) return sendError(res, 404, 'User not found.');
  return sendSuccess(res, 200, 'User role updated', { user: { id: String(user._id), name: user.name, email: user.email, role: user.role } });
});

export const listCourses = wrap(async (_req, res) => sendSuccess(res, 200, 'Courses retrieved', { courses: await Course.find().sort({ updatedAt: -1 }).lean() }));
const courseFields = (body) => ({ title: body.title, provider: body.provider || '', description: body.description || '', skills: Array.isArray(body.skills) ? body.skills : String(body.skills || '').split(',').map((s) => s.trim()).filter(Boolean), url: body.url || '', level: body.level || '', duration: body.duration || '' });
export const createCourse = wrap(async (req, res) => {
  if (!String(req.body.title || '').trim()) return sendError(res, 400, 'Course title is required.');
  const course = await Course.create(courseFields(req.body)); return sendSuccess(res, 201, 'Course created', { course });
});
export const updateCourse = wrap(async (req, res) => {
  if (badId(req.params.courseId)) return sendError(res, 400, 'Invalid course ID.');
  const course = await Course.findByIdAndUpdate(req.params.courseId, courseFields(req.body), { new: true, runValidators: true });
  if (!course) return sendError(res, 404, 'Course not found.'); return sendSuccess(res, 200, 'Course updated', { course });
});
export const deleteCourse = wrap(async (req, res) => {
  if (badId(req.params.courseId)) return sendError(res, 400, 'Invalid course ID.');
  const course = await Course.findByIdAndDelete(req.params.courseId); if (!course) return sendError(res, 404, 'Course not found.');
  return sendSuccess(res, 200, 'Course deleted');
});

export const listAssessments = wrap(async (_req, res) => {
  const assessments = await Assessment.find().select('-questions.correctAnswer -questions.explanation').sort({ updatedAt: -1 }).lean();
  return sendSuccess(res, 200, 'Assessments retrieved', { assessments: assessments.map((a) => ({ ...a, id: String(a._id), questionCount: a.questions.length, questions: undefined })) });
});
export const createAssessment = wrap(async (req, res) => {
  const assessment = await Assessment.create(req.body); return sendSuccess(res, 201, 'Assessment created', { assessment: { id: String(assessment._id), title: assessment.title } });
});
export const updateAssessment = wrap(async (req, res) => {
  if (badId(req.params.assessmentId)) return sendError(res, 400, 'Invalid assessment ID.');
  const assessment = await Assessment.findByIdAndUpdate(req.params.assessmentId, req.body, { new: true, runValidators: true });
  if (!assessment) return sendError(res, 404, 'Assessment not found.'); return sendSuccess(res, 200, 'Assessment updated', { assessment: { id: String(assessment._id), active: assessment.active, title: assessment.title } });
});
export const deleteAssessment = wrap(async (req, res) => {
  if (badId(req.params.assessmentId)) return sendError(res, 400, 'Invalid assessment ID.');
  const used = await AssessmentResult.exists({ assessment: req.params.assessmentId });
  if (used) return sendError(res, 409, 'This assessment has learner results. Deactivate it to preserve history.');
  const assessment = await Assessment.findByIdAndDelete(req.params.assessmentId); if (!assessment) return sendError(res, 404, 'Assessment not found.');
  return sendSuccess(res, 200, 'Assessment deleted');
});

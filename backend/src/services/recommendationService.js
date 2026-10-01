import crypto from 'crypto';
import Course from '../models/Course.js';
import Certification from '../models/Certification.js';
import Progress from '../models/Progress.js';
import RecommendationCache from '../models/RecommendationCache.js';
import { getCourseAndCertRecommendations } from './aiService.js';

const COOLDOWN_SECONDS = 15; // Minimum seconds between fresh Gemini API calls
const CACHE_TTL_HOURS = 24;  // Cached recommendations valid for 24 hours if profile is unchanged

/**
 * Generates a deterministic hash representing the user's career profile state.
 */
export const computeProfileHash = (user, completedCourseIds = []) => {
  const targetRole = user.careerGoals?.targetJobRole || '';
  const skills = (user.skills || [])
    .map((s) => `${s.name.toLowerCase()}:${s.proficiency || 'Beginner'}`)
    .sort()
    .join('|');
  const interests = (user.interests || []).slice().sort().join('|');
  const projects = (user.projects || []).map((p) => p.name).sort().join('|');
  const certs = (user.certifications || []).map((c) => c.name.toLowerCase()).sort().join('|');
  const completed = completedCourseIds.slice().sort().join('|');
  const edu = `${user.education?.degree || ''}:${user.education?.branch || ''}`;

  const payload = [targetRole, skills, interests, projects, certs, completed, edu, user.experienceLevel || ''].join('###');
  return crypto.createHash('sha256').update(payload).digest('hex');
};

/**
 * Checks if the user's profile has enough information for quality recommendations.
 */
export const isProfileIncomplete = (user) => {
  const targetRole = user.careerGoals?.targetJobRole?.trim();
  const skills = user.skills || [];
  return !targetRole || skills.length === 0;
};

/**
 * Fetches completed course IDs for the user from Progress collection and user profile.
 */
const getCompletedCourses = async (userId) => {
  try {
    const progressList = await Progress.find({
      user: userId,
      activityType: 'course',
      status: 'completed',
    }).select('activityId').lean();

    return progressList.map((p) => String(p.activityId));
  } catch (err) {
    console.error('Failed to query progress for completed courses:', err.message);
    return [];
  }
};

/**
 * Pure rule-based fallback recommendation generator strictly using MongoDB records.
 */
const generateRuleBasedRecommendations = (user, availableCourses, availableCerts, completedCourseIds) => {
  const targetRole = user.careerGoals?.targetJobRole || 'Software Engineer';
  const targetRoleLower = targetRole.toLowerCase();
  const userSkillNames = new Set((user.skills || []).map((s) => s.name.toLowerCase().trim()));

  // Common role skill expectations
  const roleSkillMap = {
    java: ['Spring Boot', 'Hibernate', 'REST API', 'Microservices', 'Docker', 'SQL'],
    frontend: ['React', 'TypeScript', 'Next.js', 'Redux', 'Tailwind', 'CSS'],
    data: ['SQL', 'Python', 'Power BI', 'Tableau', 'Pandas', 'Data Analysis'],
    cloud: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
    devops: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform', 'GitHub Actions'],
    fullstack: ['Spring Boot', 'React', 'REST API', 'Docker', 'TypeScript', 'SQL'],
  };

  let expectedSkills = [];
  for (const [key, skills] of Object.entries(roleSkillMap)) {
    if (targetRoleLower.includes(key)) {
      expectedSkills.push(...skills);
    }
  }
  if (!expectedSkills.length) {
    expectedSkills = ['Spring Boot', 'React', 'SQL', 'Docker', 'AWS'];
  }

  const missingSkills = expectedSkills.filter((s) => !userSkillNames.has(s.toLowerCase()));

  const skillGaps = missingSkills.slice(0, 6).map((skill, idx) => ({
    skill,
    importance: idx < 2 ? 'HIGH' : idx < 4 ? 'MEDIUM' : 'LOW',
    reason: `Core competency required for your target role as a ${targetRole}.`,
  }));

  const completedSet = new Set(completedCourseIds);
  const matchedCourses = [];
  let priority = 1;

  for (const c of availableCourses) {
    const courseId = String(c._id);
    if (completedSet.has(courseId)) continue;

    const courseSkills = (c.skills || []).map((s) => s.toLowerCase());
    const overlaps = missingSkills.filter((ms) => courseSkills.includes(ms.toLowerCase()));

    if (overlaps.length > 0 || c.targetRoles?.some((tr) => targetRoleLower.includes(tr.toLowerCase()))) {
      matchedCourses.push({
        courseId,
        title: c.title,
        provider: c.provider,
        level: c.level || 'Beginner',
        duration: c.duration,
        url: c.url,
        priority: priority++,
        importance: overlaps.length > 1 ? 'HIGH' : 'MEDIUM',
        reason: `Directly builds your skills in ${overlaps.length ? overlaps.join(', ') : c.title}, tailored to your ${targetRole} goal.`,
        skillsCovered: c.skills || [],
      });
      if (matchedCourses.length >= 4) break;
    }
  }

  // If still empty, add top available courses
  if (!matchedCourses.length) {
    for (const c of availableCourses.slice(0, 3)) {
      const courseId = String(c._id);
      if (!completedSet.has(courseId)) {
        matchedCourses.push({
          courseId,
          title: c.title,
          provider: c.provider,
          level: c.level || 'Beginner',
          duration: c.duration,
          url: c.url,
          priority: priority++,
          importance: 'MEDIUM',
          reason: `Foundational curriculum recommended for ${targetRole}.`,
          skillsCovered: c.skills || [],
        });
      }
    }
  }

  // Certifications
  const existingCertNames = new Set((user.certifications || []).map((c) => c.name.toLowerCase().trim()));
  const matchedCerts = [];
  let certPriority = 1;

  for (const cert of availableCerts) {
    const certId = String(cert._id);
    if (existingCertNames.has(cert.name.toLowerCase().trim())) continue;

    const certSkills = (cert.skills || []).map((s) => s.toLowerCase());
    const overlaps = missingSkills.filter((ms) => certSkills.includes(ms.toLowerCase()));

    if (overlaps.length > 0 || cert.targetRoles?.some((tr) => targetRoleLower.includes(tr.toLowerCase()))) {
      matchedCerts.push({
        certificationId: certId,
        name: cert.name,
        provider: cert.provider,
        level: cert.level,
        officialUrl: cert.officialUrl,
        preparationTime: cert.preparationTime,
        cost: cert.cost,
        priority: certPriority++,
        importance: 'HIGH',
        reason: `Validates industry knowledge in ${cert.skills?.slice(0, 3).join(', ') || cert.name} for ${targetRole}.`,
      });
      if (matchedCerts.length >= 3) break;
    }
  }

  if (!matchedCerts.length) {
    for (const cert of availableCerts.slice(0, 2)) {
      matchedCerts.push({
        certificationId: String(cert._id),
        name: cert.name,
        provider: cert.provider,
        level: cert.level,
        officialUrl: cert.officialUrl,
        preparationTime: cert.preparationTime,
        cost: cert.cost,
        priority: certPriority++,
        importance: 'MEDIUM',
        reason: `Professional credential to demonstrate verified competency in ${targetRole}.`,
      });
    }
  }

  // Learning path
  const learningPath = [];
  let step = 1;
  for (const c of matchedCourses) {
    learningPath.push({
      step: step++,
      type: 'COURSE',
      resourceId: c.courseId,
      title: c.title,
      provider: c.provider,
      level: c.level,
      url: c.url,
      reason: c.reason,
      skillsCovered: c.skillsCovered,
    });
  }
  for (const cert of matchedCerts) {
    learningPath.push({
      step: step++,
      type: 'CERTIFICATION',
      resourceId: cert.certificationId,
      title: cert.name,
      provider: cert.provider,
      level: cert.level,
      url: cert.officialUrl,
      reason: 'Validate and demonstrate your verified skills to recruiters.',
      skillsCovered: [],
    });
  }

  return {
    summary: `Curated ${matchedCourses.length} course(s) and ${matchedCerts.length} certification(s) to address ${skillGaps.length} skill gap(s) for your target role as ${targetRole}.`,
    skillGaps,
    courseRecommendations: matchedCourses,
    certificationRecommendations: matchedCerts,
    learningPath,
    source: 'rule_based',
  };
};

/**
 * Main Service: Fetches, caches, and generates AI-powered recommendations.
 * @param {Object} user - Authenticated User Mongoose doc
 * @param {Object} options - { forceRefresh: boolean }
 */
export const getUserCareerRecommendations = async (user, { forceRefresh = false } = {}) => {
  // 1. Check profile completeness
  if (isProfileIncomplete(user)) {
    return {
      isIncomplete: true,
      message: 'Complete your career profile to unlock AI-powered recommendations.',
      requiredFields: ['Target Career (targetJobRole)', 'Skills'],
    };
  }

  const userId = user._id;
  const completedCourseIds = await getCompletedCourses(userId);
  const currentProfileHash = computeProfileHash(user, completedCourseIds);

  // 2. Check existing cache
  const cached = await RecommendationCache.findOne({ user: userId });

  if (cached) {
    const now = new Date();
    const ageHours = (now - new Date(cached.generatedAt)) / (1000 * 60 * 60);
    const secondsSinceLastGen = (now - new Date(cached.generatedAt)) / 1000;

    // Rate limiting: cooldown protection against refresh spam
    if (forceRefresh && secondsSinceLastGen < COOLDOWN_SECONDS) {
      const waitRemaining = Math.ceil(COOLDOWN_SECONDS - secondsSinceLastGen);
      return {
        ...cached.recommendations.toObject(),
        cached: true,
        cooldownRemaining: waitRemaining,
        rateLimitedNotice: `Please wait ${waitRemaining}s before requesting a fresh AI analysis.`,
        generatedAt: cached.generatedAt,
      };
    }

    // Return cached if not forcing refresh and profile has not changed and within TTL
    if (!forceRefresh && cached.profileHash === currentProfileHash && ageHours < CACHE_TTL_HOURS) {
      return {
        ...cached.recommendations.toObject(),
        cached: true,
        generatedAt: cached.generatedAt,
      };
    }
  }

  // 3. Fetch available courses and certifications from MongoDB
  const [courses, certifications] = await Promise.all([
    Course.find({ isActive: { $ne: false } }).lean(),
    Certification.find({ isActive: { $ne: false } }).lean(),
  ]);

  // Index resources by string ID for fast O(1) existence and detail lookups
  const courseMap = new Map(courses.map((c) => [String(c._id), c]));
  const certMap = new Map(certifications.map((c) => [String(c._id), c]));

  const completedSet = new Set(completedCourseIds);
  const existingCertNames = new Set((user.certifications || []).map((c) => c.name.toLowerCase().trim()));

  // Filter available resources passed to Gemini
  const availableCourses = courses
    .filter((c) => !completedSet.has(String(c._id)))
    .map((c) => ({
      id: String(c._id),
      title: c.title,
      provider: c.provider || '',
      description: c.description || '',
      skills: c.skills || [],
      level: c.level || 'Beginner',
      duration: c.duration || '',
      url: c.url || '',
    }));

  const availableCertifications = certifications
    .filter((cert) => !existingCertNames.has(cert.name.toLowerCase().trim()))
    .map((cert) => ({
      id: String(cert._id),
      name: cert.name,
      provider: cert.provider || '',
      description: cert.description || '',
      skills: cert.skills || [],
      level: cert.level || 'Intermediate',
      preparation_time: cert.preparationTime || '',
      cost: cert.cost || '',
      official_url: cert.officialUrl || '',
    }));

  // Build sanitised user profile payload (DO NOT send sensitive tokens, passwords or hashes)
  const userProfilePayload = {
    name: user.name || 'Student',
    target_role: user.careerGoals?.targetJobRole || 'Software Engineer',
    skills: (user.skills || []).map((s) => s.name),
    skill_levels: Object.fromEntries((user.skills || []).map((s) => [s.name, s.proficiency || 'Beginner'])),
    education: [user.education?.degree, user.education?.branch, user.education?.college].filter(Boolean).join(', '),
    experience: user.experienceLevel || user.education?.currentYear || 'Fresher',
    projects: (user.projects || []).map((p) => p.name),
    interests: user.interests || [],
    existing_certifications: (user.certifications || []).map((c) => c.name),
    completed_courses: completedCourseIds,
  };

  let validatedRecommendations;
  let source = 'gemini';

  try {
    // 4. Call Gemini AI via existing AI service
    const aiResponse = await getCourseAndCertRecommendations({
      user_profile: userProfilePayload,
      available_courses: availableCourses,
      available_certifications: availableCertifications,
    });

    // 5. STRICT VALIDATION: Check that every single ID exists in MongoDB
    const validatedCourses = [];
    const seenCourseIds = new Set(completedCourseIds);

    for (const item of aiResponse.courseRecommendations || []) {
      const courseDoc = courseMap.get(String(item.courseId));
      if (!courseDoc) {
        // Hallucinated or non-existent course ID -> REMOVE
        console.warn(`[Validation] Discarded non-existent courseId from Gemini: ${item.courseId}`);
        continue;
      }
      if (seenCourseIds.has(String(courseDoc._id))) {
        continue; // duplicate or completed
      }
      seenCourseIds.add(String(courseDoc._id));

      validatedCourses.push({
        courseId: String(courseDoc._id),
        title: courseDoc.title,
        provider: courseDoc.provider || '',
        level: courseDoc.level || 'Beginner',
        duration: courseDoc.duration || '',
        url: courseDoc.url || '',
        priority: item.priority || validatedCourses.length + 1,
        importance: item.importance || 'HIGH',
        reason: item.reason || `Covers key skills required for ${userProfilePayload.target_role}.`,
        skillsCovered: item.skillsCovered?.length ? item.skillsCovered : courseDoc.skills || [],
      });
    }

    const validatedCerts = [];
    const seenCertIds = new Set();

    for (const item of aiResponse.certificationRecommendations || []) {
      const certDoc = certMap.get(String(item.certificationId));
      if (!certDoc) {
        // Hallucinated or non-existent certification ID -> REMOVE
        console.warn(`[Validation] Discarded non-existent certificationId from Gemini: ${item.certificationId}`);
        continue;
      }
      if (seenCertIds.has(String(certDoc._id))) continue;
      seenCertIds.add(String(certDoc._id));

      validatedCerts.push({
        certificationId: String(certDoc._id),
        name: certDoc.name,
        provider: certDoc.provider || '',
        level: certDoc.level || 'Intermediate',
        officialUrl: certDoc.officialUrl || '',
        preparationTime: certDoc.preparationTime || '',
        cost: certDoc.cost || '',
        priority: item.priority || validatedCerts.length + 1,
        importance: item.importance || 'HIGH',
        reason: item.reason || `Industry-recognized credential validating competencies for ${userProfilePayload.target_role}.`,
      });
    }

    // Validate Learning Path steps
    const validatedPath = [];
    let stepNumber = 1;

    for (const step of aiResponse.learningPath || []) {
      const resId = String(step.resourceId);
      if (step.type === 'COURSE') {
        const cDoc = courseMap.get(resId);
        if (cDoc) {
          validatedPath.push({
            step: stepNumber++,
            type: 'COURSE',
            resourceId: resId,
            title: cDoc.title,
            provider: cDoc.provider || '',
            level: cDoc.level || 'Beginner',
            url: cDoc.url || '',
            reason: step.reason || 'Foundational knowledge development.',
            skillsCovered: cDoc.skills || [],
          });
        }
      } else if (step.type === 'CERTIFICATION') {
        const certDoc = certMap.get(resId);
        if (certDoc) {
          validatedPath.push({
            step: stepNumber++,
            type: 'CERTIFICATION',
            resourceId: resId,
            title: certDoc.name,
            provider: certDoc.provider || '',
            level: certDoc.level || 'Intermediate',
            url: certDoc.officialUrl || '',
            reason: step.reason || 'Validate acquired skills with professional credential.',
            skillsCovered: certDoc.skills || [],
          });
        }
      }
    }

    // If Gemini failed to recommend valid courses or certs, augment with rule-based items
    if (!validatedCourses.length || !validatedCerts.length) {
      console.warn('[Validation] Augmenting insufficient Gemini recommendations with rule-based matches.');
      const fallback = generateRuleBasedRecommendations(user, courses, certifications, completedCourseIds);
      if (!validatedCourses.length) validatedCourses.push(...fallback.courseRecommendations);
      if (!validatedCerts.length) validatedCerts.push(...fallback.certificationRecommendations);
      if (!validatedPath.length) validatedPath.push(...fallback.learningPath);
    }

    validatedRecommendations = {
      summary: aiResponse.summary || `Personalized career roadmap tailored for ${userProfilePayload.target_role}.`,
      skillGaps: aiResponse.skillGaps || [],
      courseRecommendations: validatedCourses,
      certificationRecommendations: validatedCerts,
      learningPath: validatedPath,
      source: 'gemini',
    };
  } catch (err) {
    console.error('Gemini Recommendation failed, triggering rule-based fallback:', err.message);
    validatedRecommendations = generateRuleBasedRecommendations(user, courses, certifications, completedCourseIds);
    source = 'rule_based';
  }

  // 6. Update cache in MongoDB
  await RecommendationCache.findOneAndUpdate(
    { user: userId },
    {
      profileHash: currentProfileHash,
      recommendations: validatedRecommendations,
      generatedAt: new Date(),
      lastRequestedAt: new Date(),
      source,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    ...validatedRecommendations,
    cached: false,
    generatedAt: new Date(),
  };
};

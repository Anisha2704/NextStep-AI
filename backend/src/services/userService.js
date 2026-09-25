import User from '../models/User.js';
import { publishNotification } from './notificationService.js';

const PROFILE_WEIGHTS = {
  basicInfo: 15,
  education: 20,
  skills: 20,
  interests: 10,
  careerGoals: 20,
  projects: 10,
  certifications: 5,
};

const isFilled = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') {
    return Object.values(value).some((v) => isFilled(v));
  }
  return Boolean(value);
};

export const calculateProfileCompletion = (user) => {
  let score = 0;
  const recommendations = [];

  const basicFields = [user.name, user.email, user.bio, user.location, user.phone];
  const basicFilled = basicFields.filter((f) => isFilled(f)).length;
  const basicScore = Math.round((basicFilled / basicFields.length) * PROFILE_WEIGHTS.basicInfo);
  score += basicScore;
  if (basicScore < PROFILE_WEIGHTS.basicInfo) {
    recommendations.push('Complete your basic information (bio, location, phone)');
  }

  const eduFields = user.education || {};
  const eduKeys = ['level', 'college', 'degree', 'branch', 'currentYear', 'graduationYear', 'cgpa'];
  const eduFilled = eduKeys.filter((k) => isFilled(eduFields[k])).length;
  const eduScore = Math.round((eduFilled / eduKeys.length) * PROFILE_WEIGHTS.education);
  score += eduScore;
  if (eduScore < PROFILE_WEIGHTS.education) {
    recommendations.push('Complete your education details');
  }

  const skillsCount = user.skills?.length || 0;
  let skillsScore = 0;
  if (skillsCount >= 3) {
    skillsScore = PROFILE_WEIGHTS.skills;
  } else if (skillsCount > 0) {
    skillsScore = Math.round((skillsCount / 3) * PROFILE_WEIGHTS.skills);
    recommendations.push('Add at least 3 skills');
  } else {
    recommendations.push('Add at least 3 skills');
  }
  score += skillsScore;

  const interestsScore = (user.interests?.length || 0) > 0 ? PROFILE_WEIGHTS.interests : 0;
  score += interestsScore;
  if (interestsScore === 0) {
    recommendations.push('Add your interests');
  }

  const goalFields = user.careerGoals || {};
  const goalKeys = ['targetJobRole', 'targetIndustry', 'preferredWorkType', 'preferredLocation', 'description', 'preferredDomains'];
  const goalFilled = goalKeys.filter((k) => isFilled(goalFields[k])).length;
  const goalScore = Math.round((goalFilled / goalKeys.length) * PROFILE_WEIGHTS.careerGoals);
  score += goalScore;
  if (goalScore < PROFILE_WEIGHTS.careerGoals) {
    recommendations.push('Add your target career goals');
  }

  const projectsCount = user.projects?.length || 0;
  let projectsScore = 0;
  if (projectsCount >= 1) {
    projectsScore = PROFILE_WEIGHTS.projects;
  } else {
    recommendations.push('Complete your Projects section');
  }
  score += projectsScore;

  const certScore = (user.certifications?.length || 0) > 0 ? PROFILE_WEIGHTS.certifications : 0;
  score += certScore;
  if (certScore === 0) {
    recommendations.push('Add certifications to boost your profile');
  }

  return {
    percentage: Math.min(100, score),
    breakdown: {
      basicInfo: basicScore,
      education: eduScore,
      skills: skillsScore,
      interests: interestsScore,
      careerGoals: goalScore,
      projects: projectsScore,
      certifications: certScore,
    },
    recommendations: recommendations.slice(0, 4),
  };
};

export const getProfile = async (userId) => {
  const user = await User.findById(userId).select('+profileInitialized');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const profile = user.toSafeObject();
  profile.profileInitialized = user.profileInitialized;
  profile.profileCompletion = calculateProfileCompletion(user);
  return profile;
};

export const updateProfile = async (userId, updates) => {
  const user = await User.findById(userId).select('+profileInitialized');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isFirstSetup = user.profileInitialized !== true;
  const allowedFields = [
    'name',
    'bio',
    'profilePhoto',
    'location',
    'phone',
    'education',
    'interests',
    'careerGoals',
    'experienceLevel',
  ];

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      if (field === 'education' || field === 'careerGoals') {
        user[field] = { ...user[field]?.toObject?.() || user[field], ...updates[field] };
      } else {
        user[field] = updates[field];
      }
    }
  });

  user.profileInitialized = true;
  await user.save();
  const profile = user.toSafeObject();
  profile.profileInitialized = true;
  profile.profileCompletion = calculateProfileCompletion(user);
  if (isFirstSetup) {
    await publishNotification({
      userId,
      type: 'profile',
      title: 'Student profile created',
      message: 'Your profile is ready. Add your skills, education, and career goals to improve recommendations.',
      link: '/profile',
    });
  }
  return profile;
};

export const createProfile = async (userId, profileData) => {
  const allowedFields = ['name', 'bio', 'profilePhoto', 'location', 'phone', 'education', 'interests', 'careerGoals', 'experienceLevel'];
  const updates = { profileInitialized: true };
  for (const field of allowedFields) {
    if (profileData[field] !== undefined) {
      if (field === 'education' || field === 'careerGoals') {
        for (const [nestedField, value] of Object.entries(profileData[field])) {
          updates[`${field}.${nestedField}`] = value;
        }
      } else {
        updates[field] = profileData[field];
      }
    }
  }
  const user = await User.findOneAndUpdate(
    { _id: userId, profileInitialized: { $ne: true } },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!user) {
    const exists = await User.exists({ _id: userId });
    const error = new Error(exists ? 'Profile already exists. Update the existing profile instead.' : 'User not found');
    error.statusCode = exists ? 409 : 404;
    throw error;
  }
  const profile = user.toSafeObject();
  profile.profileInitialized = true;
  profile.profileCompletion = calculateProfileCompletion(user);
  await publishNotification({
    userId,
    type: 'profile',
    title: 'Student profile created',
    message: 'Your profile is ready. Add your skills, education, and career goals to improve recommendations.',
    link: '/profile',
  });
  return profile;
};

export const deleteProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  user.bio = '';
  user.profilePhoto = '';
  user.location = '';
  user.phone = '';
  user.education = {};
  user.experienceLevel = '';
  user.skills = [];
  user.interests = [];
  user.careerGoals = {};
  user.projects = [];
  user.certifications = [];
  user.profileInitialized = false;
  await user.save();
};

export const addSkill = async (userId, skillData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.skills.length >= 50) {
    const error = new Error('A maximum of 50 skills is allowed');
    error.statusCode = 400;
    throw error;
  }

  user.skills.push(skillData);
  await user.save();
  return user.skills[user.skills.length - 1];
};

export const updateSkill = async (userId, skillId, skillData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const skill = user.skills.id(skillId);
  if (!skill) {
    const error = new Error('Skill not found');
    error.statusCode = 404;
    throw error;
  }

  Object.assign(skill, skillData);
  await user.save();
  return skill;
};

export const deleteSkill = async (userId, skillId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const skill = user.skills.id(skillId);
  if (!skill) {
    const error = new Error('Skill not found');
    error.statusCode = 404;
    throw error;
  }

  user.skills.pull(skillId);
  await user.save();
  return { message: 'Skill deleted' };
};

export const addProject = async (userId, projectData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.projects.push(projectData);
  await user.save();
  return user.projects[user.projects.length - 1];
};

export const updateProject = async (userId, projectId, projectData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const project = user.projects.id(projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  Object.assign(project, projectData);
  await user.save();
  return project;
};

export const deleteProject = async (userId, projectId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const project = user.projects.id(projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  user.projects.pull(projectId);
  await user.save();
  return { message: 'Project deleted' };
};

export const addCertification = async (userId, certData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.certifications.push(certData);
  await user.save();
  return user.certifications[user.certifications.length - 1];
};

export const deleteCertification = async (userId, certId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const cert = user.certifications.id(certId);
  if (!cert) {
    const error = new Error('Certification not found');
    error.statusCode = 404;
    throw error;
  }

  user.certifications.pull(certId);
  await user.save();
  return { message: 'Certification deleted' };
};

import { body } from 'express-validator';
import { EDUCATION_LEVELS, EXPERIENCE_LEVELS, SKILL_PROFICIENCIES, WORK_TYPES } from '../constants/profile.js';
const PROFILE_KEYS = ['name', 'bio', 'profilePhoto', 'location', 'phone', 'education', 'experienceLevel', 'interests', 'careerGoals'];
const EDUCATION_KEYS = ['level', 'college', 'degree', 'branch', 'currentYear', 'graduationYear', 'cgpa'];
const CAREER_KEYS = ['targetJobRole', 'targetIndustry', 'preferredWorkType', 'preferredLocation', 'description', 'preferredDomains'];

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const validString = (value, max, { allowEmpty = true } = {}) =>
  typeof value === 'string' && value.trim().length <= max && (allowEmpty || value.trim().length > 0);
const hasOnlyKeys = (value, keys) => Object.keys(value).every((key) => keys.includes(key));

const validateProfileBody = (value) => {
  if (!isPlainObject(value) || Object.keys(value).length === 0 || !hasOnlyKeys(value, PROFILE_KEYS)) return false;
  if (value.name !== undefined && !validString(value.name, 100, { allowEmpty: false })) return false;
  for (const key of ['bio', 'profilePhoto', 'location', 'phone']) {
    if (value[key] !== undefined && !validString(value[key], key === 'bio' ? 1000 : 240)) return false;
  }
  if (value.experienceLevel !== undefined && value.experienceLevel !== '' && !EXPERIENCE_LEVELS.includes(value.experienceLevel)) return false;
  if (value.interests !== undefined && (!Array.isArray(value.interests) || value.interests.length > 20 || value.interests.some((item) => !validString(item, 60, { allowEmpty: false })) || new Set(value.interests.map((item) => item.trim().toLowerCase())).size !== value.interests.length)) return false;

  const education = value.education;
  if (education !== undefined) {
    if (!isPlainObject(education) || !hasOnlyKeys(education, EDUCATION_KEYS)) return false;
    if (education.level !== undefined && education.level !== '' && !EDUCATION_LEVELS.includes(education.level)) return false;
    for (const key of ['college', 'degree', 'branch', 'currentYear', 'cgpa']) {
      if (education[key] !== undefined && !validString(education[key], key === 'college' ? 160 : 120)) return false;
    }
    if (education.graduationYear !== undefined && education.graduationYear !== '' && (!Number.isInteger(education.graduationYear) || education.graduationYear < 1950 || education.graduationYear > 2150)) return false;
  }

  const goals = value.careerGoals;
  if (goals !== undefined) {
    if (!isPlainObject(goals) || !hasOnlyKeys(goals, CAREER_KEYS)) return false;
    for (const key of ['targetJobRole', 'targetIndustry', 'preferredLocation']) {
      if (goals[key] !== undefined && !validString(goals[key], 120)) return false;
    }
    if (goals.description !== undefined && !validString(goals.description, 1000)) return false;
    if (goals.preferredWorkType !== undefined && goals.preferredWorkType !== '' && !WORK_TYPES.includes(goals.preferredWorkType)) return false;
    if (goals.preferredDomains !== undefined && (!Array.isArray(goals.preferredDomains) || goals.preferredDomains.length > 12 || goals.preferredDomains.some((item) => !validString(item, 60, { allowEmpty: false })) || new Set(goals.preferredDomains.map((item) => item.trim().toLowerCase())).size !== goals.preferredDomains.length)) return false;
  }
  return true;
};

export const profileValidation = [
  body().custom((value) => {
    if (!validateProfileBody(value)) throw new Error('Profile contains invalid, unsupported, or oversized fields');
    return true;
  }),
];

export const skillValidation = [
  body().custom((value) => {
    const keys = ['name', 'category', 'proficiency', 'yearsOfExperience'];
    if (!isPlainObject(value) || !hasOnlyKeys(value, keys) || !validString(value.name, 80, { allowEmpty: false })) throw new Error('Provide a valid skill name');
    if (value.category !== undefined && !validString(value.category, 60)) throw new Error('Invalid skill category');
    if (value.proficiency !== undefined && !SKILL_PROFICIENCIES.includes(value.proficiency)) throw new Error('Invalid skill proficiency');
    if (value.yearsOfExperience !== undefined && (!Number.isFinite(value.yearsOfExperience) || value.yearsOfExperience < 0 || value.yearsOfExperience > 80)) throw new Error('Invalid years of experience');
    return true;
  }),
];

export const skillUpdateValidation = [
  body().custom((value) => {
    const allowedKeys = ['name', 'category', 'proficiency', 'yearsOfExperience'];
    if (!isPlainObject(value) || Object.keys(value).length === 0 || !hasOnlyKeys(value, allowedKeys)) throw new Error('Provide valid skill fields');
    if (value.name !== undefined && !validString(value.name, 80, { allowEmpty: false })) throw new Error('Provide a valid skill name');
    if (value.category !== undefined && !validString(value.category, 60)) throw new Error('Invalid skill category');
    if (value.proficiency !== undefined && !SKILL_PROFICIENCIES.includes(value.proficiency)) throw new Error('Invalid skill proficiency');
    if (value.yearsOfExperience !== undefined && (!Number.isFinite(value.yearsOfExperience) || value.yearsOfExperience < 0 || value.yearsOfExperience > 80)) throw new Error('Invalid years of experience');
    return true;
  }),
];

import mongoose from 'mongoose';
import Resume from '../models/Resume.js';
import { analyzeResumeFile as requestResumeFile, analyzeResumeText as requestResumeText } from './aiService.js';
import { publishNotification } from './notificationService.js';

const serviceError = (statusCode, message) => Object.assign(new Error(message), { statusCode });
const ANALYSIS_FIELDS = ['overallScore', 'summary', 'strengths', 'improvements', 'missingKeywords', 'sectionReviews', 'actionPlan'];
const sectionStatuses = new Set(['strong', 'needs_work', 'missing']);

const sanitizeFileName = (fileName) => String(fileName || 'Resume')
  .replace(/[\\/\u0000-\u001f\u007f]/g, '')
  .replace(/[^\p{L}\p{N}._ -]/gu, '')
  .trim()
  .slice(0, 160) || 'Resume';

const validateAnalysis = (payload) => {
  if (!payload || typeof payload !== 'object' || Object.keys(payload).some((key) => !['analysis', 'wordCount', 'analysisSource', 'notice'].includes(key))) {
    throw serviceError(502, 'The resume service returned an invalid analysis. Please try again.');
  }
  const { analysis, wordCount, analysisSource = 'ai', notice = '' } = payload;
  if (!Number.isInteger(wordCount) || wordCount < 1 || wordCount > 20000
    || !['ai', 'rule_based'].includes(analysisSource)
    || typeof notice !== 'string' || notice.length > 300
    || !analysis || typeof analysis !== 'object'
    || Object.keys(analysis).some((key) => !ANALYSIS_FIELDS.includes(key))
    || !Number.isInteger(analysis.overallScore) || analysis.overallScore < 0 || analysis.overallScore > 100
    || typeof analysis.summary !== 'string' || analysis.summary.trim().length < 20 || analysis.summary.length > 1200) {
    throw serviceError(502, 'The resume service returned an invalid analysis. Please try again.');
  }
  const boundedStrings = [
    ['strengths', 8, 300], ['improvements', 10, 400], ['missingKeywords', 20, 80], ['actionPlan', 8, 400],
  ];
  for (const [field, maxItems, maxLength] of boundedStrings) {
    const values = analysis[field];
    if (!Array.isArray(values) || values.length > maxItems || values.some((value) => typeof value !== 'string' || !value.trim() || value.length > maxLength)) {
      throw serviceError(502, 'The resume service returned an invalid analysis. Please try again.');
    }
  }
  if (analysis.improvements.length < 1 || analysis.actionPlan.length < 1
    || !Array.isArray(analysis.sectionReviews) || analysis.sectionReviews.length > 12
    || analysis.sectionReviews.some((section) => (
      !section || typeof section.section !== 'string' || !section.section.trim() || section.section.length > 80
      || !sectionStatuses.has(section.status) || !Number.isInteger(section.score)
      || section.score < 0 || section.score > 100 || typeof section.feedback !== 'string'
      || !section.feedback.trim() || section.feedback.length > 500
    ))) {
    throw serviceError(502, 'The resume service returned an invalid analysis. Please try again.');
  }
  return { analysis, wordCount, analysisSource, notice };
};

const serializeResume = (resume) => {
  const value = resume.toObject ? resume.toObject() : resume;
  const legacy = !value.analysis || !Number.isInteger(value.analysis.overallScore);
  const previousAnalysis = value.analysis || {};
  const analysis = legacy ? {
    overallScore: Number.isInteger(previousAnalysis.score) ? previousAnalysis.score : 0,
    summary: 'This is a saved resume review from an earlier version.',
    strengths: (previousAnalysis.strengths || []).slice(0, 8),
    improvements: (previousAnalysis.weaknesses || ['Run a new analysis for detailed section feedback.']).slice(0, 10),
    missingKeywords: [],
    sectionReviews: [],
    actionPlan: previousAnalysis.suggestions?.length ? previousAnalysis.suggestions.slice(0, 8) : ['Run a new analysis to get updated recommendations.'],
  } : value.analysis;
  return {
    id: String(value._id || value.id),
    fileName: value.fileName,
    sourceType: value.sourceType || 'pasted',
    targetRole: value.targetRole,
    wordCount: value.wordCount || 0,
    analysis,
    analysisSource: value.analysisSource || 'ai',
    notice: value.notice || '',
    analyzedAt: value.analyzedAt,
  };
};

const saveAnalysis = async (userId, { fileName, sourceType, targetRole, response }) => {
  const { analysis, wordCount, analysisSource, notice } = validateAnalysis(response);
  const resume = await Resume.create({
    user: userId,
    fileName: sanitizeFileName(fileName),
    sourceType,
    targetRole: targetRole.trim(),
    wordCount,
    analysis,
    analysisSource,
    notice,
    analyzedAt: new Date(),
  });
  await publishNotification({
    userId,
    type: 'resume',
    title: 'Resume review is ready',
    message: analysisSource === 'rule_based'
      ? 'Gemini quota is currently reached. A clearly labeled checklist review has been saved; run it again after quota is available for AI feedback.'
      : 'Your AI resume review has been saved. Open it to see section feedback and prioritized next steps.',
    link: '/resume',
  });
  return serializeResume(resume);
};

export const analyzePastedResume = async (userId, { resumeText, targetRole = '' }) => {
  if (typeof resumeText !== 'string' || resumeText.trim().length < 100 || resumeText.length > 20000) {
    throw serviceError(400, 'Resume text must be between 100 and 20,000 characters.');
  }
  if (typeof targetRole !== 'string' || targetRole.length > 120) {
    throw serviceError(400, 'Target role must be 120 characters or fewer.');
  }
  const response = await requestResumeText({ resumeText: resumeText.trim(), targetRole: targetRole.trim() });
  return saveAnalysis(userId, {
    fileName: 'Pasted resume text', sourceType: 'pasted', targetRole, response,
  });
};

export const analyzeUploadedResume = async (userId, { fileBuffer, fileName, contentType, targetRole = '' }) => {
  if (!Buffer.isBuffer(fileBuffer) || !fileBuffer.length || fileBuffer.length > 4 * 1024 * 1024) {
    throw serviceError(400, 'Resume files must be smaller than 4 MB.');
  }
  if (typeof targetRole !== 'string' || targetRole.length > 120) {
    throw serviceError(400, 'Target role must be 120 characters or fewer.');
  }
  const normalizedName = sanitizeFileName(fileName);
  const extension = normalizedName.toLowerCase().split('.').pop();
  if (extension === 'pdf' && contentType === 'application/pdf') {
    if (!fileBuffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
      throw serviceError(400, 'The uploaded file is not a valid PDF.');
    }
  } else if (extension !== 'txt' || contentType !== 'text/plain') {
    throw serviceError(415, 'Upload a PDF or UTF-8 text file.');
  }
  const response = await requestResumeFile({
    fileBuffer, fileName: normalizedName, contentType, targetRole: targetRole.trim(),
  });
  return saveAnalysis(userId, {
    fileName: normalizedName,
    sourceType: extension === 'pdf' ? 'pdf' : 'text',
    targetRole,
    response,
  });
};

export const listResumeAnalyses = async (userId) => {
  const resumes = await Resume.find({ user: userId }).sort({ analyzedAt: -1 }).limit(20).lean();
  return resumes.map(serializeResume);
};

export const getResumeAnalysis = async (userId, resumeId) => {
  if (!mongoose.isValidObjectId(resumeId)) throw serviceError(400, 'Invalid resume analysis ID.');
  const resume = await Resume.findOne({ _id: resumeId, user: userId }).lean();
  if (!resume) throw serviceError(404, 'Resume analysis not found.');
  return serializeResume(resume);
};

export const deleteResumeAnalysis = async (userId, resumeId) => {
  if (!mongoose.isValidObjectId(resumeId)) throw serviceError(400, 'Invalid resume analysis ID.');
  const deleted = await Resume.findOneAndDelete({ _id: resumeId, user: userId });
  if (!deleted) throw serviceError(404, 'Resume analysis not found.');
};

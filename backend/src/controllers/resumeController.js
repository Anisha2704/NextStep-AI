import { validationResult } from 'express-validator';
import { sendError, sendSuccess } from '../utils/response.js';
import {
  analyzePastedResume,
  analyzeUploadedResume,
  deleteResumeAnalysis as removeResumeAnalysis,
  getResumeAnalysis as readResumeAnalysis,
  listResumeAnalyses as readResumeAnalyses,
} from '../services/resumeService.js';

const sendValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  sendError(res, 400, 'Validation failed', errors.array().map(({ msg, path }) => ({ field: path, message: msg })));
  return true;
};

export const listResumeAnalyses = async (req, res, next) => {
  try {
    const analyses = await readResumeAnalyses(req.user._id);
    return sendSuccess(res, 200, 'Resume analyses retrieved', { analyses });
  } catch (error) { return next(error); }
};

export const analyzePastedResumeController = async (req, res, next) => {
  try {
    if (sendValidationErrors(req, res)) return;
    const analysis = await analyzePastedResume(req.user._id, req.body);
    return sendSuccess(res, 201, 'Resume analyzed successfully', { analysis });
  } catch (error) {
    if (error.statusCode) return sendError(res, error.statusCode, error.message);
    return next(error);
  }
};

export const analyzeUploadedResumeController = async (req, res, next) => {
  try {
    if (!Buffer.isBuffer(req.body)) return sendError(res, 400, 'Upload a PDF or text resume.');
    if (req.query.targetRole !== undefined && typeof req.query.targetRole !== 'string') {
      return sendError(res, 400, 'Target role must be a single text value.');
    }
    const targetRole = req.query.targetRole || '';
    if (targetRole.length > 120) return sendError(res, 400, 'Target role must be 120 characters or fewer.');
    const encodedFileName = req.get('X-File-Name') || 'Resume';
    let fileName = encodedFileName;
    try { fileName = decodeURIComponent(encodedFileName); } catch { /* The service sanitizes malformed names. */ }
    const analysis = await analyzeUploadedResume(req.user._id, {
      fileBuffer: req.body,
      fileName,
      contentType: req.get('Content-Type')?.split(';')[0]?.trim().toLowerCase(),
      targetRole,
    });
    return sendSuccess(res, 201, 'Resume analyzed successfully', { analysis });
  } catch (error) {
    if (error.statusCode) return sendError(res, error.statusCode, error.message);
    return next(error);
  }
};

export const getResumeAnalysisController = async (req, res, next) => {
  try {
    const analysis = await readResumeAnalysis(req.user._id, req.params.resumeId);
    return sendSuccess(res, 200, 'Resume analysis retrieved', { analysis });
  } catch (error) {
    if (error.statusCode) return sendError(res, error.statusCode, error.message);
    return next(error);
  }
};

export const deleteResumeAnalysisController = async (req, res, next) => {
  try {
    await removeResumeAnalysis(req.user._id, req.params.resumeId);
    return sendSuccess(res, 200, 'Resume analysis deleted');
  } catch (error) {
    if (error.statusCode) return sendError(res, error.statusCode, error.message);
    return next(error);
  }
};

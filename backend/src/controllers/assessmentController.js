import { validationResult } from 'express-validator';
import { sendError, sendSuccess } from '../utils/response.js';
import {
  getAssessmentForStudent,
  getResultForUser,
  listAssessments,
  listResultsForUser,
  submitAssessment,
} from '../services/assessmentService.js';

const sendValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  sendError(res, 400, 'Validation failed', errors.array().map(({ msg, path }) => ({ field: path, message: msg })));
  return true;
};

export const listAssessmentsController = async (req, res, next) => {
  try {
    const assessments = await listAssessments();
    return sendSuccess(res, 200, 'Assessments retrieved', { assessments });
  } catch (error) {
    return next(error);
  }
};

export const getAssessmentController = async (req, res, next) => {
  try {
    const assessment = await getAssessmentForStudent(req.params.assessmentId);
    return sendSuccess(res, 200, 'Assessment retrieved', { assessment });
  } catch (error) {
    return next(error);
  }
};

export const submitAssessmentController = async (req, res, next) => {
  try {
    if (sendValidationErrors(req, res)) return;
    const result = await submitAssessment(req.user._id, req.params.assessmentId, req.body.answers);
    return sendSuccess(res, 201, 'Assessment submitted and scored', { result });
  } catch (error) {
    return next(error);
  }
};

export const listAssessmentResultsController = async (req, res, next) => {
  try {
    const results = await listResultsForUser(req.user._id);
    return sendSuccess(res, 200, 'Assessment history retrieved', { results });
  } catch (error) {
    return next(error);
  }
};

export const getAssessmentResultController = async (req, res, next) => {
  try {
    const result = await getResultForUser(req.user._id, req.params.resultId);
    return sendSuccess(res, 200, 'Assessment result retrieved', { result });
  } catch (error) {
    return next(error);
  }
};

import { validationResult } from 'express-validator';
import { sendError, sendSuccess } from '../utils/response.js';
import {
  generateRoadmapForUser,
  getRoadmapForUser,
  getRoadmapReadiness,
  updateRoadmapMilestone,
} from '../services/learningService.js';

const sendValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  sendError(res, 400, 'Validation failed', errors.array().map(({ msg, path }) => ({ field: path, message: msg })));
  return true;
};

export const getRoadmap = async (req, res, next) => {
  try {
    const roadmap = await getRoadmapForUser(req.user._id);
    return sendSuccess(res, 200, 'Learning roadmap retrieved', { roadmap });
  } catch (error) {
    return next(error);
  }
};

export const getRoadmapReadinessController = async (req, res, next) => {
  try {
    const { canGenerate, missing, targetRole } = await getRoadmapReadiness(req.user);
    return sendSuccess(res, 200, 'Roadmap prerequisites retrieved', {
      readiness: { canGenerate, missing, targetRole },
    });
  } catch (error) {
    return next(error);
  }
};

export const generateRoadmap = async (req, res, next) => {
  try {
    if (sendValidationErrors(req, res)) return;
    const roadmap = await generateRoadmapForUser(req.user, req.body.confirmRegeneration === true);
    return sendSuccess(res, 201, 'Learning roadmap generated successfully', { roadmap });
  } catch (error) {
    if (error.statusCode && error.statusCode < 500) {
      return sendError(res, error.statusCode, error.message);
    }
    if ([502, 503, 504].includes(error.statusCode)) {
      return sendError(res, error.statusCode, error.message);
    }
    return next(error);
  }
};

export const updateMilestone = async (req, res, next) => {
  try {
    if (sendValidationErrors(req, res)) return;
    const roadmap = await updateRoadmapMilestone(
      req.user._id,
      req.params.milestoneId,
      req.body.status
    );
    return sendSuccess(res, 200, 'Milestone progress updated', { roadmap });
  } catch (error) {
    return next(error);
  }
};

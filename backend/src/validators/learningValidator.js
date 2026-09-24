import { body, param } from 'express-validator';
import { sendError } from '../utils/response.js';

const rejectUnexpectedBodyFields = (allowedFields) => (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return sendError(res, 400, 'Request body must be a JSON object');
  }
  const unexpected = Object.keys(req.body || {}).filter((field) => !allowedFields.includes(field));
  if (unexpected.length) return sendError(res, 400, 'Request contains unsupported fields');
  return next();
};

export const roadmapGenerationValidation = [
  rejectUnexpectedBodyFields(['confirmRegeneration']),
  body('confirmRegeneration')
    .optional({ values: 'undefined' })
    .isBoolean({ strict: true })
    .withMessage('confirmRegeneration must be a boolean'),
];

export const milestoneStatusValidation = [
  rejectUnexpectedBodyFields(['status']),
  param('milestoneId').isMongoId().withMessage('Invalid milestone ID'),
  body('status')
    .isIn(['not_started', 'in_progress', 'completed'])
    .withMessage('Status must be not_started, in_progress, or completed'),
];

import { body } from 'express-validator';

export const resumeTextValidation = [
  body().custom((value) => (
    value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).every((key) => ['resumeText', 'targetRole'].includes(key))
  )).withMessage('Only resumeText and targetRole are accepted.'),
  body('resumeText').isString().withMessage('Resume text is required.')
    .bail().trim().isLength({ min: 100, max: 20000 })
    .withMessage('Resume text must be between 100 and 20,000 characters.'),
  body('targetRole').optional({ values: 'undefined' }).isString().withMessage('Target role must be text.')
    .bail().isLength({ max: 120 }).withMessage('Target role must be 120 characters or fewer.'),
];

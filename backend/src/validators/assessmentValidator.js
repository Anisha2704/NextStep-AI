import { body } from 'express-validator';

export const assessmentSubmissionValidation = [
  body().custom((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    if (Object.keys(value).some((key) => key !== 'answers') || !Array.isArray(value.answers)) return false;
    return value.answers.every((answer) => (
      answer && typeof answer === 'object' && !Array.isArray(answer)
      && Object.keys(answer).length === 2
      && Object.hasOwn(answer, 'questionId')
      && Object.hasOwn(answer, 'selectedOptionIndex')
    ));
  }).withMessage('Submit only an answers array with a question ID and selected option for each answer.'),
  body('answers').isArray({ min: 1, max: 50 }).withMessage('An assessment submission must include 1 to 50 answers.'),
  body('answers.*.questionId').isMongoId().withMessage('Every answer must reference a valid question.'),
  body('answers.*.selectedOptionIndex').isInt({ min: 0, max: 5 }).withMessage('Choose a valid answer option.'),
];

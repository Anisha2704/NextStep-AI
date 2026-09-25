import mongoose from 'mongoose';
import Assessment from '../models/Assessment.js';
import AssessmentResult from '../models/AssessmentResult.js';
import { publishNotification } from './notificationService.js';

const serviceError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

const serializeCatalogAssessment = (assessment) => ({
  id: String(assessment._id),
  slug: assessment.slug,
  version: assessment.version,
  title: assessment.title,
  description: assessment.description,
  subject: assessment.subject,
  subjectSlug: assessment.subjectSlug,
  topic: assessment.topic,
  topicSlug: assessment.topicSlug,
  skill: assessment.skill,
  category: assessment.category,
  difficulty: assessment.difficulty,
  durationMinutes: assessment.durationMinutes,
  passingScore: assessment.passingScore,
  questionCount: assessment.questions.length,
});

const serializeQuestion = (question, index) => ({
  id: String(question._id),
  number: index + 1,
  prompt: question.prompt,
  options: question.options,
  skill: question.skill,
});

const serializeResult = (result) => ({
  id: String(result._id),
  assessmentId: String(result.assessment),
  assessmentSlug: result.assessmentSlug,
  assessmentTitle: result.assessmentTitle,
  subject: result.subject,
  subjectSlug: result.subjectSlug,
  topic: result.topic,
  topicSlug: result.topicSlug,
  assessmentSkill: result.assessmentSkill,
  assessmentVersion: result.assessmentVersion,
  difficulty: result.difficulty,
  score: result.score,
  totalQuestions: result.totalQuestions,
  percentage: result.percentage,
  passingScore: result.passingScore,
  passed: result.passed,
  skillBreakdown: result.skillBreakdown,
  submittedAt: result.submittedAt,
  answers: result.answers,
});

const validateAssessmentId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw serviceError(400, 'Invalid assessment ID.');
};

export const listAssessments = async () => {
  const assessments = await Assessment.find({ active: true, slug: { $exists: true }, subjectSlug: { $exists: true } })
    .sort({ subject: 1, topic: 1, title: 1 })
    .lean();
  return assessments.map(serializeCatalogAssessment);
};

export const getAssessmentForStudent = async (assessmentId) => {
  validateAssessmentId(assessmentId);
  const assessment = await Assessment.findOne({ _id: assessmentId, active: true, slug: { $exists: true }, subjectSlug: { $exists: true } }).lean();
  if (!assessment) throw serviceError(404, 'Assessment not found.');

  return {
    ...serializeCatalogAssessment(assessment),
    questions: assessment.questions.map(serializeQuestion),
  };
};

export const submitAssessment = async (userId, assessmentId, answers) => {
  validateAssessmentId(assessmentId);
  const assessment = await Assessment.findOne({ _id: assessmentId, active: true, slug: { $exists: true }, subjectSlug: { $exists: true } }).lean();
  if (!assessment) throw serviceError(404, 'Assessment not found.');
  if (!Array.isArray(answers) || answers.length !== assessment.questions.length) {
    throw serviceError(400, 'Submit one answer for every question.');
  }

  const submittedAnswers = new Map();
  for (const answer of answers) {
    if (!answer || typeof answer.questionId !== 'string' || !Number.isInteger(answer.selectedOptionIndex)) {
      throw serviceError(400, 'Each answer must include a valid question ID and option.');
    }
    if (submittedAnswers.has(answer.questionId)) throw serviceError(400, 'Each question can only be answered once.');
    submittedAnswers.set(answer.questionId, answer.selectedOptionIndex);
  }

  let score = 0;
  const skillScores = new Map();
  const answerSnapshots = assessment.questions.map((question, questionIndex) => {
    const questionId = String(question._id);
    if (!submittedAnswers.has(questionId)) throw serviceError(400, 'Answers must match the questions in this assessment.');

    const selectedAnswer = submittedAnswers.get(questionId);
    if (!Number.isInteger(selectedAnswer) || selectedAnswer < 0 || selectedAnswer >= question.options.length) {
      throw serviceError(400, 'A selected answer is outside the available options.');
    }

    const isCorrect = selectedAnswer === question.correctAnswer;
    if (isCorrect) score += 1;
    const skillScore = skillScores.get(question.skill) || { skill: question.skill, correct: 0, total: 0 };
    skillScore.total += 1;
    if (isCorrect) skillScore.correct += 1;
    skillScores.set(question.skill, skillScore);
    return {
      questionId,
      questionIndex,
      question: question.prompt,
      options: question.options,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
      skill: question.skill,
    };
  });

  const percentage = Math.round((score / assessment.questions.length) * 100);
  const skillBreakdown = [...skillScores.values()].map((item) => ({
    ...item,
    percentage: Math.round((item.correct / item.total) * 100),
  }));
  const result = await AssessmentResult.create({
    user: userId,
    assessment: assessment._id,
    assessmentSlug: assessment.slug,
    assessmentTitle: assessment.title,
    subject: assessment.subject,
    subjectSlug: assessment.subjectSlug,
    topic: assessment.topic,
    topicSlug: assessment.topicSlug,
    assessmentSkill: assessment.skill,
    assessmentVersion: assessment.version,
    difficulty: assessment.difficulty,
    score,
    totalQuestions: assessment.questions.length,
    percentage,
    passingScore: assessment.passingScore,
    passed: percentage >= assessment.passingScore,
    skillBreakdown,
    answers: answerSnapshots,
    submittedAt: new Date(),
  });

  await publishNotification({
    userId,
    type: 'assessment',
    title: 'Assessment results are ready',
    message: `Your ${assessment.title} assessment is complete. You scored ${percentage}%${percentage >= assessment.passingScore ? ' and passed' : ''}.`,
    link: '/assessment',
  });

  return serializeResult(result);
};

export const listResultsForUser = async (userId) => {
  const results = await AssessmentResult.find({ user: userId, assessmentTitle: { $exists: true } })
    .sort({ submittedAt: -1 })
    .limit(20)
    .lean();
  return results.map((result) => ({
    id: String(result._id),
    assessmentId: String(result.assessment),
    assessmentSlug: result.assessmentSlug,
    assessmentTitle: result.assessmentTitle,
    subject: result.subject,
    subjectSlug: result.subjectSlug,
    topic: result.topic,
    topicSlug: result.topicSlug,
    assessmentSkill: result.assessmentSkill,
    difficulty: result.difficulty,
    score: result.score,
    totalQuestions: result.totalQuestions,
    percentage: result.percentage,
    passed: result.passed,
    skillBreakdown: result.skillBreakdown,
    submittedAt: result.submittedAt,
  }));
};

export const getResultForUser = async (userId, resultId) => {
  if (!mongoose.isValidObjectId(resultId)) throw serviceError(400, 'Invalid assessment result ID.');
  const result = await AssessmentResult.findOne({
    _id: resultId,
    user: userId,
    assessmentTitle: { $exists: true },
  }).lean();
  if (!result) throw serviceError(404, 'Assessment result not found.');
  return serializeResult(result);
};

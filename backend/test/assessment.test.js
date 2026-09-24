import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Assessment from '../src/models/Assessment.js';
import AssessmentResult from '../src/models/AssessmentResult.js';
import User from '../src/models/User.js';

const studentId = '507f1f77bcf86cd799439021';
const otherStudentId = '507f1f77bcf86cd799439022';
const assessment = {
  _id: new mongoose.Types.ObjectId(),
  slug: 'test-basics',
  version: 1,
  title: 'Test Basics',
  description: 'A short assessment for API tests.',
  subject: 'Engineering Fundamentals',
  subjectSlug: 'engineering-fundamentals',
  topic: 'Testing Basics',
  topicSlug: 'testing-basics',
  skill: 'Testing',
  category: 'Engineering',
  difficulty: 'Beginner',
  durationMinutes: 5,
  passingScore: 70,
  active: true,
  questions: [
    { _id: new mongoose.Types.ObjectId(), prompt: 'Which value is a boolean?', options: ['true', '"true"'], correctAnswer: 0, explanation: 'true is a boolean literal.', skill: 'Types' },
    { _id: new mongoose.Types.ObjectId(), prompt: 'Which HTTP status means success?', options: ['404', '200'], correctAnswer: 1, explanation: '200 indicates a successful request.', skill: 'HTTP' },
    { _id: new mongoose.Types.ObjectId(), prompt: 'What protects a database query?', options: ['String concatenation', 'Base64 encoding', 'Parameters'], correctAnswer: 2, explanation: 'Parameters separate query code and values.', skill: 'Security' },
  ],
};

test('assessment APIs authenticate, hide answers, score on server, persist attempts, and enforce result ownership', async (t) => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'assessment-test-secret';
  const originals = {
    findUser: User.findById,
    findAssessments: Assessment.find,
    findAssessment: Assessment.findOne,
    createResult: AssessmentResult.create,
    findResults: AssessmentResult.find,
    findResult: AssessmentResult.findOne,
  };
  const results = [];

  User.findById = async (id) => ([studentId, otherStudentId].includes(String(id)) ? { _id: id, role: 'student' } : null);
  Assessment.find = () => ({ sort: () => ({ lean: async () => [assessment] }) });
  Assessment.findOne = ({ _id }) => ({
    lean: async () => (String(_id) === String(assessment._id) ? assessment : null),
  });
  AssessmentResult.create = async (payload) => {
    const result = { _id: new mongoose.Types.ObjectId(), ...payload };
    results.push(result);
    return result;
  };
  AssessmentResult.find = ({ user }) => ({
    sort: () => ({ limit: () => ({ lean: async () => results.filter((result) => String(result.user) === String(user)).reverse() }) }),
  });
  AssessmentResult.findOne = ({ _id, user }) => ({
    lean: async () => results.find((result) => String(result._id) === String(_id) && String(result.user) === String(user)) || null,
  });

  const server = app.listen(0);
  t.after(async () => {
    User.findById = originals.findUser;
    Assessment.find = originals.findAssessments;
    Assessment.findOne = originals.findAssessment;
    AssessmentResult.create = originals.createResult;
    AssessmentResult.find = originals.findResults;
    AssessmentResult.findOne = originals.findResult;
    await new Promise((resolve) => server.close(resolve));
  });
  await new Promise((resolve) => server.once('listening', resolve));

  const baseUrl = `http://127.0.0.1:${server.address().port}/api/assessments`;
  const auth = (id = studentId) => `Bearer ${jwt.sign({ userId: id }, process.env.JWT_SECRET)}`;
  const request = (path, { method = 'GET', userId = studentId, body } = {}) => fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(userId ? { Authorization: auth(userId) } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  assert.equal((await request('/', { userId: null })).status, 401);

  const catalogResponse = await request('/');
  assert.equal(catalogResponse.status, 200);
  const catalog = await catalogResponse.json();
  assert.equal(catalog.assessments[0].questionCount, 3);
  assert.equal(catalog.assessments[0].subject, assessment.subject);
  assert.equal(catalog.assessments[0].topic, assessment.topic);
  assert.doesNotMatch(JSON.stringify(catalog), /correctAnswer|explanation/);

  const detailResponse = await request(`/${assessment._id}`);
  assert.equal(detailResponse.status, 200);
  const detail = await detailResponse.json();
  assert.equal(detail.assessment.questions.length, 3);
  assert.doesNotMatch(JSON.stringify(detail), /correctAnswer|explanation/);

  const incomplete = await request(`/${assessment._id}/submit`, { method: 'POST', body: { answers: [] } });
  assert.equal(incomplete.status, 400);

  const submission = await request(`/${assessment._id}/submit`, {
    method: 'POST',
    body: { answers: [
      { questionId: String(assessment.questions[0]._id), selectedOptionIndex: 0 },
      { questionId: String(assessment.questions[1]._id), selectedOptionIndex: 0 },
      { questionId: String(assessment.questions[2]._id), selectedOptionIndex: 2 },
    ] },
  });
  assert.equal(submission.status, 201);
  const saved = (await submission.json()).result;
  assert.equal(saved.score, 2);
  assert.equal(saved.percentage, 67);
  assert.equal(saved.passed, false);
  assert.equal(saved.answers.filter((answer) => answer.isCorrect).length, 2);
  assert.equal(saved.subject, assessment.subject);
  assert.equal(saved.topic, assessment.topic);
  assert.equal(saved.skillBreakdown.reduce((total, item) => total + item.total, 0), 3);
  assert.equal(saved.skillBreakdown.reduce((total, item) => total + item.correct, 0), 2);

  const history = await request('/results');
  assert.equal((await history.json()).results.length, 1);
  assert.equal((await request(`/results/${saved.id}`, { userId: otherStudentId })).status, 404);
  assert.equal((await request('/results', { userId: otherStudentId }).then((response) => response.json())).results.length, 0);
});

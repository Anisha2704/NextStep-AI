import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import LearningPath from '../src/models/LearningPath.js';
import SkillGap from '../src/models/SkillGap.js';
import User from '../src/models/User.js';

const primaryUserId = '507f1f77bcf86cd799439011';
const secondUserId = '507f1f77bcf86cd799439012';

const generatedPlan = () => ({
  targetRole: 'Backend Engineer',
  stages: [
    {
      title: 'Server fundamentals',
      description: 'Learn essential server-side programming concepts.',
      estimatedHours: 12,
      milestones: [
        {
          title: 'Build with Node.js',
          description: 'Create a small asynchronous command-line application.',
          skill: 'Node.js',
          estimatedHours: 5,
          resources: [{ title: 'Node.js docs', url: 'https://nodejs.org/docs/latest/api/' }],
        },
        {
          title: 'Create an Express API',
          description: 'Build and validate a small HTTP API.',
          skill: 'Express',
          estimatedHours: 7,
          resources: [],
        },
      ],
    },
  ],
});

test('roadmap endpoints enforce ownership, persist generation, prevent duplicates, and calculate progress', async (t) => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'learning-test-secret';
  const originalServiceToken = process.env.AI_SERVICE_INTERNAL_TOKEN;
  process.env.AI_SERVICE_INTERNAL_TOKEN = 'learning-test-service-token';
  const originals = {
    findUser: User.findById,
    findPath: LearningPath.findOne,
    savePath: LearningPath.prototype.save,
    findGap: SkillGap.findOne,
    upsertGap: SkillGap.findOneAndUpdate,
    fetch: globalThis.fetch,
  };
  let savedRoadmap = null;
  let savedSkillGap = null;
  let aiCalls = 0;
  let aiFailureStatus = null;
  let forwardedServiceToken = null;
  const user = (id) => ({
    _id: id,
    role: 'student',
    name: 'Learning Student',
    skills: [{ name: 'JavaScript', category: 'Programming' }],
    experienceLevel: 'Student',
    education: { level: 'Bachelor', degree: 'Computer Science' },
    interests: ['Backend development'],
    careerGoals: { targetJobRole: 'Backend Engineer', description: 'Build reliable services' },
  });

  User.findById = async (id) => [primaryUserId, secondUserId].includes(String(id)) ? user(String(id)) : null;
  SkillGap.findOne = async ({ user: owner, targetRole }) => (
    String(owner) === primaryUserId && targetRole === 'Backend Engineer'
      ? savedSkillGap
      : null
  );
  SkillGap.findOneAndUpdate = async ({ user: owner, targetRole }, { $set: values }) => {
    if (String(owner) !== primaryUserId) return null;
    savedSkillGap = { targetRole, ...values };
    return savedSkillGap;
  };
  LearningPath.findOne = async ({ user: owner, 'stages.milestones._id': milestoneId }) => {
    if (String(owner) !== primaryUserId || !savedRoadmap) return null;
    if (milestoneId && !savedRoadmap.stages.some((stage) => stage.milestones.id(milestoneId))) return null;
    return savedRoadmap;
  };
  LearningPath.prototype.save = async function saveWithoutDatabase() {
    await this.validate();
    savedRoadmap = this;
    return this;
  };
  globalThis.fetch = async (url, options) => {
    aiCalls += 1;
    if (aiFailureStatus) {
      return new Response(JSON.stringify({ detail: 'Roadmap generation timed out. Please try again.' }), {
        status: aiFailureStatus,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const isSkillGap = String(url).includes('/skill-gap/analyze');
    if (String(url).includes('/learning/roadmap/generate')) {
      forwardedServiceToken = options.headers['X-AI-Service-Token'];
    }
    return new Response(JSON.stringify(isSkillGap ? {
      summary: 'Analyze the role and current skills.',
      targetRole: 'Backend Engineer',
      currentSkills: ['AI generated skill text'],
      skillGaps: [{
        skill: 'Node.js', status: 'Missing', priority: 'High',
        reason: 'Needed for server-side work.', whatToLearn: ['Runtime basics'], nextSteps: ['Build a CLI'],
      }],
    } : generatedPlan()), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const server = app.listen(0);
  t.after(async () => {
    User.findById = originals.findUser;
    LearningPath.findOne = originals.findPath;
    LearningPath.prototype.save = originals.savePath;
    SkillGap.findOne = originals.findGap;
    SkillGap.findOneAndUpdate = originals.upsertGap;
    globalThis.fetch = originals.fetch;
    if (originalServiceToken === undefined) delete process.env.AI_SERVICE_INTERNAL_TOKEN;
    else process.env.AI_SERVICE_INTERNAL_TOKEN = originalServiceToken;
    await new Promise((resolve) => server.close(resolve));
  });
  await new Promise((resolve) => server.once('listening', resolve));

  const baseUrl = `http://127.0.0.1:${server.address().port}/api/learning`;
  const token = (id) => jwt.sign({ userId: id }, process.env.JWT_SECRET);
  const request = (path, { method = 'GET', auth = token(primaryUserId), body } = {}) => originals.fetch(`${baseUrl}${path}`, {
    method,
    headers: { ...(auth ? { Authorization: `Bearer ${auth}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const unauthenticated = await request('/roadmap', { auth: null });
  assert.equal(unauthenticated.status, 401);

  const analyzed = await originals.fetch(`${baseUrl.replace('/api/learning', '/api')}/ai/skill-gap/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token(primaryUserId)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(analyzed.status, 200);
  assert.deepEqual(savedSkillGap.currentSkills, ['JavaScript'], 'persisted skill list must come from the authenticated profile');
  assert.equal(savedSkillGap.skillGaps[0].skill, 'Node.js');
  const callsAfterSkillGapAnalysis = aiCalls;

  const created = await request('/roadmap/generate', { method: 'POST', body: {} });
  assert.equal(created.status, 201);
  const createdBody = await created.json();
  assert.equal(createdBody.roadmap.targetRole, 'Backend Engineer');
  assert.equal(createdBody.roadmap.overallProgress, 0);
  assert.equal(forwardedServiceToken, 'learning-test-service-token');
  assert.equal(aiCalls, callsAfterSkillGapAnalysis + 1);

  const duplicate = await request('/roadmap/generate', { method: 'POST', body: {} });
  assert.equal(duplicate.status, 409);
  assert.equal(aiCalls, callsAfterSkillGapAnalysis + 1, 'duplicate generation must not make another AI request');

  const retrieved = await request('/roadmap');
  assert.equal(retrieved.status, 200);
  assert.equal((await retrieved.json()).roadmap.id, createdBody.roadmap.id);

  const anotherStudent = await request('/roadmap', { auth: token(secondUserId) });
  assert.equal(anotherStudent.status, 200);
  assert.equal((await anotherStudent.json()).roadmap, null);

  const milestoneId = createdBody.roadmap.stages[0].milestones[0]._id;
  const invalidStatus = await request(`/roadmap/milestones/${milestoneId}`, {
    method: 'PATCH', body: { status: 'finished' },
  });
  assert.equal(invalidStatus.status, 400);

  const completed = await request(`/roadmap/milestones/${milestoneId}`, {
    method: 'PATCH', body: { status: 'completed' },
  });
  assert.equal(completed.status, 200);
  assert.equal((await completed.json()).roadmap.overallProgress, 50);

  const persisted = await request('/roadmap');
  assert.equal((await persisted.json()).roadmap.overallProgress, 50);

  aiFailureStatus = 504;
  const failedRegeneration = await request('/roadmap/generate', {
    method: 'POST', body: { confirmRegeneration: true },
  });
  assert.equal(failedRegeneration.status, 504);
  const preserved = (await request('/roadmap').then((response) => response.json())).roadmap;
  assert.equal(preserved.overallProgress, 50);
  assert.equal(preserved.version, 1);

  aiFailureStatus = 429;
  const regenerated = await request('/roadmap/generate', {
    method: 'POST', body: { confirmRegeneration: true },
  });
  assert.equal(regenerated.status, 201);
  const regeneratedRoadmap = (await regenerated.json()).roadmap;
  assert.equal(regeneratedRoadmap.version, 2);
  assert.equal(regeneratedRoadmap.generationSource, 'skill_gap_fallback');
  assert.equal(regeneratedRoadmap.stages[0].milestones[0].skill, 'Node.js');
  assert.equal(regeneratedRoadmap.overallProgress, 0);
  assert.equal(savedRoadmap.history.length, 1);
  assert.equal(savedRoadmap.history[0].overallProgress, 50);
});

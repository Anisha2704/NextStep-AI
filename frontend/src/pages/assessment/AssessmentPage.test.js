import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import assessmentReducer from '../../store/slices/assessmentSlice.js';

let vite;
let AssessmentPage;

before(async () => {
  vite = await (await import('vite')).createServer({
    configFile: './vite.config.js',
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
  });
  ({ default: AssessmentPage } = await vite.ssrLoadModule('/src/pages/assessment/AssessmentPage.jsx'));
});

after(async () => {
  await vite?.close();
});

const renderPage = (overrides = {}) => {
  const store = configureStore({
    reducer: { assessments: assessmentReducer },
    preloadedState: {
      assessments: {
        ...assessmentReducer(undefined, { type: 'init' }),
        ...overrides,
      },
    },
  });
  return renderToStaticMarkup(React.createElement(
    Provider,
    { store },
    React.createElement(AssessmentPage)
  ));
};

test('assessment catalog presents a selectable quiz and saved attempt history', () => {
  const markup = renderPage({
    assessments: [{
      id: 'assessment-1',
      title: 'JavaScript Fundamentals',
      subject: 'Programming Languages',
      subjectSlug: 'programming-languages',
      topic: 'JavaScript Fundamentals',
      topicSlug: 'javascript-fundamentals',
      description: 'Review JavaScript language basics.',
      skill: 'JavaScript',
      category: 'Programming',
      difficulty: 'Beginner',
      durationMinutes: 10,
      passingScore: 70,
      questionCount: 5,
    }],
    results: [{
      id: 'result-1',
      assessmentId: 'assessment-1',
      assessmentTitle: 'JavaScript Fundamentals',
      assessmentSkill: 'JavaScript',
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      passed: true,
      submittedAt: '2026-09-24T00:00:00.000Z',
    }],
  });

  assert.match(markup, /Available assessments/);
  assert.match(markup, /Subject/);
  assert.match(markup, /Topic/);
  assert.match(markup, /Programming Languages/);
  assert.match(markup, /JavaScript Fundamentals/);
  assert.match(markup, /Try again/);
  assert.match(markup, /Your recent results/);
  assert.match(markup, /Review/);
});

test('active assessment shows accessible options and server-scored submission action', () => {
  const markup = renderPage({
    activeAssessment: {
      id: 'assessment-1',
      title: 'JavaScript Fundamentals',
      skill: 'JavaScript',
      difficulty: 'Beginner',
      durationMinutes: 10,
      questions: [{
        id: 'question-1',
        prompt: 'Which value is a boolean?',
        skill: 'Types and values',
        options: ['true', '"true"'],
      }],
    },
  });

  assert.match(markup, /Question 1 of 1/);
  assert.match(markup, /Which value is a boolean/);
  assert.match(markup, /type="radio"/);
  assert.match(markup, /Submit assessment/);
  assert.match(markup, /scored on the server/);
});

test('assessment result displays score, pass state, and answer explanations', () => {
  const markup = renderPage({
    currentResult: {
      assessmentTitle: 'SQL Fundamentals',
      subject: 'Database Management',
      topic: 'SQL Fundamentals',
      assessmentSkill: 'SQL',
      submittedAt: '2026-09-24T00:00:00.000Z',
      percentage: 80,
      score: 4,
      totalQuestions: 5,
      passingScore: 70,
      passed: true,
      skillBreakdown: [{ skill: 'Aggregates', correct: 1, total: 1, percentage: 100 }],
      answers: [{
        questionId: 'question-1',
        question: 'What does COUNT(*) return?',
        options: ['All rows', 'Only non-null values'],
        selectedAnswer: 0,
        correctAnswer: 0,
        isCorrect: true,
        explanation: 'COUNT(*) counts rows.',
        skill: 'Aggregates',
      }],
    },
  });

  assert.match(markup, /Assessment passed/);
  assert.match(markup, /80%/);
  assert.match(markup, /Answer review/);
  assert.match(markup, /Topic skill breakdown/);
  assert.match(markup, /Aggregates/);
  assert.match(markup, /COUNT\(\*\)/);
  assert.match(markup, /COUNT\(\*\) counts rows/);
});

import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import learningReducer from '../../store/slices/learningSlice.js';

const userReducer = (state = { profile: null }) => state;

let vite;
let LearningPage;

before(async () => {
  vite = await createServer({ configFile: './vite.config.js', server: { middlewareMode: true }, appType: 'custom' });
  ({ default: LearningPage } = await vite.ssrLoadModule('/src/pages/learning/LearningPage.jsx'));
});

after(async () => {
  await vite?.close();
});

const renderPage = (learning) => {
  const store = configureStore({
    reducer: { user: userReducer, learning: learningReducer },
    preloadedState: {
      user: { profile: null, loading: false, saving: false, error: null },
      learning: { ...learningReducer(undefined, { type: 'init' }), ...learning },
    },
  });
  return renderToStaticMarkup(
    React.createElement(
      Provider,
      { store },
      React.createElement(MemoryRouter, null, React.createElement(LearningPage))
    )
  );
};

test('Learning page explains the empty state and links to missing prerequisites', () => {
  const markup = renderPage({
    readiness: { canGenerate: false, missing: ['targetRole', 'skillGap'] },
  });
  assert.match(markup, /Create your personalized learning roadmap/);
  assert.match(markup, /Update profile/);
  assert.match(markup, /Open Skill Gap Analysis/);
  assert.doesNotMatch(markup, /Software Engineer/);
});

test('Learning page renders saved roadmap progress and milestone actions', () => {
  const markup = renderPage({
    roadmap: {
      targetRole: 'Backend Engineer',
      generationSource: 'skill_gap_fallback',
      version: 1,
      generatedAt: '2026-01-01T00:00:00.000Z',
      overallProgress: 50,
      stages: [{
        _id: 'stage-1',
        order: 1,
        title: 'Server fundamentals',
        description: 'Build the foundations needed for backend work.',
        status: 'in_progress',
        progress: 50,
        estimatedHours: 10,
        milestones: [
          {
            _id: 'milestone-1',
            title: 'Start with Node.js',
            description: 'Learn the runtime by building a small application.',
            skill: 'Node.js',
            estimatedHours: 5,
            status: 'not_started',
            resources: [],
          },
        ],
      }],
    },
  });
  assert.match(markup, /Backend Engineer/);
  assert.match(markup, /50%/);
  assert.match(markup, /Server fundamentals/);
  assert.match(markup, /saved Skill Gap Analysis/);
  assert.match(markup, /Start milestone: Start with Node\.js/);
  assert.match(markup, /Continue learning/);
});

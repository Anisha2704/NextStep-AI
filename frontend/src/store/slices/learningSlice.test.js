import test from 'node:test';
import assert from 'node:assert/strict';
import learningReducer, {
  fetchLearningRoadmap,
  generateRoadmap,
  updateMilestone,
} from './learningSlice.js';

test('learning state represents empty, loading, and generation states', () => {
  let state = learningReducer(undefined, { type: 'init' });
  assert.equal(state.roadmap, null);
  assert.equal(state.loading, false);

  state = learningReducer(state, fetchLearningRoadmap.pending('fetch-1'));
  assert.equal(state.loading, true);

  state = learningReducer(state, generateRoadmap.pending('generate-1', false));
  assert.equal(state.generating, true);
  assert.equal(state.error, null);
});

test('generation and milestone updates replace state with persisted server roadmaps', () => {
  const generated = {
    id: 'roadmap-1',
    generationSource: 'skill_gap_fallback',
    overallProgress: 0,
    stages: [{ _id: 'stage-1', milestones: [{ _id: 'milestone-1', status: 'not_started' }] }],
  };
  let state = learningReducer(undefined, generateRoadmap.fulfilled(generated, 'generate-1', false));
  assert.equal(state.generating, false);
  assert.equal(state.roadmap, generated);
  assert.match(state.success, /saved Skill Gap Analysis/);

  state = learningReducer(state, updateMilestone.pending('update-1', {
    milestoneId: 'milestone-1', status: 'completed',
  }));
  assert.equal(state.updatingMilestoneId, 'milestone-1');

  const persistedUpdate = { ...generated, overallProgress: 100 };
  state = learningReducer(state, updateMilestone.fulfilled(persistedUpdate, 'update-1', {
    milestoneId: 'milestone-1', status: 'completed',
  }));
  assert.equal(state.updatingMilestoneId, null);
  assert.equal(state.roadmap.overallProgress, 100);
});

test('roadmap load errors are represented for the page error state', () => {
  const state = learningReducer(undefined, fetchLearningRoadmap.rejected(
    new Error('request failed'),
    'fetch-2',
    undefined,
    'Learning service is currently unavailable.'
  ));
  assert.equal(state.loading, false);
  assert.equal(state.error, 'Learning service is currently unavailable.');
});

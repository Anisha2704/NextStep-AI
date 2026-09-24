import test from 'node:test';
import assert from 'node:assert/strict';
import assessmentReducer, {
  fetchAssessments,
  submitAssessment,
} from './assessmentSlice.js';

test('assessment state tracks catalog loading and saves server-scored results', () => {
  let state = assessmentReducer(undefined, { type: 'init' });
  assert.deepEqual(state.assessments, []);

  state = assessmentReducer(state, fetchAssessments.pending('catalog-1'));
  assert.equal(state.loading, true);
  state = assessmentReducer(state, fetchAssessments.fulfilled([{ id: 'a-1' }], 'catalog-1'));
  assert.equal(state.loading, false);
  assert.equal(state.assessments[0].id, 'a-1');

  const result = { id: 'r-1', score: 4, percentage: 80, answers: [] };
  state = assessmentReducer(state, submitAssessment.pending('submit-1'));
  assert.equal(state.submitting, true);
  state = assessmentReducer(state, submitAssessment.fulfilled(result, 'submit-1'));
  assert.equal(state.submitting, false);
  assert.equal(state.currentResult, result);
  assert.equal(state.results[0], result);
  assert.match(state.success, /scored and saved/);
});

test('assessment submission failure is exposed as a user-facing error', () => {
  const state = assessmentReducer(undefined, submitAssessment.rejected(
    new Error('request failed'),
    'submit-2',
    {},
    'Please answer every question.'
  ));
  assert.equal(state.submitting, false);
  assert.equal(state.error, 'Please answer every question.');
});

test('assessment data is cleared across logout and account changes', () => {
  const populated = assessmentReducer(undefined, fetchAssessments.fulfilled([{ id: 'private-assessment' }], 'catalog-3'));
  const loggedOut = assessmentReducer(populated, { type: 'auth/logout' });
  const state = assessmentReducer(loggedOut, { type: 'auth/login/fulfilled', payload: { user: { id: 'another-user' } } });
  assert.deepEqual(state.assessments, []);
  assert.deepEqual(state.results, []);
  assert.equal(state.currentResult, null);
});

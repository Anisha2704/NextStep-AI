import test from 'node:test';
import assert from 'node:assert/strict';
import Assessment from '../src/models/Assessment.js';
import assessmentCatalog from '../src/data/assessmentCatalog.js';

test('curated assessment catalog has validated subject and topic coverage', async () => {
  assert.equal(assessmentCatalog.length, 11);
  assert.equal(new Set(assessmentCatalog.map(({ subjectSlug }) => subjectSlug)).size, 5);
  assert.equal(new Set(assessmentCatalog.map(({ topicSlug }) => topicSlug)).size, assessmentCatalog.length);

  for (const assessment of assessmentCatalog) {
    assert.ok(assessment.questions.length >= 5, `${assessment.title} should test multiple concepts`);
    assert.ok(assessment.questions.every(({ skill }) => skill), `${assessment.title} questions should report a skill`);
    await assert.doesNotReject(new Assessment(assessment).validate(), assessment.title);
  }
});

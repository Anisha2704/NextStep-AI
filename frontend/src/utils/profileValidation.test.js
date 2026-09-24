import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFullName, validateGraduationYear } from './profileValidation.js';

test('full name validation trims whitespace and enforces the supported length', () => {
  assert.equal(validateFullName('  Ada Lovelace  '), '');
  assert.notEqual(validateFullName(' A '), '');
  assert.notEqual(validateFullName('x'.repeat(101)), '');
});

test('graduation year validation accepts blank or sensible integer years', () => {
  assert.equal(validateGraduationYear(''), '');
  assert.equal(validateGraduationYear(2027), '');
  assert.notEqual(validateGraduationYear(1800), '');
  assert.notEqual(validateGraduationYear(2027.5), '');
});

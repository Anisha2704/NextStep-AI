import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import User from '../src/models/User.js';

test('authenticated students can create, retrieve, and update only their profile', async (t) => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'profile-test-secret';
  const originalFindById = User.findById;
  const originalFindOneAndUpdate = User.findOneAndUpdate;
  const originalExists = User.exists;
  let profileInitialized = false;
  const user = {
    _id: 'student-1',
    name: 'A Student',
    email: 'student@example.test',
    bio: '', profilePhoto: '', location: '', phone: '', role: 'student',
    experienceLevel: '', education: {}, interests: [], careerGoals: {}, skills: [], projects: [], certifications: [],
    get profileInitialized() { return profileInitialized; },
    set profileInitialized(value) { profileInitialized = value; },
    toSafeObject() {
      return {
        id: this._id, name: this.name, email: this.email, bio: this.bio, profilePhoto: this.profilePhoto,
        location: this.location, phone: this.phone, role: this.role, experienceLevel: this.experienceLevel,
        education: this.education, interests: this.interests, careerGoals: this.careerGoals,
        skills: this.skills, projects: this.projects, certifications: this.certifications,
      };
    },
    async save() {},
  };
  User.findById = (id) => ({
    select() { return Promise.resolve(id === user._id ? user : null); },
    then(resolve, reject) { return Promise.resolve(id === user._id ? user : null).then(resolve, reject); },
  });
  User.findOneAndUpdate = async ({ _id }, { $set: updates }) => {
    if (_id !== user._id || profileInitialized) return null;
    for (const [key, value] of Object.entries(updates)) {
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        user[parent] = { ...user[parent], [child]: value };
      } else {
        user[key] = value;
      }
    }
    return user;
  };
  User.exists = async ({ _id }) => _id === user._id ? { _id } : null;
  const server = app.listen(0);
  t.after(async () => {
    User.findById = originalFindById;
    User.findOneAndUpdate = originalFindOneAndUpdate;
    User.exists = originalExists;
    await new Promise((resolve) => server.close(resolve));
  });
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}/api/users/profile`;
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  const request = (method, body, auth = true) => fetch(baseUrl, {
    method,
    headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const unauthenticated = await request('GET', undefined, false);
  assert.equal(unauthenticated.status, 401);

  const invalid = await request('POST', { name: 'A Student', userId: 'student-2' });
  assert.equal(invalid.status, 400);

  const created = await request('POST', {
    name: 'A Student',
    education: { level: 'Bachelor', college: 'Example University', graduationYear: 2027 },
    experienceLevel: 'Student',
    interests: ['Artificial Intelligence'],
    careerGoals: { preferredDomains: ['Data & Analytics'] },
  });
  assert.equal(created.status, 201);
  assert.equal((await created.json()).user.education.graduationYear, 2027);

  const duplicate = await request('POST', { name: 'A Student' });
  assert.equal(duplicate.status, 409);

  const retrieved = await request('GET');
  assert.equal(retrieved.status, 200);
  assert.equal((await retrieved.json()).user.id, 'student-1');

  const otherStudentToken = jwt.sign({ userId: 'student-2' }, process.env.JWT_SECRET);
  const otherStudentResponse = await fetch(baseUrl, { headers: { Authorization: `Bearer ${otherStudentToken}` } });
  assert.equal(otherStudentResponse.status, 401);

  const updated = await request('PATCH', { education: { graduationYear: 2028 } });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).user.education.graduationYear, 2028);

  const badYear = await request('PUT', { education: { graduationYear: 1800 } });
  assert.equal(badYear.status, 400);

  const deleted = await request('DELETE');
  assert.equal(deleted.status, 200);
  assert.equal(user.name, 'A Student');
  assert.equal(user.education.level, undefined);

  // The ownership key is never accepted from the request; identity is taken only from the verified JWT.
  assert.equal(user._id, 'student-1');
});

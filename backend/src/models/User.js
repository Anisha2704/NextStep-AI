import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { EDUCATION_LEVELS, EXPERIENCE_LEVELS, SKILL_PROFICIENCIES, WORK_TYPES } from '../constants/profile.js';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  category: { type: String, trim: true, default: '', maxlength: 60 },
  proficiency: {
    type: String,
    enum: SKILL_PROFICIENCIES,
    default: 'Beginner',
  },
  yearsOfExperience: { type: Number, default: 0, min: 0, max: 80 },
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  technologies: [{ type: String, trim: true }],
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  role: { type: String, default: '' },
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  provider: { type: String, default: '' },
  issueDate: { type: Date },
  credentialUrl: { type: String, default: '' },
});

const educationSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['', ...EDUCATION_LEVELS],
    default: '',
  },
  college: { type: String, default: '', maxlength: 160 },
  degree: { type: String, default: '', maxlength: 120 },
  branch: { type: String, default: '', maxlength: 120 },
  currentYear: { type: String, default: '' },
  graduationYear: { type: Number, min: 1950, max: 2150 },
  cgpa: { type: String, default: '' },
});

const careerGoalsSchema = new mongoose.Schema({
  targetJobRole: { type: String, default: '' },
  targetIndustry: { type: String, default: '' },
  preferredWorkType: {
    type: String,
    enum: ['', ...WORK_TYPES],
    default: '',
  },
  preferredLocation: { type: String, default: '' },
  description: { type: String, default: '' },
  preferredDomains: {
    type: [{ type: String, trim: true, maxlength: 60 }],
    validate: [(items) => items.length <= 12, 'A maximum of 12 career domains is allowed'],
    default: [],
  },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    experienceLevel: {
      type: String,
      enum: ['', ...EXPERIENCE_LEVELS],
      default: '',
    },
    profileInitialized: { type: Boolean, default: false, select: false },
    profilePhoto: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    phone: { type: String, default: '' },
    education: { type: educationSchema, default: () => ({}) },
    skills: {
      type: [skillSchema],
      validate: [(items) => items.length <= 50, 'A maximum of 50 skills is allowed'],
      default: [],
    },
    interests: {
      type: [{ type: String, trim: true, maxlength: 60 }],
      validate: [(items) => items.length <= 20, 'A maximum of 20 interests is allowed'],
      default: [],
    },
    careerGoals: { type: careerGoalsSchema, default: () => ({}) },
    projects: [projectSchema],
    certifications: [certificationSchema],
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;

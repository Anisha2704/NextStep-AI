import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, trim: true, default: '' },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner',
  },
  yearsOfExperience: { type: Number, default: 0, min: 0 },
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
  college: { type: String, default: '' },
  degree: { type: String, default: '' },
  branch: { type: String, default: '' },
  currentYear: { type: String, default: '' },
  graduationYear: { type: String, default: '' },
  cgpa: { type: String, default: '' },
});

const careerGoalsSchema = new mongoose.Schema({
  targetJobRole: { type: String, default: '' },
  targetIndustry: { type: String, default: '' },
  preferredWorkType: {
    type: String,
    enum: ['Remote', 'Hybrid', 'On-site', ''],
    default: '',
  },
  preferredLocation: { type: String, default: '' },
  description: { type: String, default: '' },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
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
    profilePhoto: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    phone: { type: String, default: '' },
    education: { type: educationSchema, default: () => ({}) },
    skills: [skillSchema],
    interests: [{ type: String, trim: true }],
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

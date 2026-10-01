import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    provider: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    skills: [{ type: String, trim: true }],
    targetRoles: [{ type: String, trim: true }],
    url: { type: String, default: '', trim: true },
    level: { type: String, default: 'Beginner', trim: true },
    duration: { type: String, default: '', trim: true },
    category: { type: String, default: 'General', trim: true },
    prerequisites: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

courseSchema.index({ skills: 1 });
courseSchema.index({ targetRoles: 1 });

const Course = mongoose.model('Course', courseSchema);

export default Course;

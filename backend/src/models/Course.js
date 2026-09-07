import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    provider: { type: String, default: '' },
    description: { type: String, default: '' },
    skills: [{ type: String }],
    url: { type: String, default: '' },
    level: { type: String, default: '' },
    duration: { type: String, default: '' },
  },
  { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);

export default Course;

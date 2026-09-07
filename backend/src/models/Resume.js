import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, default: '' },
    analysis: {
      score: Number,
      strengths: [String],
      weaknesses: [String],
      suggestions: [String],
    },
  },
  { timestamps: true }
);

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;

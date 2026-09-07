import mongoose from 'mongoose';

const careerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    industry: { type: String, default: '' },
    description: { type: String, default: '' },
    requiredSkills: [{ type: String }],
    salaryRange: { type: String, default: '' },
  },
  { timestamps: true }
);

const Career = mongoose.model('Career', careerSchema);

export default Career;

import mongoose from 'mongoose';

const skillGapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: { type: String, default: '' },
    missingSkills: [{ name: String, priority: String }],
    recommendations: [{ type: String }],
  },
  { timestamps: true }
);

const SkillGap = mongoose.model('SkillGap', skillGapSchema);

export default SkillGap;

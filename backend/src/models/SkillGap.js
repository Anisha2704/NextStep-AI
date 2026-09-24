import mongoose from 'mongoose';

const skillGapItemSchema = new mongoose.Schema({
  skill: { type: String, required: true, trim: true, maxlength: 100 },
  status: { type: String, enum: ['Strong', 'Needs Improvement', 'Missing'], required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
  reason: { type: String, required: true, maxlength: 500 },
  whatToLearn: [{ type: String, trim: true, maxlength: 160 }],
  nextSteps: [{ type: String, trim: true, maxlength: 300 }],
});

const skillGapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: { type: String, required: true, trim: true, maxlength: 120 },
    summary: { type: String, default: '', maxlength: 2000 },
    currentSkills: [{ type: String, trim: true, maxlength: 80 }],
    skillGaps: {
      type: [skillGapItemSchema],
      default: [],
      validate: [(items) => items.length <= 40, 'A maximum of 40 skill gaps is allowed'],
    },
    missingSkills: [{ name: String, priority: String }],
    recommendations: [{ type: String }],
  },
  { timestamps: true }
);

skillGapSchema.index({ user: 1, targetRole: 1 }, { unique: true });

const SkillGap = mongoose.model('SkillGap', skillGapSchema);

export default SkillGap;

import mongoose from 'mongoose';

const sectionReviewSchema = new mongoose.Schema({
  section: { type: String, required: true, trim: true, maxlength: 80 },
  status: { type: String, enum: ['strong', 'needs_work', 'missing'], required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  feedback: { type: String, required: true, trim: true, maxlength: 500 },
}, { _id: false });

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true, trim: true, maxlength: 160 },
    sourceType: { type: String, enum: ['pdf', 'text', 'pasted'], required: true },
    targetRole: { type: String, default: '', trim: true, maxlength: 120 },
    wordCount: { type: Number, required: true, min: 1, max: 20000 },
    analysisSource: { type: String, enum: ['ai', 'rule_based'], default: 'ai', required: true },
    notice: { type: String, default: '', trim: true, maxlength: 300 },
    analysis: {
      overallScore: { type: Number, required: true, min: 0, max: 100 },
      summary: { type: String, required: true, trim: true, maxlength: 1200 },
      strengths: { type: [{ type: String, trim: true, maxlength: 300 }], default: [], validate: [(items) => items.length <= 8, 'A maximum of 8 strengths is allowed'] },
      improvements: { type: [{ type: String, trim: true, maxlength: 400 }], default: [], validate: [(items) => items.length <= 10, 'A maximum of 10 improvements is allowed'] },
      missingKeywords: { type: [{ type: String, trim: true, maxlength: 80 }], default: [], validate: [(items) => items.length <= 20, 'A maximum of 20 keywords is allowed'] },
      sectionReviews: { type: [sectionReviewSchema], default: [], validate: [(items) => items.length <= 12, 'A maximum of 12 section reviews is allowed'] },
      actionPlan: { type: [{ type: String, trim: true, maxlength: 400 }], default: [], validate: [(items) => items.length <= 8, 'A maximum of 8 action items is allowed'] },
    },
    analyzedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, analyzedAt: -1 });

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;

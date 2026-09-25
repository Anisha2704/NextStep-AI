import mongoose from 'mongoose';

const placementReadinessSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  overallScore: { type: Number, required: true, min: 0, max: 100 },
  level: { type: String, enum: ['Starting', 'Building', 'On Track', 'Ready'], required: true },
  targetRole: { type: String, default: '', maxlength: 120 },
  dimensions: [{
    key: { type: String, required: true, maxlength: 40 },
    title: { type: String, required: true, maxlength: 100 },
    score: { type: Number, required: true, min: 0, max: 100 },
    weight: { type: Number, required: true, min: 1, max: 100 },
    method: { type: String, required: true, maxlength: 300 },
    evidence: { type: String, required: true, maxlength: 240 },
    action: { type: String, default: '', maxlength: 240 },
    href: { type: String, default: '', maxlength: 120 },
  }],
  actionItems: [{
    key: { type: String, required: true, maxlength: 40 },
    title: { type: String, required: true, maxlength: 100 },
    action: { type: String, required: true, maxlength: 240 },
    href: { type: String, required: true, maxlength: 120 },
  }],
  evaluatedAt: { type: Date, default: Date.now, required: true },
}, { timestamps: true });

const PlacementReadiness = mongoose.model('PlacementReadiness', placementReadinessSchema);

export default PlacementReadiness;

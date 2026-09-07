import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activityType: { type: String, default: '' },
    activityId: { type: String, default: '' },
    status: { type: String, default: 'in_progress' },
    percentage: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;

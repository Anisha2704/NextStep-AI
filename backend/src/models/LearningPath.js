import mongoose from 'mongoose';

const learningPathSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    steps: [
      {
        title: String,
        description: String,
        completed: { type: Boolean, default: false },
      },
    ],
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const LearningPath = mongoose.model('LearningPath', learningPathSchema);

export default LearningPath;

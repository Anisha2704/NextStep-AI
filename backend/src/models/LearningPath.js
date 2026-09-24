import mongoose from 'mongoose';

const RESOURCE_TYPES = ['article', 'course', 'video', 'documentation', 'other'];
const MILESTONE_STATUSES = ['not_started', 'in_progress', 'completed'];

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    url: {
      type: String,
      required: true,
      maxlength: 2048,
      match: [/^https:\/\//i, 'Learning resource URLs must use HTTPS'],
    },
    type: { type: String, enum: RESOURCE_TYPES, default: 'other' },
  },
  { _id: false }
);

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  description: { type: String, required: true, trim: true, minlength: 5, maxlength: 600 },
  skill: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
  resources: { type: [resourceSchema], default: [], validate: [(items) => items.length <= 4, 'A maximum of 4 resources is allowed'] },
  estimatedHours: { type: Number, required: true, min: 0.1, max: 100 },
  order: { type: Number, required: true, min: 1, max: 100 },
  status: { type: String, enum: MILESTONE_STATUSES, default: 'not_started' },
  completedAt: { type: Date, default: null },
});

const stageSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  description: { type: String, required: true, trim: true, minlength: 5, maxlength: 600 },
  order: { type: Number, required: true, min: 1, max: 8 },
  estimatedHours: { type: Number, required: true, min: 0.1, max: 500 },
  status: { type: String, enum: MILESTONE_STATUSES, default: 'not_started' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  milestones: {
    type: [milestoneSchema],
    required: true,
    validate: [(items) => items.length > 0 && items.length <= 12, 'Each stage must contain 1 to 12 milestones'],
  },
});

const roadmapSnapshotSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true, min: 1 },
    targetRole: { type: String, required: true, trim: true, maxlength: 120 },
    generationSource: { type: String, enum: ['ai', 'skill_gap_fallback'], default: 'ai' },
    generatedAt: { type: Date, required: true },
    overallProgress: { type: Number, required: true, min: 0, max: 100 },
    stages: { type: [stageSchema], required: true },
  },
  { _id: false }
);

const learningPathSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    targetRole: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    generatedAt: { type: Date, default: Date.now, required: true },
    lastUpdatedAt: { type: Date, default: Date.now, required: true },
    version: { type: Number, default: 1, min: 1 },
    generationSource: { type: String, enum: ['ai', 'skill_gap_fallback'], default: 'ai' },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    overallProgress: { type: Number, default: 0, min: 0, max: 100 },
    stages: {
      type: [stageSchema],
      required: true,
      validate: [(items) => items.length > 0 && items.length <= 8, 'A roadmap must contain 1 to 8 stages'],
    },
    history: { type: [roadmapSnapshotSchema], default: [], validate: [(items) => items.length <= 5, 'A maximum of 5 prior roadmap versions is retained'] },
    // Legacy fields retained so any existing LearningPath records remain readable during migration.
    steps: [{ title: String, description: String, completed: { type: Boolean, default: false } }],
    progress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true, optimisticConcurrency: true }
);

const LearningPath = mongoose.model('LearningPath', learningPathSchema);

export { MILESTONE_STATUSES };
export default LearningPath;

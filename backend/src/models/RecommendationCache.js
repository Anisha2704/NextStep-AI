import mongoose from 'mongoose';

const recommendationCacheSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    profileHash: {
      type: String,
      required: true,
    },
    recommendations: {
      summary: { type: String, default: '' },
      skillGaps: [
        {
          skill: { type: String, required: true },
          importance: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
          reason: { type: String, default: '' },
        },
      ],
      courseRecommendations: [
        {
          courseId: { type: String, required: true },
          title: { type: String, default: '' },
          provider: { type: String, default: '' },
          level: { type: String, default: '' },
          duration: { type: String, default: '' },
          url: { type: String, default: '' },
          priority: { type: Number, default: 1 },
          importance: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'HIGH' },
          reason: { type: String, default: '' },
          skillsCovered: [{ type: String }],
        },
      ],
      certificationRecommendations: [
        {
          certificationId: { type: String, required: true },
          name: { type: String, default: '' },
          provider: { type: String, default: '' },
          level: { type: String, default: '' },
          officialUrl: { type: String, default: '' },
          preparationTime: { type: String, default: '' },
          cost: { type: String, default: '' },
          priority: { type: Number, default: 1 },
          importance: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'HIGH' },
          reason: { type: String, default: '' },
        },
      ],
      learningPath: [
        {
          step: { type: Number, required: true },
          type: { type: String, enum: ['COURSE', 'CERTIFICATION'], required: true },
          resourceId: { type: String, required: true },
          title: { type: String, default: '' },
          provider: { type: String, default: '' },
          level: { type: String, default: '' },
          url: { type: String, default: '' },
          reason: { type: String, default: '' },
          skillsCovered: [{ type: String }],
        },
      ],
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    lastRequestedAt: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      enum: ['gemini', 'rule_based'],
      default: 'gemini',
    },
  },
  { timestamps: true }
);

const RecommendationCache = mongoose.model('RecommendationCache', recommendationCacheSchema);

export default RecommendationCache;

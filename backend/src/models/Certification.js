import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    provider: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    skills: [{ type: String, trim: true }],
    targetRoles: [{ type: String, trim: true }],
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate',
    },
    prerequisites: [{ type: String, trim: true }],
    officialUrl: { type: String, default: '', trim: true },
    preparationTime: { type: String, default: '', trim: true },
    cost: { type: String, default: '', trim: true },
    category: { type: String, default: 'General', trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

certificationSchema.index({ name: 1, provider: 1 });
certificationSchema.index({ skills: 1 });
certificationSchema.index({ targetRoles: 1 });

const Certification = mongoose.model('Certification', certificationSchema);

export default Certification;

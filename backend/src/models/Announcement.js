import mongoose from 'mongoose';

const ANNOUNCEMENT_TYPES = ['info', 'warning', 'success', 'urgent'];

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    message: { type: String, required: true, trim: true, minlength: 5, maxlength: 1000 },
    type: { type: String, enum: ANNOUNCEMENT_TYPES, default: 'info' },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

announcementSchema.index({ isPublished: 1, createdAt: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;

import mongoose from 'mongoose';

const NOTIFICATION_TYPES = [
  'welcome', 'profile', 'assessment', 'learning', 'milestone', 'resume', 'skill_gap', 'placement', 'career',
];
const EMAIL_STATUSES = ['skipped', 'pending', 'sending', 'sent', 'failed'];

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: NOTIFICATION_TYPES, required: true },
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  message: { type: String, required: true, trim: true, minlength: 2, maxlength: 500 },
  link: {
    type: String,
    required: true,
    maxlength: 200,
    validate: [(value) => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && !/[\r\n]/.test(value), 'Notification links must be local application paths'],
  },
  readAt: { type: Date, default: null },
  emailStatus: { type: String, enum: EMAIL_STATUSES, default: 'skipped' },
  emailAttempts: { type: Number, min: 0, max: 5, default: 0 },
  nextEmailAttemptAt: { type: Date, default: null },
  emailLockedUntil: { type: Date, default: null },
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });
notificationSchema.index({ emailStatus: 1, nextEmailAttemptAt: 1, createdAt: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

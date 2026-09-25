import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getMailConfig } from './mailConfig.js';

const isEmailDeliveryConfigured = () => Boolean(getMailConfig());
const EMAIL_NOTIFICATION_TYPES = new Set(['welcome', 'profile', 'assessment', 'learning', 'milestone', 'resume', 'placement']);

export const publishNotification = async ({ userId, type, title, message, link }) => {
  try {
    const user = await User.findById(userId).select('notificationPreferences').lean();
    if (!user) return null;

    const emailEnabled = user.notificationPreferences?.emailEnabled !== false;
    const shouldSendEmail = EMAIL_NOTIFICATION_TYPES.has(type) && emailEnabled && isEmailDeliveryConfigured();
    const emailStatus = shouldSendEmail ? 'pending' : 'skipped';
    return await Notification.create({ user: userId, type, title, message, link, emailStatus });
  } catch (error) {
    console.error('Notification could not be persisted:', error.code || error.name || 'unknown error');
    return null;
  }
};

export const isNotificationEmailConfigured = isEmailDeliveryConfigured;

import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { isNotificationEmailConfigured } from '../services/notificationService.js';
import { sendError, sendSuccess } from '../utils/response.js';

const serializeNotification = (notification) => ({
  id: String(notification._id),
  type: notification.type,
  title: notification.title,
  message: notification.message,
  link: notification.link,
  readAt: notification.readAt,
  createdAt: notification.createdAt,
});

export const listNotifications = async (req, res, next) => {
  try {
    const requestedLimit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 50) {
      return sendError(res, 400, 'Notification limit must be between 1 and 50.');
    }

    const userId = req.user._id;
    const [items, unreadCount] = await Promise.all([
      Notification.find({ user: userId }).sort({ createdAt: -1, _id: -1 }).limit(requestedLimit)
        .select('type title message link readAt createdAt').lean(),
      Notification.countDocuments({ user: userId, readAt: null }),
    ]);
    return sendSuccess(res, 200, 'Notifications retrieved', {
      notifications: items.map(serializeNotification),
      unreadCount,
    });
  } catch (error) { return next(error); }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.notificationId)) return sendError(res, 400, 'Invalid notification ID.');
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, user: req.user._id, readAt: null },
      { $set: { readAt: new Date() } },
      { new: true }
    ).select('type title message link readAt createdAt').lean();
    if (!notification) {
      const exists = await Notification.exists({ _id: req.params.notificationId, user: req.user._id });
      return exists
        ? sendSuccess(res, 200, 'Notification already read', { notification: null })
        : sendError(res, 404, 'Notification not found.');
    }
    return sendSuccess(res, 200, 'Notification marked as read', { notification: serializeNotification(notification) });
  } catch (error) { return next(error); }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, readAt: null }, { $set: { readAt: new Date() } });
    return sendSuccess(res, 200, 'All notifications marked as read');
  } catch (error) { return next(error); }
};

export const getNotificationPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('notificationPreferences').lean();
    if (!user) return sendError(res, 404, 'User not found.');
    return sendSuccess(res, 200, 'Notification preferences retrieved', {
      preferences: { emailEnabled: user.notificationPreferences?.emailEnabled !== false },
      emailDeliveryConfigured: isNotificationEmailConfigured(),
    });
  } catch (error) { return next(error); }
};

export const updateNotificationPreferences = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)
      || Object.keys(req.body).length !== 1 || typeof req.body.emailEnabled !== 'boolean') {
      return sendError(res, 400, 'Provide only a boolean emailEnabled preference.');
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { 'notificationPreferences.emailEnabled': req.body.emailEnabled } },
      { new: true, runValidators: true, select: 'notificationPreferences' }
    ).lean();
    if (!user) return sendError(res, 404, 'User not found.');
    return sendSuccess(res, 200, 'Notification preferences updated', {
      preferences: { emailEnabled: user.notificationPreferences?.emailEnabled !== false },
      emailDeliveryConfigured: isNotificationEmailConfigured(),
    });
  } catch (error) { return next(error); }
};

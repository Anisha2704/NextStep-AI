import nodemailer from 'nodemailer';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { getMailConfig } from './mailConfig.js';
import { renderNotificationEmail } from './notificationEmailTemplate.js';

const MAX_ATTEMPTS = 5;
const LOCK_MS = 2 * 60 * 1000;
const BATCH_SIZE = 5;
let workerTimer;
let isProcessing = false;

const getTransporter = () => {
  const config = getMailConfig();
  if (!config) return null;

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
};

const retryDelayMs = (attempt) => Math.min(60 * 1000 * (2 ** Math.max(0, attempt - 1)), 60 * 60 * 1000);

const processOneEmail = async (transporter) => {
  const now = new Date();
  await Notification.updateMany(
    { emailStatus: 'sending', emailLockedUntil: { $lte: now }, emailAttempts: { $lt: MAX_ATTEMPTS } },
    { $set: { emailStatus: 'pending', emailLockedUntil: null } }
  );
  await Notification.updateMany(
    { emailStatus: 'sending', emailLockedUntil: { $lte: now }, emailAttempts: { $gte: MAX_ATTEMPTS } },
    { $set: { emailStatus: 'failed', emailLockedUntil: null, nextEmailAttemptAt: null } }
  );

  const notification = await Notification.findOneAndUpdate(
    {
      emailStatus: 'pending',
      emailAttempts: { $lt: MAX_ATTEMPTS },
      $or: [
        { nextEmailAttemptAt: null },
        { nextEmailAttemptAt: { $exists: false } },
        { nextEmailAttemptAt: { $lte: now } },
      ],
    },
    {
      $set: { emailStatus: 'sending', emailLockedUntil: new Date(now.getTime() + LOCK_MS) },
      $inc: { emailAttempts: 1 },
    },
    { new: true, sort: { createdAt: 1 } }
  );
  if (!notification) return false;

  const user = await User.findById(notification.user).select('email name notificationPreferences').lean();
  if (!user?.email || user.notificationPreferences?.emailEnabled === false) {
    await Notification.updateOne({ _id: notification._id }, {
      $set: { emailStatus: 'skipped', emailLockedUntil: null, nextEmailAttemptAt: null },
    });
    return true;
  }

  try {
    const mailConfig = getMailConfig();
    if (!mailConfig) {
      await Notification.updateOne({ _id: notification._id }, {
        $set: { emailStatus: 'skipped', emailLockedUntil: null, nextEmailAttemptAt: null },
      });
      return true;
    }
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const actionUrl = new URL(notification.link, baseUrl).toString();
    const preferencesUrl = new URL('/notifications', baseUrl).toString();
    const content = renderNotificationEmail({
      name: user.name,
      title: notification.title,
      message: notification.message,
      actionUrl,
      preferencesUrl,
    });
    await transporter.sendMail({
      from: { name: mailConfig.fromName, address: mailConfig.fromAddress },
      to: user.email,
      subject: `NextStep AI: ${notification.title.replace(/[\r\n]+/g, ' ').trim()}`,
      text: content.text,
      html: content.html,
    });
    await Notification.updateOne({ _id: notification._id }, {
      $set: { emailStatus: 'sent', emailLockedUntil: null, nextEmailAttemptAt: null },
    });
  } catch (error) {
    const attempts = notification.emailAttempts;
    const exhausted = attempts >= MAX_ATTEMPTS;
    await Notification.updateOne({ _id: notification._id }, {
      $set: {
        emailStatus: exhausted ? 'failed' : 'pending',
        emailLockedUntil: null,
        nextEmailAttemptAt: exhausted ? null : new Date(Date.now() + retryDelayMs(attempts)),
      },
    });
    console.error('Notification email delivery failed:', {
      notificationId: String(notification._id),
      attempt: attempts,
      code: error.code || 'SMTP_ERROR',
    });
  }

  return true;
};

const processEmailBatch = async () => {
  if (isProcessing) return;
  isProcessing = true;
  try {
    const transporter = getTransporter();
    if (!transporter) return;
    for (let index = 0; index < BATCH_SIZE; index += 1) {
      const claimed = await processOneEmail(transporter);
      if (!claimed) break;
    }
  } catch (error) {
    console.error('Notification email worker failed:', error.code || error.name || 'unknown error');
  } finally {
    isProcessing = false;
  }
};

export const startNotificationEmailWorker = () => {
  if (workerTimer) return;
  if (!getTransporter()) {
    console.warn('Notification email delivery is disabled until MAIL_HOST, MAIL_USER, MAIL_PASSWORD, and MAIL_FROM are configured.');
    return;
  }
  void processEmailBatch();
  workerTimer = setInterval(() => { void processEmailBatch(); }, 10000);
  workerTimer.unref?.();
};

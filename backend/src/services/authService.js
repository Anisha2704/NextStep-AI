import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { getMailConfig } from './mailConfig.js';

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id, user.role);

  return { user: user.toSafeObject(), token };
};

export const loginUser = async ({ email, password, rememberMe = false }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const expiresIn = rememberMe ? '30d' : '1d';
  const token = generateToken(user._id, user.role, expiresIn);

  return { user: user.toSafeObject(), token, rememberMe };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user.toSafeObject();
};

export const forgotPassword = async ({ email, clientUrl }) => {
  // Always return generic message to avoid email enumeration
  const user = await User.findOne({ email });
  if (!user) return;

  // Generate cryptographically secure token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

  const mailConfig = getMailConfig();
  if (!mailConfig) {
    // Clear tokens if mail is not configured so they don't linger
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    const error = new Error('Email service is not configured on the server.');
    error.statusCode = 503;
    throw error;
  }

  const transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: { user: mailConfig.user, pass: mailConfig.pass },
    connectionTimeout: 10000,
    socketTimeout: 20000,
  });

  const emailHtml = buildPasswordResetEmail({ name: user.name, resetUrl });

  await transporter.sendMail({
    from: { name: mailConfig.fromName, address: mailConfig.fromAddress },
    to: user.email,
    subject: 'Reset Your NextStep AI Password',
    text: `Hi ${user.name},\n\nYou requested a password reset.\n\nClick the link below to reset your password (valid for 20 minutes):\n${resetUrl}\n\nIf you did not request this, please ignore this email — your password will remain unchanged.\n\nNextStep AI`,
    html: emailHtml,
  });
};

export const resetPassword = async ({ token, newPassword }) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+password +passwordResetToken +passwordResetExpires');

  if (!user) {
    const error = new Error('Password reset link is invalid or has expired.');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return user.toSafeObject();
};

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

const buildPasswordResetEmail = ({ name, resetUrl }) => {
  const safeName = escapeHtml(name || 'there');
  const safeUrl = escapeHtml(resetUrl);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reset Your Password</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f2fa;font-family:Arial,Helvetica,sans-serif;color:#29243a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f2fa;">
      <tr><td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid #e8e4f0;border-radius:16px;overflow:hidden;">
          <tr><td style="height:6px;background-color:#6d28d9;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td style="padding:28px 36px 18px;">
            <p style="margin:0;color:#6d28d9;font-size:18px;font-weight:700;">NextStep AI</p>
          </td></tr>
          <tr><td style="padding:8px 36px 0;">
            <p style="margin:0 0 12px;color:#514b61;font-size:15px;line-height:24px;">Hi ${safeName},</p>
            <h1 style="margin:0 0 14px;color:#29243a;font-size:22px;font-weight:700;">Reset Your Password</h1>
            <p style="margin:0;color:#514b61;font-size:15px;line-height:24px;">We received a request to reset your NextStep AI password. Click the button below to choose a new password. This link expires in <strong>20 minutes</strong>.</p>
          </td></tr>
          <tr><td align="left" style="padding:28px 36px 32px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
              <td align="center" bgcolor="#6d28d9" style="border-radius:8px;">
                <a href="${safeUrl}" style="display:inline-block;padding:13px 28px;border:1px solid #6d28d9;border-radius:8px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Reset Password</a>
              </td>
            </tr></table>
            <p style="margin:20px 0 0;color:#706a7c;font-size:12px;line-height:18px;">If the button doesn&apos;t work, copy and paste this link into your browser:<br><a href="${safeUrl}" style="color:#5b21b6;word-break:break-all;">${safeUrl}</a></p>
          </td></tr>
          <tr><td style="padding:20px 36px 24px;border-top:1px solid #eeeaf4;">
            <p style="margin:0;color:#706a7c;font-size:12px;line-height:19px;">If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
          </td></tr>
        </table>
        <p style="margin:16px 0 0;color:#817b8c;font-size:11px;">NextStep AI &middot; Career planning and learning progress</p>
      </td></tr>
    </table>
  </body>
</html>`;
};

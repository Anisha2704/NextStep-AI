import { validationResult } from 'express-validator';
import * as authService from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { publishNotification } from '../services/notificationService.js';

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { name, email, password } = req.body;
    const { user, token } = await authService.registerUser({ name, email, password });
    await publishNotification({
      userId: user.id,
      type: 'welcome',
      title: 'Welcome to NextStep AI',
      message: 'Your account is ready. Complete your profile to get personalized career guidance.',
      link: '/profile',
    });

    return sendSuccess(res, 201, 'Registration successful', { user, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { email, password, rememberMe } = req.body;
    const isRemembered = Boolean(rememberMe);
    const { user, token } = await authService.loginUser({
      email,
      password,
      rememberMe: isRemembered,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
    };
    if (isRemembered) {
      cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }
    res.cookie('token', token, cookieOptions);

    return sendSuccess(res, 200, 'Login successful', {
      user,
      token,
      rememberMe: isRemembered,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
    });
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = req.user.toSafeObject();
    return sendSuccess(res, 200, 'User retrieved', { user });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { email } = req.body;
    const origin = req.get('origin') || req.body?.clientUrl;
    let clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    // If CLIENT_URL in env is localhost or default, but the request was made from a real IP/domain, use that
    if ((clientUrl.includes('localhost') || clientUrl.includes('127.0.0.1')) && origin) {
      if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        clientUrl = origin;
      }
    }

    await authService.forgotPassword({ email, clientUrl });

    // Always return the same generic message regardless of whether the email exists
    return sendSuccess(
      res,
      200,
      'If an account exists with this email, a password reset link has been sent.'
    );
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { token, newPassword } = req.body;
    await authService.resetPassword({ token, newPassword });

    return sendSuccess(res, 200, 'Password has been reset successfully. You can now log in with your new password.');
  } catch (error) {
    next(error);
  }
};

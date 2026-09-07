import { validationResult } from 'express-validator';
import * as authService from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { name, email, password } = req.body;
    const { user, token } = await authService.registerUser({ name, email, password });

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

    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });

    return sendSuccess(res, 200, 'Login successful', { user, token });
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

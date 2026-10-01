import { Router } from 'express';
import { register, login, getMe, forgotPassword, resetPassword, logout } from '../controllers/authController.js';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../validators/authValidator.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', ...registerValidation, register);
router.post('/login', ...loginValidation, login);
router.post('/logout', logout);
router.post('/forgot-password', ...forgotPasswordValidation, forgotPassword);
router.post('/reset-password', ...resetPasswordValidation, resetPassword);
router.get('/me', protect, getMe);

export default router;


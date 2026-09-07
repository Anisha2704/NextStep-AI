import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { registerValidation, loginValidation } from '../validators/authValidator.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', ...registerValidation, register);
router.post('/login', ...loginValidation, login);
router.get('/me', protect, getMe);

export default router;

import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { getMyRecommendations, getMyFullRecommendations } from '../controllers/recommendationController.js';

const router = Router();

// Protect all recommendation routes with user authentication
router.use(protect);

router.get('/me', getMyRecommendations);
router.get('/full', getMyFullRecommendations);

export default router;

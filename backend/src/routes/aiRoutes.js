import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { getCareerRecommendationsController } from '../controllers/careerController.js';

const router = express.Router();

// Protected endpoint: POST /api/ai/career/recommend
router.post('/career/recommend', protect, getCareerRecommendationsController);

export default router;

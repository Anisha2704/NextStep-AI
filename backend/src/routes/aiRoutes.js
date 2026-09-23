import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { getCareerRecommendationsController } from '../controllers/careerController.js';
import { analyzeSkillGapController } from '../controllers/skillGapController.js';

const router = express.Router();

// Protected endpoint: POST /api/ai/career/recommend
router.post('/career/recommend', protect, getCareerRecommendationsController);

// Protected endpoint: POST /api/ai/skill-gap/analyze
router.post('/skill-gap/analyze', protect, analyzeSkillGapController);

export default router;


import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { generateRoadmap, getRoadmap, getRoadmapReadinessController, updateMilestone } from '../controllers/learningController.js';
import { milestoneStatusValidation, roadmapGenerationValidation } from '../validators/learningValidator.js';

const router = Router();

router.use(protect);
router.get('/roadmap/readiness', getRoadmapReadinessController);
router.get('/roadmap', getRoadmap);
router.post('/roadmap/generate', roadmapGenerationValidation, generateRoadmap);
router.patch('/roadmap/milestones/:milestoneId', milestoneStatusValidation, updateMilestone);

export default router;

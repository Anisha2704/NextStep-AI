import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  evaluatePlacementReadinessController,
  getPlacementReadinessController,
} from '../controllers/placementController.js';

const router = Router();

router.use(protect);
router.get('/readiness', getPlacementReadinessController);
router.post('/readiness/evaluate', evaluatePlacementReadinessController);

export default router;

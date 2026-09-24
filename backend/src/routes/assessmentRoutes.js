import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  getAssessmentController,
  getAssessmentResultController,
  listAssessmentResultsController,
  listAssessmentsController,
  submitAssessmentController,
} from '../controllers/assessmentController.js';
import { assessmentSubmissionValidation } from '../validators/assessmentValidator.js';

const router = Router();

router.use(protect);
router.get('/', listAssessmentsController);
router.get('/results', listAssessmentResultsController);
router.get('/results/:resultId', getAssessmentResultController);
router.get('/:assessmentId', getAssessmentController);
router.post('/:assessmentId/submit', assessmentSubmissionValidation, submitAssessmentController);

export default router;

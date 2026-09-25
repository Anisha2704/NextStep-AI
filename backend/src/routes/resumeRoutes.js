import { Router } from 'express';
import express from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  analyzePastedResumeController,
  analyzeUploadedResumeController,
  deleteResumeAnalysisController,
  getResumeAnalysisController,
  listResumeAnalyses,
} from '../controllers/resumeController.js';
import { resumeTextValidation } from '../validators/resumeValidator.js';

const router = Router();

router.use(protect);
router.get('/', listResumeAnalyses);
router.post('/analyze', resumeTextValidation, analyzePastedResumeController);
router.post('/analyze-file', express.raw({ type: ['application/pdf', 'text/plain'], limit: '4mb' }), analyzeUploadedResumeController);
router.get('/:resumeId', getResumeAnalysisController);
router.delete('/:resumeId', deleteResumeAnalysisController);

export default router;

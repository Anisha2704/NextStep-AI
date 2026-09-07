import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  addSkill,
  updateSkill,
  deleteSkill,
  addProject,
  updateProject,
  deleteProject,
  addCertification,
  deleteCertification,
} from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.post('/skills', addSkill);
router.put('/skills/:skillId', updateSkill);
router.delete('/skills/:skillId', deleteSkill);

router.post('/projects', addProject);
router.put('/projects/:projectId', updateProject);
router.delete('/projects/:projectId', deleteProject);

router.post('/certifications', addCertification);
router.delete('/certifications/:certificationId', deleteCertification);

export default router;

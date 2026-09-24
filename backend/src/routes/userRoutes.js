import { Router } from 'express';
import {
  getProfile,
  createProfile,
  deleteProfile,
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
import { profileValidation, skillValidation, skillUpdateValidation } from '../validators/profileValidator.js';

const router = Router();

router.use(protect);

router.get('/profile', getProfile);
router.post('/profile', profileValidation, createProfile);
router.put('/profile', profileValidation, updateProfile);
router.patch('/profile', profileValidation, updateProfile);
router.delete('/profile', deleteProfile);

router.post('/skills', skillValidation, addSkill);
router.put('/skills/:skillId', skillUpdateValidation, updateSkill);
router.delete('/skills/:skillId', deleteSkill);

router.post('/projects', addProject);
router.put('/projects/:projectId', updateProject);
router.delete('/projects/:projectId', deleteProject);

router.post('/certifications', addCertification);
router.delete('/certifications/:certificationId', deleteCertification);

export default router;

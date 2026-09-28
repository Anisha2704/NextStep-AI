import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import requireRole from '../middleware/roleMiddleware.js';
import { overview, listUsers, updateUserRole, listCourses, createCourse, updateCourse, deleteCourse, listAssessments, createAssessment, updateAssessment, deleteAssessment } from '../controllers/adminController.js';

const router = Router();
router.use(protect, requireRole('admin'));
router.get('/overview', overview);
router.get('/users', listUsers);
router.patch('/users/:userId/role', updateUserRole);
router.get('/courses', listCourses);
router.post('/courses', createCourse);
router.put('/courses/:courseId', updateCourse);
router.delete('/courses/:courseId', deleteCourse);
router.get('/assessments', listAssessments);
router.post('/assessments', createAssessment);
router.patch('/assessments/:assessmentId', updateAssessment);
router.delete('/assessments/:assessmentId', deleteAssessment);
export default router;

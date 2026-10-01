import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import requireRole from '../middleware/roleMiddleware.js';
import {
  overview,
  listUsers,
  getUserDetails,
  updateUserRole,
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  listAssessments,
  getAssessmentDetails,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  listAttempts,
  exportAttemptsCsv,
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/adminController.js';

const router = Router();

// Protect all admin routes with authentication and admin role requirement
router.use(protect, requireRole('admin'));

// Overview
router.get('/overview', overview);

// User Management
router.get('/users', listUsers);
router.get('/users/:userId', getUserDetails);
router.patch('/users/:userId/role', updateUserRole);

// Course Management
router.get('/courses', listCourses);
router.post('/courses', createCourse);
router.put('/courses/:courseId', updateCourse);
router.delete('/courses/:courseId', deleteCourse);

// Assessment Management
router.get('/assessments', listAssessments);
router.get('/assessments/:assessmentId', getAssessmentDetails);
router.post('/assessments', createAssessment);
router.patch('/assessments/:assessmentId', updateAssessment);
router.delete('/assessments/:assessmentId', deleteAssessment);

// Student Attempt Analytics
router.get('/attempts', listAttempts);
router.get('/attempts/export', exportAttemptsCsv);

// Admin Announcements
router.get('/announcements', listAnnouncements);
router.post('/announcements', createAnnouncement);
router.patch('/announcements/:announcementId', updateAnnouncement);
router.delete('/announcements/:announcementId', deleteAnnouncement);

export default router;

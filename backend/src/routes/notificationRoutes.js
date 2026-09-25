import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  getNotificationPreferences,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from '../controllers/notificationController.js';

const router = Router();
router.use(protect);
router.get('/', listNotifications);
router.get('/preferences', getNotificationPreferences);
router.patch('/preferences', updateNotificationPreferences);
router.patch('/read-all', markAllNotificationsRead);
router.patch('/:notificationId/read', markNotificationRead);

export default router;

import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import Profile from '../pages/profile/Profile';
import CareerPage from '../pages/career/CareerPage';
import SkillsPage from '../pages/skills/SkillsPage';
import LearningPage from '../pages/learning/LearningPage';
import AssessmentPage from '../pages/assessment/AssessmentPage';
import ResumePage from '../pages/resume/ResumePage';
import PlacementPage from '../pages/placement/PlacementPage';
import PlaceholderPage from '../pages/PlaceholderPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/career" element={<CareerPage />} />

        <Route
          path="/career/recommendations"
          element={<PlaceholderPage title="Career Recommendations" />}
        />
        <Route path="/career/roadmap" element={<PlaceholderPage title="Career Roadmap" />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/skills/assessment" element={<AssessmentPage />} />
        <Route path="/skills/gaps" element={<SkillsPage />} />

        <Route path="/learning" element={<LearningPage />} />
        <Route path="/learning/roadmap" element={<Navigate to="/learning" replace />} />
        <Route path="/learning/courses" element={<PlaceholderPage title="Courses" />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/placement" element={<PlacementPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/ai-coach" element={<PlaceholderPage title="AI Career Assistant" />} />
        <Route path="/admin" element={<PlaceholderPage title="Admin Dashboard" />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;

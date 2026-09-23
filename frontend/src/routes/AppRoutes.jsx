import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import Profile from '../pages/profile/Profile';
import CareerPage from '../pages/career/CareerPage';
import PlaceholderPage from '../pages/PlaceholderPage';

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
        <Route
          path="/skills"
          element={<PlaceholderPage title="Skills" description="Skill assessment coming in Phase 4." />}
        />
        <Route path="/skills/assessment" element={<PlaceholderPage title="Skill Assessment" />} />
        <Route path="/skills/gaps" element={<PlaceholderPage title="Skill Gaps" />} />
        <Route path="/learning" element={<PlaceholderPage title="Learning" />} />
        <Route path="/learning/roadmap" element={<PlaceholderPage title="Learning Roadmap" />} />
        <Route path="/learning/courses" element={<PlaceholderPage title="Courses" />} />
        <Route path="/assessment" element={<PlaceholderPage title="Assessment" />} />
        <Route path="/resume" element={<PlaceholderPage title="Resume Analyzer" />} />
        <Route path="/placement" element={<PlaceholderPage title="Placement Readiness" />} />
        <Route path="/ai-coach" element={<PlaceholderPage title="AI Career Assistant" />} />
        <Route path="/admin" element={<PlaceholderPage title="Admin Dashboard" />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;

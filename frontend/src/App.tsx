import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import ProtectedRoute from './auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import RoleDiscoveryPage from './pages/RoleDiscoveryPage';
import DashboardPage from './pages/DashboardPage';
import MarketPage from './pages/MarketPage';
import GapsPage from './pages/GapsPage';
import ProjectsPage from './pages/ProjectsPage';
import AcademicPage from './pages/AcademicPage';
import ActionPlanPage from './pages/ActionPlanPage';
import AdminCollectionPage from './pages/AdminCollectionPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        {/* Onboarding can be full-screen or within layout; having it full or with layout */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Core application routes wrapped in consistent AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/role-discovery" element={<RoleDiscoveryPage />} />
          <Route path="/market/:roleId" element={<MarketPage />} />
          <Route path="/gaps" element={<GapsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/academic" element={<AcademicPage />} />
          <Route path="/action-plan" element={<ActionPlanPage />} />
          <Route path="/admin/collection" element={<AdminCollectionPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
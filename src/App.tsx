import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import OnboardingPage from '@/pages/OnboardingPage';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardPage from '@/pages/DashboardPage';
import ProfilePage from '@/pages/ProfilePage';
import FamilySafetyPage from '@/pages/FamilySafetyPage';
import WeatherPage from '@/pages/WeatherPage';
import AlertsPage from '@/pages/AlertsPage';
import RiskMapPage from '@/pages/RiskMapPage';
import HistoryPage from '@/pages/HistoryPage';
import NewsPage from '@/pages/NewsPage';
import HospitalsPage from '@/pages/HospitalsPage';
import SheltersPage from '@/pages/SheltersPage';
import ReportPage from '@/pages/ReportPage';
import ContactsPage from '@/pages/ContactsPage';
import AssistantPage from '@/pages/AssistantPage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';
import type { ReactNode } from 'react';

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, onboardingComplete } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!onboardingComplete && window.location.pathname !== '/onboarding')
    return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function OnboardingRoute({ children }: { children: ReactNode }) {
  const { user, loading, onboardingComplete } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (onboardingComplete) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading, onboardingComplete } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (user) {
    return <Navigate to={onboardingComplete ? '/dashboard' : '/onboarding'} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
              <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="family" element={<FamilySafetyPage />} />
                <Route path="weather" element={<WeatherPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="risk-map" element={<RiskMapPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="news" element={<NewsPage />} />
                <Route path="hospitals" element={<HospitalsPage />} />
                <Route path="shelters" element={<SheltersPage />} />
                <Route path="report" element={<ReportPage />} />
                <Route path="contacts" element={<ContactsPage />} />
                <Route path="assistant" element={<AssistantPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

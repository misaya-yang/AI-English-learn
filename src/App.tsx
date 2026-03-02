import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserDataProvider } from '@/contexts/UserDataContext';
import { Toaster } from '@/components/ui/sonner';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import MagicLinkPage from '@/pages/auth/MagicLinkPage';
import AuthCallbackPage from '@/pages/auth/AuthCallbackPage';
import OnboardingPage from '@/pages/auth/OnboardingPage';

// Dashboard Pages
import DashboardLayout from '@/layouts/DashboardLayout';
import TodayPage from '@/pages/dashboard/TodayPage';
import ReviewPage from '@/pages/dashboard/ReviewPage';
import PracticePage from '@/pages/dashboard/PracticePage';
import VocabularyBankPage from '@/pages/dashboard/VocabularyBankPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import ProfilePage from '@/pages/dashboard/ProfilePage';

// Public Pages
import WordOfTheDayPage from '@/pages/WordOfTheDayPage';
import PricingPage from '@/pages/PricingPage';

const AnalyticsPage = lazy(() => import('@/pages/dashboard/AnalyticsPage'));
const ChatPage = lazy(() => import('@/pages/dashboard/ChatPage'));
const ExamPrepPage = lazy(() => import('@/pages/dashboard/ExamPrepPage'));
const MemoryCenterPage = lazy(() => import('@/pages/dashboard/MemoryCenterPage'));

const RouteFallback = () => (
  <div className="flex h-[40vh] items-center justify-center text-sm text-muted-foreground">
    Loading...
  </div>
);

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vocabdaily-theme">
      <AuthProvider>
        <UserDataProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/word-of-the-day" element={<WordOfTheDayPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/magic-link" element={<MagicLinkPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard/today" replace />} />
                <Route path="today" element={<TodayPage />} />
                <Route path="review" element={<ReviewPage />} />
                <Route path="practice" element={<PracticePage />} />
                <Route path="exam" element={<Suspense fallback={<RouteFallback />}><ExamPrepPage /></Suspense>} />
                <Route path="vocabulary" element={<VocabularyBankPage />} />
                <Route path="analytics" element={<Suspense fallback={<RouteFallback />}><AnalyticsPage /></Suspense>} />
                <Route path="chat" element={<Suspense fallback={<RouteFallback />}><ChatPage /></Suspense>} />
                <Route path="memory" element={<Suspense fallback={<RouteFallback />}><MemoryCenterPage /></Suspense>} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </Router>
          <Toaster position="bottom-right" richColors />
        </UserDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

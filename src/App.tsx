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
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage';
import ChatPage from '@/pages/dashboard/ChatPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import ProfilePage from '@/pages/dashboard/ProfilePage';
import ExamPrepPage from '@/pages/dashboard/ExamPrepPage';

// Public Pages
import WordOfTheDayPage from '@/pages/WordOfTheDayPage';
import PricingPage from '@/pages/PricingPage';

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
                <Route path="exam" element={<ExamPrepPage />} />
                <Route path="vocabulary" element={<VocabularyBankPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </Router>
          <Toaster position="top-center" richColors />
        </UserDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

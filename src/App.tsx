import { Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserDataProvider } from '@/contexts/UserDataContext';
import { Toaster } from '@/components/ui/sonner';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { lazyWithRetry } from '@/lib/lazyWithRetry';
import { queryClient } from '@/lib/queryClient';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import MagicLinkPage from '@/pages/auth/MagicLinkPage';
import AuthCallbackPage from '@/pages/auth/AuthCallbackPage';
import OnboardingPage from '@/pages/auth/OnboardingPage';

// Dashboard Pages
import DashboardLayout from '@/layouts/DashboardLayout';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import ProfilePage from '@/pages/dashboard/ProfilePage';

// Public Pages
import WordOfTheDayPage from '@/pages/WordOfTheDayPage';
import PricingPage from '@/pages/PricingPage';

const TodayPage = lazyWithRetry(() => import('@/pages/dashboard/TodayPage'), 'today');
const ReviewPage = lazyWithRetry(() => import('@/pages/dashboard/ReviewPage'), 'review');
const PracticePage = lazyWithRetry(() => import('@/pages/dashboard/PracticePage'), 'practice');
const ExamPrepPage = lazyWithRetry(() => import('@/pages/dashboard/ExamPrepPage'), 'exam');
const VocabularyBankPage = lazyWithRetry(() => import('@/pages/dashboard/VocabularyBankPage'), 'vocabulary');
const AnalyticsPage = lazyWithRetry(() => import('@/pages/dashboard/AnalyticsPage'), 'analytics');
const ChatPage = lazyWithRetry(() => import('@/pages/dashboard/ChatPage'), 'chat');
const MemoryCenterPage = lazyWithRetry(() => import('@/pages/dashboard/MemoryCenterPage'), 'memory');

const RouteFallback = () => (
  <div className="flex h-[40vh] items-center justify-center text-sm text-muted-foreground">
    Loading...
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
                <Route element={<RequireAuth />}>
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Navigate to="/dashboard/today" replace />} />
                    <Route path="today" element={<Suspense fallback={<RouteFallback />}><TodayPage /></Suspense>} />
                    <Route path="review" element={<Suspense fallback={<RouteFallback />}><ReviewPage /></Suspense>} />
                    <Route path="practice" element={<Suspense fallback={<RouteFallback />}><PracticePage /></Suspense>} />
                    <Route path="exam" element={<Suspense fallback={<RouteFallback />}><ExamPrepPage /></Suspense>} />
                    <Route path="vocabulary" element={<Suspense fallback={<RouteFallback />}><VocabularyBankPage /></Suspense>} />
                    <Route path="analytics" element={<Suspense fallback={<RouteFallback />}><AnalyticsPage /></Suspense>} />
                    <Route path="chat" element={<Suspense fallback={<RouteFallback />}><ChatPage /></Suspense>} />
                    <Route path="memory" element={<Suspense fallback={<RouteFallback />}><MemoryCenterPage /></Suspense>} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>
                </Route>
              </Routes>
            </Router>
            <Toaster position="bottom-right" richColors />
          </UserDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

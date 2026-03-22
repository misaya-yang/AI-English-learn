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

const HomePage = lazyWithRetry(() => import('@/pages/Home'), 'home');
const LoginPage = lazyWithRetry(() => import('@/pages/auth/LoginPage'), 'login');
const RegisterPage = lazyWithRetry(() => import('@/pages/auth/RegisterPage'), 'register');
const MagicLinkPage = lazyWithRetry(() => import('@/pages/auth/MagicLinkPage'), 'magic-link');
const AuthCallbackPage = lazyWithRetry(() => import('@/pages/auth/AuthCallbackPage'), 'auth-callback');
const OnboardingPage = lazyWithRetry(() => import('@/pages/auth/OnboardingPage'), 'onboarding');
const DashboardLayout = lazyWithRetry(() => import('@/layouts/DashboardLayout'), 'dashboard-layout');
const WordOfTheDayPage = lazyWithRetry(() => import('@/pages/WordOfTheDayPage'), 'word-of-the-day');
const PricingPage = lazyWithRetry(() => import('@/pages/PricingPage'), 'pricing');

const TodayPage = lazyWithRetry(() => import('@/pages/dashboard/TodayPage'), 'today');
const ReviewPage = lazyWithRetry(() => import('@/pages/dashboard/ReviewPage'), 'review');
const PracticePage = lazyWithRetry(() => import('@/pages/dashboard/PracticePage'), 'practice');
const ExamPrepPage = lazyWithRetry(() => import('@/pages/dashboard/ExamPrepPage'), 'exam');
const VocabularyBankPage = lazyWithRetry(() => import('@/pages/dashboard/VocabularyBankPage'), 'vocabulary');
const AnalyticsPage = lazyWithRetry(() => import('@/pages/dashboard/AnalyticsPage'), 'analytics');
const ChatPage = lazyWithRetry(() => import('@/pages/dashboard/ChatPage'), 'chat');
const MemoryCenterPage = lazyWithRetry(() => import('@/pages/dashboard/MemoryCenterPage'), 'memory');
const SettingsPage = lazyWithRetry(() => import('@/pages/dashboard/SettingsPage'), 'settings');
const ProfilePage = lazyWithRetry(() => import('@/pages/dashboard/ProfilePage'), 'profile');
const ReadingPage = lazyWithRetry(() => import('@/pages/dashboard/ReadingPage'), 'reading');
const ListeningPage = lazyWithRetry(() => import('@/pages/dashboard/ListeningPage'), 'listening');
const GrammarPage = lazyWithRetry(() => import('@/pages/dashboard/GrammarPage'), 'grammar');
const LeaderboardPage = lazyWithRetry(() => import('@/pages/dashboard/LeaderboardPage'), 'leaderboard');

const RouteFallback = () => (
  <div className="flex h-[40vh] items-center justify-center text-sm text-muted-foreground">
    Loading...
  </div>
);

const withRouteFallback = (element: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
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
                <Route path="/" element={withRouteFallback(<HomePage />)} />
                <Route path="/word-of-the-day" element={withRouteFallback(<WordOfTheDayPage />)} />
                <Route path="/pricing" element={withRouteFallback(<PricingPage />)} />

                {/* Auth Routes */}
                <Route path="/login" element={withRouteFallback(<LoginPage />)} />
                <Route path="/register" element={withRouteFallback(<RegisterPage />)} />
                <Route path="/magic-link" element={withRouteFallback(<MagicLinkPage />)} />
                <Route path="/auth/callback" element={withRouteFallback(<AuthCallbackPage />)} />
                <Route path="/onboarding" element={withRouteFallback(<OnboardingPage />)} />

                {/* Dashboard Routes */}
                <Route element={<RequireAuth />}>
                  <Route path="/dashboard" element={withRouteFallback(<DashboardLayout />)}>
                    <Route index element={<Navigate to="/dashboard/today" replace />} />
                    <Route path="today" element={withRouteFallback(<TodayPage />)} />
                    <Route path="review" element={withRouteFallback(<ReviewPage />)} />
                    <Route path="practice" element={withRouteFallback(<PracticePage />)} />
                    <Route path="exam" element={withRouteFallback(<ExamPrepPage />)} />
                    <Route path="vocabulary" element={withRouteFallback(<VocabularyBankPage />)} />
                    <Route path="analytics" element={withRouteFallback(<AnalyticsPage />)} />
                    <Route path="chat" element={withRouteFallback(<ChatPage />)} />
                    <Route path="memory" element={withRouteFallback(<MemoryCenterPage />)} />
                    <Route path="reading" element={withRouteFallback(<ReadingPage />)} />
                    <Route path="listening" element={withRouteFallback(<ListeningPage />)} />
                    <Route path="grammar" element={withRouteFallback(<GrammarPage />)} />
                    <Route path="leaderboard" element={withRouteFallback(<LeaderboardPage />)} />
                    <Route path="settings" element={withRouteFallback(<SettingsPage />)} />
                    <Route path="profile" element={withRouteFallback(<ProfilePage />)} />
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

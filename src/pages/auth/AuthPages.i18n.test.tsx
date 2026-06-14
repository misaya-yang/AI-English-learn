import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authState = vi.hoisted(() => ({
  isAuthenticated: false,
  login: vi.fn(),
  register: vi.fn(),
  startDemoSession: vi.fn(),
  updateUserProfile: vi.fn(),
  validatePassword: vi.fn(() => ({ isValid: false })),
}));

const userDataState = vi.hoisted(() => ({
  setActiveBook: vi.fn(),
  updateLearningProfile: vi.fn(),
  refreshDailyMission: vi.fn(),
}));

const i18nState = vi.hoisted(() => ({
  language: 'en',
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? '',
    i18n: { language: i18nState.language },
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('@/contexts/UserDataContext', () => ({
  useUserData: () => userDataState,
}));

vi.mock('@/lib/supabase-auth', () => ({
  resetPassword: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => new Promise(() => undefined)),
    },
    from: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import MagicLinkPage from './MagicLinkPage';
import OnboardingPage from './OnboardingPage';
import AuthCallbackPage from './AuthCallbackPage';
import { BUILT_IN_WORD_BOOK_IDS } from '@/data/wordBooks';

const renderPage = (page: React.ReactNode) =>
  render(
    <MemoryRouter>
      {page}
    </MemoryRouter>,
  );

describe('auth pages i18n surfaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18nState.language = 'en';
    authState.isAuthenticated = false;
    authState.startDemoSession.mockResolvedValue({ success: true });
    authState.updateUserProfile.mockResolvedValue(true);
  });

  it('renders the login form in English without Chinese form copy', () => {
    renderPage(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByText('邮箱')).not.toBeInTheDocument();
    expect(screen.queryByText('登录')).not.toBeInTheDocument();
  });

  it('starts a local demo session without remote login or registration', async () => {
    renderPage(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Try local demo' }));

    await waitFor(() => {
      expect(authState.startDemoSession).toHaveBeenCalledTimes(1);
    });
    expect(authState.login).not.toHaveBeenCalled();
    expect(authState.register).not.toHaveBeenCalled();
  });

  it('renders the register form in English without Chinese password guidance', () => {
    renderPage(<RegisterPage />);

    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByLabelText('Display name')).toBeInTheDocument();
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.queryByText('创建账号')).not.toBeInTheDocument();
    expect(screen.queryByText('至少 8 个字符')).not.toBeInTheDocument();
  });

  it('renders the magic-link page in English without Chinese success copy', () => {
    renderPage(<MagicLinkPage />);

    expect(screen.getByRole('heading', { name: 'Sign in with magic link' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send login link' })).toBeInTheDocument();
    expect(screen.queryByText('使用魔法链接登录')).not.toBeInTheDocument();
  });

  it('renders onboarding step one in English without bilingual helper text', () => {
    authState.isAuthenticated = true;

    renderPage(<OnboardingPage />);

    expect(screen.getByRole('heading', { name: "What's your English level?" })).toBeInTheDocument();
    expect(screen.getByText('Choose your current English level')).toBeInTheDocument();
    expect(screen.getByText('or pick manually')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.queryByText('手动选择')).not.toBeInTheDocument();
    expect(screen.queryByText('基础词汇和表达')).not.toBeInTheDocument();
  });

  it('renders onboarding follow-up steps in the active language only', () => {
    authState.isAuthenticated = true;
    i18nState.language = 'zh-CN';

    renderPage(<OnboardingPage />);
    fireEvent.click(screen.getByRole('button', { name: /下一步/i }));

    expect(screen.getByRole('heading', { level: 2, name: '你这次学习的主要目标是？' })).toBeInTheDocument();
    expect(screen.getByText('综合提升')).toBeInTheDocument();
    expect(screen.queryByText('General fluency')).not.toBeInTheDocument();
    expect(screen.queryByText('Your target shapes the starter book, mission, and path')).not.toBeInTheDocument();
  });

  it('persists the active book and learning profile chosen by onboarding placement', async () => {
    authState.isAuthenticated = true;

    renderPage(<OnboardingPage />);
    fireEvent.click(screen.getByRole('button', { name: /Advanced/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    fireEvent.click(screen.getByRole('button', { name: /IELTS target/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    expect(screen.getByText('IELTS Academic Core')).toBeInTheDocument();
    expect(screen.getByText('IELTS Preparation')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Get started/i }));

    await waitFor(() => {
      expect(authState.updateUserProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          cefrLevel: 'C1',
          preferredTopics: expect.arrayContaining(['Academic']),
        }),
      );
    });

    expect(userDataState.setActiveBook).toHaveBeenCalledWith(BUILT_IN_WORD_BOOK_IDS.IELTS_ACADEMIC_CORE);
    expect(userDataState.updateLearningProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'C1',
        target: 'IELTS 7.0',
        tracks: expect.arrayContaining(['exam_boost']),
      }),
    );
    expect(userDataState.refreshDailyMission).toHaveBeenCalledTimes(1);
  });

  it('renders auth callback progress in English without Chinese duplicate copy', () => {
    renderPage(<AuthCallbackPage />);

    expect(screen.getByRole('heading', { name: 'Completing sign in' })).toBeInTheDocument();
    expect(screen.getByText('Almost there. Verifying your session.')).toBeInTheDocument();
    expect(screen.queryByText('正在验证你的登录信息……')).not.toBeInTheDocument();
  });
});

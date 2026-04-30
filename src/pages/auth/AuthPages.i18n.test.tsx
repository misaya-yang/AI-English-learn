import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authState = vi.hoisted(() => ({
  isAuthenticated: false,
  login: vi.fn(),
  register: vi.fn(),
  updateUserProfile: vi.fn(),
  validatePassword: vi.fn(() => ({ isValid: false })),
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

    expect(screen.getByRole('heading', { level: 2, name: '设定每日目标' })).toBeInTheDocument();
    expect(screen.getByText('单词 / 天')).toBeInTheDocument();
    expect(screen.queryByText('words per day')).not.toBeInTheDocument();
    expect(screen.queryByText('Recommended:')).not.toBeInTheDocument();
  });

  it('renders auth callback progress in English without Chinese duplicate copy', () => {
    renderPage(<AuthCallbackPage />);

    expect(screen.getByRole('heading', { name: 'Completing sign in' })).toBeInTheDocument();
    expect(screen.getByText('Almost there — verifying your session.')).toBeInTheDocument();
    expect(screen.queryByText('正在验证你的登录信息……')).not.toBeInTheDocument();
  });
});

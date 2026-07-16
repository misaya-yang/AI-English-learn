import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authState = vi.hoisted(() => ({
  isAuthenticated: false,
  login: vi.fn(),
  register: vi.fn(),
  startDemoSession: vi.fn(),
  validatePassword: vi.fn(),
}));

const resetPasswordMock = vi.hoisted(() => vi.fn());

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
  resetPassword: resetPasswordMock,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

const validateLikeProduction = (password: string) => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('密码至少需要8个字符');
  if (!/[A-Z]/.test(password)) errors.push('密码需要包含至少一个大写字母');
  if (!/[a-z]/.test(password)) errors.push('密码需要包含至少一个小写字母');
  if (!/[0-9]/.test(password)) errors.push('密码需要包含至少一个数字');
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('密码需要包含至少一个特殊字符 (!@#$%^&*等)');
  }
  return {
    isValid: errors.length === 0,
    errors,
    strength: errors.length === 0 ? 'strong' as const : 'weak' as const,
  };
};

const renderLogin = (entry = '/login') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <LoginPage />
    </MemoryRouter>,
  );

const renderRegister = (entry = '/register') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <RegisterPage />
    </MemoryRouter>,
  );

describe('Login and Register UI behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18nState.language = 'en';
    authState.isAuthenticated = false;
    authState.login.mockResolvedValue({ success: false, error: 'Incorrect email or password' });
    authState.register.mockResolvedValue({ success: false, error: 'Registration unavailable' });
    authState.startDemoSession.mockResolvedValue({ success: true });
    authState.validatePassword.mockImplementation(validateLikeProduction);
    resetPasswordMock.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses the Radix reset dialog, closes on Escape, and restores focus to the trigger', async () => {
    resetPasswordMock.mockResolvedValue({ success: false, error: 'Reset provider unavailable' });
    renderLogin();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'learner@example.com' } });
    const trigger = screen.getByRole('button', { name: 'Forgot password?' });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = await screen.findByRole('dialog');
    const resetEmail = within(dialog).getByLabelText('Email');
    await waitFor(() => expect(resetEmail).toHaveFocus());
    expect(resetEmail).toHaveValue('learner@example.com');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Send reset link' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Reset provider unavailable');

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('uses an honest local-demo affordance instead of an email icon', () => {
    renderLogin();

    const demoButton = screen.getByRole('button', { name: 'Open local demo' });
    expect(within(demoButton).getByTestId('local-demo-icon')).toHaveClass('lucide-monitor-play');
    expect(demoButton.querySelector('.lucide-mail')).toBeNull();
    expect(
      screen.getByText(/without creating or signing in to a real account/i),
    ).toBeInTheDocument();
  });

  it('announces login validation and timeout states', async () => {
    vi.useFakeTimers();
    authState.login.mockImplementation(() => new Promise(() => undefined));
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter your email and password');

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'learner@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByRole('button', { name: 'Signing in...' }).closest('form')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Sign-in timed out');
  });

  it('derives the live password checklist from validator errors and wires descriptions', () => {
    authState.validatePassword.mockReturnValue({
      isValid: false,
      errors: ['密码需要包含至少一个数字'],
      strength: 'weak',
    });
    renderRegister();

    const password = screen.getByLabelText('Password');
    fireEvent.change(password, { target: { value: 'validator-controlled' } });

    expect(password).toHaveAttribute(
      'aria-describedby',
      'password-requirements password-validation-status',
    );
    expect(password).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('One number').closest('li')).toHaveTextContent('Not met');
    expect(screen.getByText('One uppercase letter').closest('li')).toHaveTextContent('Met');
  });

  it('preserves the requested redirect through registration and onboarding', async () => {
    authState.validatePassword.mockReturnValue({
      isValid: true,
      errors: [],
      strength: 'strong',
    });
    authState.register.mockResolvedValue({ success: true });

    function OnboardingLocation() {
      const location = useLocation();
      return <div>Onboarding route: {location.search}</div>;
    }

    render(
      <MemoryRouter initialEntries={['/register?redirect=%2Fdashboard%2Fpractice']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<OnboardingLocation />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/login?redirect=%2Fdashboard%2Fpractice',
    );
    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'New learner' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'validator-approved' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'validator-approved' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Onboarding route: ?redirect=%2Fdashboard%2Fpractice')).toBeInTheDocument();
    expect(authState.register).toHaveBeenCalledWith(
      'new@example.com',
      'validator-approved',
      'New learner',
    );
  });
});

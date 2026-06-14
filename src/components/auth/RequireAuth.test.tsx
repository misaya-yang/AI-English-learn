import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RequireAuth } from './RequireAuth';

const useAuthMock = vi.fn();
let i18nLanguage = 'zh-CN';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: i18nLanguage } }),
}));

describe('RequireAuth', () => {
  it('shows an actionable loading state while auth is being confirmed', () => {
    i18nLanguage = 'zh-CN';
    useAuthMock.mockReturnValue({ isAuthenticated: false, isLoading: true });

    render(
      <MemoryRouter initialEntries={['/dashboard/today']}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/dashboard/today" element={<div>Private dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('正在确认登录状态');
    expect(screen.getByText('确认后会继续打开刚才的学习任务。')).toBeInTheDocument();
    expect(screen.queryByText('Private dashboard')).not.toBeInTheDocument();
  });

  it('uses English auth-loading copy when the app language is English', () => {
    i18nLanguage = 'en-US';
    useAuthMock.mockReturnValue({ isAuthenticated: false, isLoading: true });

    render(
      <MemoryRouter initialEntries={['/dashboard/today']}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/dashboard/today" element={<div>Private dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Confirming your sign-in status');
    expect(screen.queryByText('正在确认登录状态')).not.toBeInTheDocument();
  });
});

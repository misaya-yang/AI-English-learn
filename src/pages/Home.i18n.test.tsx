import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@/contexts/ThemeContext';
import Home from './Home';

const i18nState = vi.hoisted(() => ({
  language: 'en',
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: i18nState.language },
    t: (_key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? _key,
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
  }),
}));

const renderHome = () =>
  render(
    <MemoryRouter>
      <ThemeProvider defaultTheme="system" storageKey="home-test-theme">
        <Home />
      </ThemeProvider>
    </MemoryRouter>,
  );

describe('Home i18n surface', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    i18nState.language = 'en';
  });

  it('does not mix Chinese-only marketing labels into English mode', () => {
    renderHome();

    expect(screen.getByText('Due review')).toBeInTheDocument();
    expect(screen.getByText('New words')).toBeInTheDocument();
    expect(screen.getByText('Practice')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Try sample' })).toHaveAttribute('href', '/demo');
    expect(screen.queryByText('到期复习')).not.toBeInTheDocument();
    expect(screen.queryByText('新词')).not.toBeInTheDocument();
    expect(screen.queryByText('听说读写')).not.toBeInTheDocument();
  });
});

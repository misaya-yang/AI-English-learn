import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthShell } from './AuthShell';

const renderShell = (props: React.ComponentProps<typeof AuthShell>) =>
  render(
    <MemoryRouter>
      <AuthShell {...props} />
    </MemoryRouter>,
  );

describe('AuthShell', () => {
  it('renders both English and Chinese title labels', () => {
    renderShell({
      title: 'Sign in',
      titleZh: '登录',
      children: <button type="button">submit</button>,
    });

    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText('登录')).toBeInTheDocument();
  });

  it('renders both English and Chinese subtitles when provided', () => {
    renderShell({
      title: 'Welcome back',
      titleZh: '欢迎回来',
      subtitle: 'Continue your daily learning workflow.',
      subtitleZh: '继续你今天的学习计划。',
      children: <span>panel</span>,
    });

    expect(screen.getByText('Continue your daily learning workflow.')).toBeInTheDocument();
    expect(screen.getByText('继续你今天的学习计划。')).toBeInTheDocument();
  });

  it('always renders the bilingual back-to-home affordance', () => {
    renderShell({
      title: 'Sign in',
      titleZh: '登录',
      children: <span>panel</span>,
    });

    // The "back to home" link includes both English and Chinese labels so
    // either language works as a hit target.
    expect(screen.getByText('Back to home')).toBeInTheDocument();
    expect(screen.getByText('返回首页')).toBeInTheDocument();
    // Also exposes the brand mark with an accessible name.
    // BrandMark renders twice (mobile inline + desktop aside); both share the
    // same accessible label, so use getAllByLabelText.
    expect(
      screen.getAllByLabelText('VocabDaily — back to home').length,
    ).toBeGreaterThan(0);
  });

  it('renders the children panel content (forms, success states, etc.)', () => {
    renderShell({
      title: 'Sign in',
      titleZh: '登录',
      children: (
        <form aria-label="auth-form">
          <input aria-label="email" />
        </form>
      ),
    });
    expect(screen.getByLabelText('auth-form')).toBeInTheDocument();
    expect(screen.getByLabelText('email')).toBeInTheDocument();
  });

  it('renders an optional footer slot below the panel', () => {
    renderShell({
      title: 'Sign in',
      titleZh: '登录',
      children: <span>panel</span>,
      footer: <a href="/register">Create account</a>,
    });
    expect(screen.getByText('Create account')).toBeInTheDocument();
  });
});

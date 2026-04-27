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
  it('renders the English title as the primary h1', () => {
    renderShell({
      title: 'Sign in',
      titleZh: '登录',
      children: <button type="button">submit</button>,
    });

    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
    // titleZh is no longer rendered in the form column header
    expect(screen.queryByText('登录')).not.toBeInTheDocument();
  });

  it('renders subtitle when provided, but not subtitleZh', () => {
    renderShell({
      title: 'Welcome back',
      titleZh: '欢迎回来',
      subtitle: 'Continue your daily learning workflow.',
      subtitleZh: '继续你今天的学习计划。',
      children: <span>panel</span>,
    });

    expect(screen.getByText('Continue your daily learning workflow.')).toBeInTheDocument();
    // subtitleZh is no longer rendered
    expect(screen.queryByText('继续你今天的学习计划。')).not.toBeInTheDocument();
  });

  it('renders the English side-rail headline and Chinese tagline', () => {
    renderShell({
      title: 'Welcome back',
      titleZh: '欢迎回来',
      children: <span>panel</span>,
    });

    expect(screen.getByText('A calmer way to practice English every day.')).toBeInTheDocument();
    expect(screen.getByText('把每天的复习、练习、教练反馈整合到一个学习工作台。')).toBeInTheDocument();
    // Bullets are Chinese-only
    expect(screen.getByText('· 基于 FSRS 的间隔重复')).toBeInTheDocument();
  });

  it('renders the Chinese-only back-to-home affordance', () => {
    renderShell({
      title: 'Sign in',
      titleZh: '登录',
      children: <span>panel</span>,
    });

    // Only Chinese label now
    expect(screen.getByText('返回首页')).toBeInTheDocument();
    // English label removed
    expect(screen.queryByText('Back to home')).not.toBeInTheDocument();
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

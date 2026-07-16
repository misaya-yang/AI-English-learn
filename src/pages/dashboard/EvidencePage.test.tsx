import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { LearningEventRecord } from '@/services/learningEvents';

const getLearningEventsMock = vi.fn();
let i18nLanguage = 'zh-CN';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: i18nLanguage } }),
}));

vi.mock('@/services/learningEvents', () => ({
  getLearningEvents: (...args: unknown[]) => getLearningEventsMock(...args),
}));

import EvidencePage from './EvidencePage';

const event = (
  eventName: string,
  payload: Record<string, unknown>,
): LearningEventRecord => ({
  id: `event-${eventName}-${Math.random().toString(36).slice(2)}`,
  userId: 'user-1',
  eventName,
  eventSource: 'web',
  payload,
  createdAt: '2026-07-08T12:00:00.000Z',
});

describe('EvidencePage', () => {
  beforeEach(() => {
    i18nLanguage = 'zh-CN';
    getLearningEventsMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders an empty state with a Today link when there is no evidence', async () => {
    getLearningEventsMock.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <EvidencePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('还没有学习证据')).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: '打开今日' })).toHaveAttribute('href', '/dashboard/today');
  });

  it('renders a disabled preview message without loading events when the feature flag is off', () => {
    vi.stubEnv('VITE_ENTERPRISE_UI_ENABLED', 'false');

    render(
      <MemoryRouter>
        <EvidencePage />
      </MemoryRouter>,
    );

    expect(screen.getByText('当前工作区暂未开放学习证据')).toBeInTheDocument();
    expect(screen.getByText(/联系组织管理员了解访问权限/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '继续个人学习' })).toHaveAttribute('href', '/dashboard/today');
    expect(screen.queryByText(/VITE_/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/staging/i)).not.toBeInTheDocument();
    expect(getLearningEventsMock).not.toHaveBeenCalled();
  });

  it('summarizes attempts, weak signals, and remediation candidates', async () => {
    getLearningEventsMock.mockResolvedValue([
      event('evidence.practice.incorrect', {
        wordId: 'word-1',
        mode: 'quiz',
        evidenceCreatedAt: '2026-07-08T12:00:00.000Z',
      }),
      event('evidence.review.rated', {
        wordId: 'word-2',
        rating: 'good',
        evidenceCreatedAt: '2026-07-08T12:05:00.000Z',
      }),
    ]);

    render(
      <MemoryRouter>
        <EvidencePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    expect(screen.getByText('薄弱信号')).toBeInTheDocument();
    expect(screen.getByText('补救队列')).toBeInTheDocument();
    expect(screen.getAllByText('word-1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('practice_incorrect')).toBeInTheDocument();
  });

  it('renders English copy without Chinese fallback text', async () => {
    i18nLanguage = 'en-US';
    getLearningEventsMock.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <EvidencePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Learning Evidence' })).toBeInTheDocument();
    });

    expect(screen.getByText('No learning evidence yet')).toBeInTheDocument();
    expect(screen.queryByText('还没有学习证据')).not.toBeInTheDocument();
  });
});

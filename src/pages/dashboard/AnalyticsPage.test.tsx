import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const useUserDataMock = vi.fn();
let i18nLanguage = 'zh-CN';

vi.mock('@/contexts/UserDataContext', () => ({
  useUserData: () => useUserDataMock(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'analytics-empty-user' } }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: i18nLanguage } }),
}));

vi.mock('@/services/learningEvents', () => ({
  getHeatmapData: vi.fn().mockResolvedValue([]),
  getLearningEvents: vi.fn().mockResolvedValue([]),
  getWeeklyActivity: vi.fn().mockResolvedValue([
    { day: 'Mon', date: '2026-06-08', words: 0, xp: 0, minutes: 0, events: 0 },
    { day: 'Tue', date: '2026-06-09', words: 0, xp: 0, minutes: 0, events: 0 },
    { day: 'Wed', date: '2026-06-10', words: 0, xp: 0, minutes: 0, events: 0 },
  ]),
}));

vi.mock('@/data/localStorage', () => ({
  getStudySessions: vi.fn(() => []),
}));

import AnalyticsPage from './AnalyticsPage';

const emptyUserData = {
  stats: { totalWords: 0, weeklyWords: 0, masteredWords: 0 },
  xp: { total: 0 },
  streak: { current: 0 },
  dailyWords: [],
  customWords: [],
  progress: [],
};

describe('AnalyticsPage empty evidence states', () => {
  beforeEach(() => {
    i18nLanguage = 'zh-CN';
    useUserDataMock.mockReturnValue(emptyUserData);
  });

  const selectTab = (name: string) => {
    const tab = screen.getByRole('tab', { name });
    fireEvent.pointerDown(tab, { button: 0, ctrlKey: false });
    fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
    fireEvent.mouseUp(tab, { button: 0, ctrlKey: false });
    fireEvent.click(tab);
    return tab;
  };

  it('does not render empty overview charts as if evidence exists', async () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('还没有活动曲线')).toBeInTheDocument();
    });
    expect(screen.getByText('还没有主题记录')).toBeInTheDocument();
    expect(screen.getByText('还没有学习时长')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /打开今日|开始今日词汇|做一次短练习/ }).length).toBeGreaterThan(0);
  });

  it('shows a retention next action instead of an empty FSRS curve', async () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>,
    );

    selectTab('记忆保留');

    await waitFor(() => {
      expect(screen.getByText('还没有可计算的记忆保留率')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: '去做复习' })).toHaveAttribute('href', '/dashboard/review');
  });

  it('does not invent a help focus when no help evidence exists', async () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>,
    );

    selectTab('答疑');

    await waitFor(() => {
      expect(screen.getByText('还没有答疑记录')).toBeInTheDocument();
    });
    expect(screen.queryByText('IELTS writing')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '打开答疑' })).toHaveAttribute('href', '/dashboard/chat');
  });

  it('renders the same no-evidence states in English without Chinese fallback copy', async () => {
    i18nLanguage = 'en-US';

    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('No activity trend yet')).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Learning progress' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Retention' })).toBeInTheDocument();
    expect(screen.queryByText('还没有活动曲线')).not.toBeInTheDocument();
  });
});

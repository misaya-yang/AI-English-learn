import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'leader-user',
      displayName: 'Demo Learner',
      email: 'demo@example.com',
    },
    profile: { cefrLevel: 'B2' },
  }),
}));

vi.mock('@/contexts/UserDataContext', () => ({
  useUserData: () => ({
    xp: { today: 120 },
    streak: { current: 9 },
    stats: { weeklyXP: 420, totalWords: 680 },
  }),
}));

import LeaderboardPage from './LeaderboardPage';

describe('LeaderboardPage', () => {
  it('labels generated members as demo data near the page title', () => {
    render(<LeaderboardPage />);

    expect(screen.getByRole('heading', { name: '排行' })).toBeInTheDocument();
    expect(screen.getByText('示例数据 · Demo')).toBeInTheDocument();
    expect(screen.getByText(/不代表真实用户或实时排名/)).toBeInTheDocument();
  });

  it('updates the current view label and ranking summary with the active tab', () => {
    render(<LeaderboardPage />);

    expect(screen.getByTestId('leaderboard-view-label')).toHaveTextContent('本周练习');

    fireEvent.click(screen.getByRole('tab', { name: '连续天数' }));

    expect(screen.getByTestId('leaderboard-view-label')).toHaveTextContent('连续天数');
    expect(screen.getByText('连续天数状态')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '连续天数' })).toHaveAttribute('aria-selected', 'true');
  });

  it('stacks the top entries before the small-screen three-column breakpoint', () => {
    render(<LeaderboardPage />);

    const topThree = screen.getByTestId('leaderboard-top-three');
    expect(topThree).toHaveClass('grid');
    expect(topThree).toHaveClass('sm:grid-cols-3');
    expect(topThree).not.toHaveClass('grid-cols-3');
  });
});

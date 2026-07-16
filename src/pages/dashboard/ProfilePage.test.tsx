import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authState = vi.hoisted(() => ({
  user: {
    id: 'profile-user',
    displayName: 'Ada Learner',
    email: 'ada@example.com',
  },
  profile: {
    cefrLevel: 'C2',
    dailyGoal: 20,
    preferredTopics: ['academic'],
    learningStyle: 'reading',
  },
  updateUserProfile: vi.fn(),
  updateDisplayName: vi.fn(),
}));

const userDataState = vi.hoisted(() => ({
  xp: { total: 3500, today: 0, level: 36 },
  streak: { current: 4, longest: 9, lastStudyDate: null },
  stats: {
    totalWords: 42,
    masteredWords: 12,
    learningWords: 20,
    reviewWords: 10,
    totalXP: 3500,
    currentStreak: 4,
    longestStreak: 9,
    weeklyWords: 8,
    weeklyXP: 180,
  },
  streakFreezes: 1,
  achievements: [],
  allAchievementDefs: [
    {
      id: 'first_word',
      icon: '1',
      nameZh: '首词',
      descriptionZh: '完成第一个单词',
    },
  ],
  dailyMultiplier: 1,
  purchaseStreakFreeze: vi.fn(() => ({ success: true, cost: 50 })),
}));

const quotaState = vi.hoisted(() => ({
  plan: 'free',
  allStatuses: [
    {
      feature: 'aiChat',
      used: 2,
      limit: 10,
      remaining: 8,
      isExhausted: false,
      plan: 'free',
    },
  ],
}));

const gamificationMocks = vi.hoisted(() => ({
  computeLevel: vi.fn(() => 36),
  getLevelName: vi.fn(() => 'Canonical Expert'),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('@/contexts/UserDataContext', () => ({
  useUserData: () => userDataState,
}));

vi.mock('@/hooks/useQuota', () => ({
  useQuota: () => quotaState,
}));

vi.mock('@/services/gamification', () => gamificationMocks);

vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import ProfilePage from './ProfilePage';

const renderPage = () =>
  render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>,
  );

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user.displayName = 'Ada Learner';
    authState.profile = {
      cefrLevel: 'C2',
      dailyGoal: 20,
      preferredTopics: ['academic'],
      learningStyle: 'reading',
    };
    authState.updateUserProfile.mockResolvedValue(true);
    authState.updateDisplayName.mockResolvedValue(true);
    userDataState.xp.total = 3500;
    gamificationMocks.computeLevel.mockReturnValue(36);
    gamificationMocks.getLevelName.mockReturnValue('Canonical Expert');
  });

  it('renders the full C2 CEFR description', () => {
    renderPage();

    expect(screen.getAllByText('C2')).toHaveLength(2);
    expect(screen.getByText('Proficiency')).toBeInTheDocument();
  });

  it('uses canonical gamification helpers for the visible level display', () => {
    renderPage();

    expect(gamificationMocks.computeLevel).toHaveBeenCalledWith(3500);
    expect(gamificationMocks.getLevelName).toHaveBeenCalledWith(3500);
    expect(screen.getByText('Level 36')).toBeInTheDocument();
    expect(screen.getByText('Canonical Expert → Level 37')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View plan access' })).toHaveAttribute('href', '/pricing');
    expect(screen.queryByText('升级专业版解锁更多额度')).not.toBeInTheDocument();
  });

  it('syncs editable fields when profile data arrives after the first render', async () => {
    const mutableAuthState = authState as unknown as {
      user: typeof authState.user;
      profile: typeof authState.profile | undefined;
    };
    mutableAuthState.user.displayName = '';
    mutableAuthState.profile = undefined;

    const view = renderPage();

    mutableAuthState.user.displayName = 'Loaded Learner';
    mutableAuthState.profile = {
      cefrLevel: 'C1',
      dailyGoal: 35,
      preferredTopics: ['business'],
      learningStyle: 'auditory',
    };
    view.rerender(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Display name')).toHaveValue('Loaded Learner');
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '35');
    });
    expect(screen.getByRole('button', { name: 'Business' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('restores the saved snapshot when editing is cancelled', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }));
    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'Unsaved name' } });
    expect(screen.getByLabelText('Display name')).toHaveValue('Unsaved name');

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }));

    expect(screen.getByLabelText('Display name')).toHaveValue('Ada Learner');
  });

  it('exposes topic selection state and a nearby edit action bar', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }));

    expect(screen.getByRole('button', { name: 'Academic' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Daily' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
});

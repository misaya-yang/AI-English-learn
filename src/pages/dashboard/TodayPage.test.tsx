import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { wordsDatabase } from '@/data/words';

const useUserDataMock = vi.fn();
const markWordAsLearnedMock = vi.fn();
const refreshDailyWordsMock = vi.fn();
const refreshDailyMissionMock = vi.fn();
const completeMissionTaskMock = vi.fn();

vi.mock('@/contexts/UserDataContext', () => ({
  useUserData: () => useUserDataMock(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'today-page-user' } }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'en' } }),
}));

vi.mock('@/features/learning/hooks/useLearningOverviewQuery', () => ({
  useLearningOverviewQuery: () => ({ data: null }),
}));

vi.mock('@/data/examContent', () => ({
  getRecommendedUnit: () => null,
}));

vi.mock('@/features/learning/learningPathRouting', () => ({
  getActiveLearningPathNextLesson: () => null,
}));

vi.mock('@/services/todayWorkbenchPersistence', () => ({
  loadTodayFlags: () => ({ hard: new Set(), bookmark: new Set() }),
  markTodayWordHard: () => ({ hard: new Set(), bookmark: new Set() }),
  toggleTodayBookmark: () => ({ hard: new Set(), bookmark: new Set() }),
}));

vi.mock('@/services/learningEvents', () => ({
  recordLearningEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/evidenceEvents', () => ({
  createEvidenceEvent: vi.fn((input) => input),
  recordEvidence: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/tts', () => ({
  speakEnglishText: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import TodayPage from './TodayPage';

const buildUserData = (dailyWords = wordsDatabase.slice(0, 2)) => ({
  dailyWords,
  activeBook: { id: 'book-1', name: 'Core English' },
  activeBookSummary: {
    dailyGoal: dailyWords.length,
    isNearlyCompleted: false,
  },
  dueWords: [],
  learningProfile: {
    target: 'general',
    dailyMinutes: 20,
  },
  markWordAsLearned: markWordAsLearnedMock,
  refreshDailyWords: refreshDailyWordsMock,
  dailyMission: { tasks: [] },
  completeMissionTask: completeMissionTaskMock,
  refreshDailyMission: refreshDailyMissionMock,
  progress: [],
  streak: { current: 4 },
  settings: {},
});

const renderPage = () => render(
  <MemoryRouter>
    <TodayPage />
  </MemoryRouter>,
);

describe('TodayPage mobile workflow safeguards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserDataMock.mockReturnValue(buildUserData());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses a compact mobile mission summary while preserving the detailed desktop plan', () => {
    renderPage();

    expect(screen.getByTestId('today-mobile-mission-summary')).toHaveClass('sm:hidden');
    const desktopPlan = screen.getByText('Meaning, dictation, or writing').closest('.study-task-list');
    expect(desktopPlan).toHaveClass('hidden', 'sm:block');
  });

  it('ignores shortcuts from interactive controls, contenteditable targets, and IME composition', () => {
    renderPage();

    const audioButton = screen.getByRole('button', { name: 'Play abandon' });
    const link = document.createElement('a');
    const select = document.createElement('select');
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    document.body.append(link, select, editable);

    for (const target of [audioButton, link, select, editable]) {
      fireEvent.keyDown(target, { code: 'Space' });
      expect(screen.getByRole('button', { name: 'Show examples' })).toBeInTheDocument();
    }

    fireEvent.keyDown(window, { code: 'Space', isComposing: true });
    expect(screen.getByRole('button', { name: 'Show examples' })).toBeInTheDocument();

    fireEvent.keyDown(window, { code: 'Space' });
    expect(screen.getByRole('button', { name: 'Hide examples' })).toBeInTheDocument();

    link.remove();
    select.remove();
    editable.remove();
  });

  it('clamps the selected word when the daily word list shrinks', async () => {
    let userData = buildUserData(wordsDatabase.slice(0, 2));
    useUserDataMock.mockImplementation(() => userData);
    const { rerender } = renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Go to word 2 of 2: ability/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'ability' })).toBeInTheDocument();
    });

    userData = buildUserData(wordsDatabase.slice(0, 1));
    rerender(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'abandon' })).toBeInTheDocument();
    });
  });

  it('clears the celebration timer when the page unmounts', () => {
    vi.useFakeTimers();
    useUserDataMock.mockReturnValue(buildUserData(wordsDatabase.slice(0, 1)));
    const { unmount } = renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels pending auto-advance when the learner navigates manually', () => {
    vi.useFakeTimers();
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'View next word: ability' }));
    expect(vi.getTimerCount()).toBe(0);
  });
});

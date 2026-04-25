// LEARN-04 — ReviewPage shows ONLY FSRS-due cards (never random fallback),
// and surfaces the "Reinforce in Practice" CTA when the FSRS due list is
// empty so the learner has a clear next step.

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const useUserDataMock = vi.fn();
const reviewWordMock = vi.fn();
const completeMissionTaskMock = vi.fn();

vi.mock('@/contexts/UserDataContext', () => ({
  useUserData: () => useUserDataMock(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'review-page-user' } }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'en' } }),
}));

vi.mock('@/services/coachReviewQueue', () => ({
  getDueCoachReviews: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/features/coach/CoachReviewRail', () => ({
  CoachReviewRail: () => null,
}));

vi.mock('@/services/tts', () => ({
  speakEnglishText: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock('@/services/evidenceEvents', () => ({
  createEvidenceEvent: vi.fn().mockReturnValue({}),
  recordEvidence: vi.fn(),
}));

vi.mock('@/services/learningEvents', () => ({
  recordEvent: vi.fn().mockResolvedValue(undefined),
}));

import ReviewPage from './ReviewPage';

const baseUserData = {
  dailyWords: [],
  reviewWord: reviewWordMock,
  dueWords: [],
  dailyMission: { tasks: [] },
  completeMissionTask: completeMissionTaskMock,
};

describe('ReviewPage — LEARN-04 due-only rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the empty-state with a Reinforce in Practice CTA when no FSRS cards are due', () => {
    useUserDataMock.mockReturnValue({ ...baseUserData });

    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/No FSRS-due cards right now/i)).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /Reinforce in Practice/i });
    expect(cta).toHaveAttribute('href', '/dashboard/practice');

    // No filler card surfaced from dailyWords/wordCatalog — empty is empty.
    expect(screen.queryByText(/Recall first/i)).not.toBeInTheDocument();
  });

  it('shows the Back to Today escape hatch alongside the Reinforce CTA', () => {
    useUserDataMock.mockReturnValue({ ...baseUserData });

    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>,
    );

    const back = screen.getByRole('link', { name: /Back to Today/i });
    expect(back).toHaveAttribute('href', '/dashboard/today');
  });
});

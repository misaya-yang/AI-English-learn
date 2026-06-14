// LEARN-04 — ReviewPage shows ONLY FSRS-due cards (never random fallback),
// and surfaces the "Reinforce in Practice" CTA when the FSRS due list is
// empty so the learner has a clear next step.

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  createEvidenceEvent: vi.fn((input) => input),
  recordEvidence: vi.fn(),
}));

vi.mock('@/services/learningEvents', () => ({
  recordEvent: vi.fn().mockResolvedValue(undefined),
  recordLearningEvent: vi.fn().mockResolvedValue(undefined),
}));

import ReviewPage from './ReviewPage';
import { createEvidenceEvent, recordEvidence } from '@/services/evidenceEvents';
import { recordEvent, recordLearningEvent } from '@/services/learningEvents';

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

  it('surfaces a stubborn-word recovery drill and records whether it helped', async () => {
    useUserDataMock.mockReturnValue({
      ...baseUserData,
      dueWords: [{
        userId: 'review-page-user',
        wordId: 'w1',
        status: 'review',
        reviewCount: 5,
        correctCount: 0,
        incorrectCount: 3,
        easeFactor: 2.5,
        lastReviewed: '2026-06-12T00:00:00.000Z',
        nextReview: '2026-06-13',
        firstSeenAt: '2026-06-01T00:00:00.000Z',
        masteredAt: null,
        fsrs: {
          stability: 2,
          difficulty: 8.4,
          retrievability: 0.42,
          lapses: 3,
          state: 'review',
          dueAt: '2026-06-13T00:00:00.000Z',
          lastReviewAt: '2026-06-12T00:00:00.000Z',
        },
      }],
      dailyMission: {
        tasks: [{ id: 'task_review_today', meta: { target: 1 } }],
      },
    });

    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /abandon/i }));

    expect(screen.getByTestId('stubborn-recovery-panel')).toHaveTextContent(/Stubborn recovery/i);
    expect(screen.getByText(/abandon the idea/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /This helped/i }));

    await waitFor(() => {
      expect(createEvidenceEvent).toHaveBeenCalledWith(expect.objectContaining({
        type: 'review.recovery_marked',
        userId: 'review-page-user',
        wordId: 'w1',
        outcome: 'helped',
        trigger: 'both',
        lapses: 3,
        difficulty: 8.4,
      }));
    });
    expect(recordEvidence).toHaveBeenCalledWith(expect.objectContaining({
      type: 'review.recovery_marked',
      outcome: 'helped',
    }));
    expect(recordLearningEvent).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'review-page-user',
      eventName: 'review.stubborn_recovery',
      payload: expect.objectContaining({
        wordId: 'w1',
        outcome: 'helped',
      }),
    }));
    expect(recordEvent).toHaveBeenCalledWith('review-page-user', expect.objectContaining({
      kind: 'mistake_resolved',
      payload: expect.objectContaining({
        wordId: 'w1',
        outcome: 'helped',
      }),
    }));
  });
});

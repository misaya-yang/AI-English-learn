import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const readingMocks = vi.hoisted(() => ({
  addStudySession: vi.fn(),
  recordLearningEvent: vi.fn().mockResolvedValue(undefined),
  incrementReviewCount: vi.fn(),
  toastInfo: vi.fn(),
  toastSuccess: vi.fn(),
  toastWarning: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'reading-test-user' } }),
}));

vi.mock('@/contexts/UserDataContext', () => ({
  useUserData: () => ({
    addStudySession: readingMocks.addStudySession,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'en-US' } }),
}));

vi.mock('@/services/learningEvents', () => ({
  recordLearningEvent: (...args: unknown[]) => readingMocks.recordLearningEvent(...args),
}));

vi.mock('@/services/gamification', () => ({
  incrementReviewCount: (...args: unknown[]) => readingMocks.incrementReviewCount(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    info: (...args: unknown[]) => readingMocks.toastInfo(...args),
    success: (...args: unknown[]) => readingMocks.toastSuccess(...args),
    warning: (...args: unknown[]) => readingMocks.toastWarning(...args),
    error: (...args: unknown[]) => readingMocks.toastError(...args),
  },
}));

import ReadingPage from './ReadingPage';

const renderReading = () => {
  render(
    <MemoryRouter>
      <ReadingPage />
    </MemoryRouter>,
  );
};

const startFirstPassage = () => {
  renderReading();
  fireEvent.click(screen.getByRole('button', { name: /Start this passage/i }));
};

const answerFirstPassage = (shortAnswer: string) => {
  fireEvent.click(screen.getAllByRole('button', { name: 'False' })[0]);
  fireEvent.click(screen.getAllByRole('button', { name: 'True' })[1]);
  fireEvent.click(screen.getAllByRole('button', { name: 'False' })[2]);
  fireEvent.click(screen.getByRole('button', { name: /B\. It becomes temporarily susceptible to change/i }));
  fireEvent.click(screen.getByRole('button', { name: /C\. To reduce the number of units/i }));
  fireEvent.change(screen.getByPlaceholderText(/Type your answer/i), { target: { value: shortAnswer } });
};

const answerThirdPassage = (shortAnswer: string) => {
  fireEvent.click(screen.getAllByRole('button', { name: 'False' })[0]);
  fireEvent.click(screen.getAllByRole('button', { name: 'False' })[1]);
  fireEvent.click(screen.getAllByRole('button', { name: 'True' })[2]);
  fireEvent.click(screen.getByRole('button', { name: /B\. It enables production throughout the year/i }));
  fireEvent.click(screen.getByRole('button', { name: /B\. An area where fresh food is difficult to access/i }));
  fireEvent.change(screen.getByPlaceholderText(/Type your answer/i), { target: { value: shortAnswer } });
};

const answerSecondPassage = (shortAnswer: string) => {
  fireEvent.click(screen.getAllByRole('button', { name: 'False' })[0]);
  fireEvent.click(screen.getAllByRole('button', { name: 'False' })[1]);
  fireEvent.click(screen.getAllByRole('button', { name: 'True' })[2]);
  fireEvent.click(screen.getByRole('button', { name: /B\. It requires flexible backup or storage/i }));
  fireEvent.click(screen.getByRole('button', { name: /B\. It creates risks of supply chain disruption/i }));
  fireEvent.change(screen.getByPlaceholderText(/Type your answer/i), { target: { value: shortAnswer } });
};

describe('ReadingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('labels generated practice as a local built-in variation', async () => {
    vi.useFakeTimers();
    renderReading();

    expect(screen.getByText(/no external AI or content provider is called/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Built-in practice variation/i }));

    expect(readingMocks.toastInfo).toHaveBeenCalledWith('Preparing a built-in practice variation.');

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText(/Practice variation/i)).toBeInTheDocument();
    expect(readingMocks.toastSuccess).toHaveBeenCalledWith('Built-in practice variation ready.');
  });

  it('records local fallback metadata when a built-in variation is completed', async () => {
    vi.useFakeTimers();
    renderReading();

    fireEvent.click(screen.getByRole('button', { name: /Built-in practice variation/i }));
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    answerFirstPassage('the hippocampus');

    fireEvent.click(screen.getByRole('button', { name: /Submit answers/i }));

    expect(screen.getByText(/Reading score 6\/6/i)).toBeInTheDocument();
    expect(readingMocks.recordLearningEvent).toHaveBeenCalledWith({
      userId: 'reading-test-user',
      eventName: 'reading.passage_completed',
      payload: expect.objectContaining({
        passageId: 'local-seed-1-1',
        sourceType: 'local_fallback',
        generatedFallback: true,
      }),
    });
  });

  it('prevents incomplete submissions with an all-answer gate', () => {
    startFirstPassage();

    expect(screen.getByRole('button', { name: /Submit answers/i })).toBeDisabled();

    fireEvent.click(screen.getAllByRole('button', { name: 'False' })[0]);

    expect(screen.getByText(/Progress 1\/6/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit answers/i })).toBeDisabled();
  });

  it('does not accept very short partial short answers', () => {
    startFirstPassage();
    answerFirstPassage('hip');

    fireEvent.click(screen.getByRole('button', { name: /Submit answers/i }));

    expect(screen.getByText(/Reading score 5\/6/i)).toBeInTheDocument();
    expect(screen.getByText(/Correct:/i)).toBeInTheDocument();
    expect(screen.getByText('hippocampus')).toBeInTheDocument();
  });

  it('accepts article variants for short answers without broad partial matching', () => {
    startFirstPassage();
    answerFirstPassage('the hippocampus');

    fireEvent.click(screen.getByRole('button', { name: /Submit answers/i }));

    expect(screen.getByText(/Reading score 6\/6/i)).toBeInTheDocument();
  });

  it('accepts required multi-part short-answer variants', () => {
    renderReading();
    fireEvent.click(screen.getByRole('button', { name: /The Rise of Urban Farming/i }));
    answerThirdPassage('land costs and energy requirements');

    fireEvent.click(screen.getByRole('button', { name: /Submit answers/i }));

    expect(screen.getByText(/Reading score 6\/6/i)).toBeInTheDocument();
  });

  it('accepts singular and plural short-answer variants', () => {
    renderReading();
    fireEvent.click(screen.getByRole('button', { name: /Renewable Energy Transitions/i }));
    answerSecondPassage('HVDC line');

    fireEvent.click(screen.getByRole('button', { name: /Submit answers/i }));

    expect(screen.getByText(/Reading score 6\/6/i)).toBeInTheDocument();
  });

  it('records non-zero reading evidence without inflating vocabulary reviews', () => {
    startFirstPassage();
    answerFirstPassage('hippocampus');

    fireEvent.click(screen.getByRole('button', { name: /Submit answers/i }));

    expect(screen.getByText(/Reading score 6\/6/i)).toBeInTheDocument();
    expect(readingMocks.addStudySession).toHaveBeenCalledWith(0, 0, 25, 1);
    expect(readingMocks.recordLearningEvent).toHaveBeenCalledWith({
      userId: 'reading-test-user',
      eventName: 'reading.passage_completed',
      payload: expect.objectContaining({
        passageId: 'seed-1',
        correct: 6,
        total: 6,
        accuracy: 1,
        xp: 25,
        durationMinutes: 1,
        answerCount: 6,
        questionTypes: ['tfng', 'mcq', 'short_answer'],
        sourceType: 'seed',
        generatedFallback: false,
      }),
    });
    expect(readingMocks.incrementReviewCount).not.toHaveBeenCalled();
  });

  it('shows an evidence fallback note for review items without explicit locations', () => {
    startFirstPassage();
    answerFirstPassage('hippocampus');

    fireEvent.click(screen.getByRole('button', { name: /Submit answers/i }));

    expect(screen.getAllByText(/Evidence in passage/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Evidence note/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/passage-level inference/i).length).toBeGreaterThan(0);
  });

  it('uses English passage chrome in reading mode', () => {
    startFirstPassage();

    expect(screen.getByText('Passage')).toBeInTheDocument();
    expect(screen.queryByText('文章')).not.toBeInTheDocument();
  });
});

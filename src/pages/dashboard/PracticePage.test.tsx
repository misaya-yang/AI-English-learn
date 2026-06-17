import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { WordData } from '@/data/words';

const reviewWordMock = vi.fn();
const addStudySessionMock = vi.fn();
const completeMissionTaskMock = vi.fn();
const recordEventMock = vi.fn();
const recordLearningEventMock = vi.fn();
const recordEvidenceMock = vi.fn();
const addMistakeMock = vi.fn();

const word: WordData = {
  id: 'w-age',
  word: 'age',
  phonetic: '/eɪdʒ/',
  partOfSpeech: 'n.',
  definition: 'the number of years somebody has lived',
  definitionZh: '年龄',
  examples: [{ en: 'People of every age can learn.', zh: '每个年龄的人都能学习。' }],
  synonyms: [],
  antonyms: [],
  collocations: ['at the age of'],
  level: 'A1',
  topic: 'people',
};

const listeningWord: WordData = {
  ...word,
  id: 'w-abandon',
  word: 'abandon',
  definition: 'to leave something behind',
};

const quizQuestion = {
  id: 'q-age',
  word,
  question: 'What does "age" mean?',
  questionZh: '"age" 是什么意思？',
  options: [
    'wrong answer one',
    'wrong answer two',
    'the number of years somebody has lived',
  ],
  correctAnswer: 'the number of years somebody has lived',
  type: 'multiple_choice' as const,
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'practice-test-user' } }),
}));

vi.mock('@/contexts/UserDataContext', () => ({
  useUserData: () => ({
    dailyWords: [word, listeningWord],
    dueWords: [],
    progress: [],
    streak: { current: 0 },
    learningProfile: { learningStyle: 'visual', target: 'IELTS', dailyMinutes: 15 },
    addStudySession: addStudySessionMock,
    completeMissionTask: completeMissionTaskMock,
    reviewWord: reviewWordMock,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'en-US' } }),
}));

vi.mock('@/features/practice/runtime', () => ({
  buildPracticeQuestions: vi.fn(() => [quizQuestion]),
  buildListeningQueue: vi.fn(() => [listeningWord]),
}));

vi.mock('@/services/coachReviewQueue', () => ({
  getDueCoachReviews: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/services/tts', () => ({
  speakEnglishText: vi.fn(),
}));

vi.mock('@/services/learningEvents', () => ({
  recordLearningEvent: (...args: unknown[]) => recordLearningEventMock(...args),
  recordEvent: (...args: unknown[]) => recordEventMock(...args),
}));

vi.mock('@/services/evidenceEvents', () => ({
  createEvidenceEvent: vi.fn((input) => ({ ...input, createdAt: '2026-06-14T00:00:00.000Z' })),
  recordEvidence: (...args: unknown[]) => recordEvidenceMock(...args),
}));

vi.mock('@/services/mistakeCollector', () => ({
  addMistake: (...args: unknown[]) => addMistakeMock(...args),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import PracticePage from './PracticePage';
import { buildPracticeQuestions } from '@/features/practice/runtime';

const renderPractice = (initialEntry = '/dashboard/practice') => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PracticePage />
    </MemoryRouter>,
  );
};

const clickFirst = (name: RegExp) => {
  fireEvent.click(screen.getAllByRole('button', { name })[0]);
};

const startQuiz = () => {
  renderPractice();
  clickFirst(/Start with this/i);
  clickFirst(/Start practice/i);
};

const startListening = () => {
  renderPractice();
  fireEvent.click(screen.getByRole('button', { name: /Listening Quiz/i }));
  clickFirst(/Start practice/i);
};

describe('PracticePage retry and reveal behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not reveal the correct answer after the first wrong multiple-choice attempt', () => {
    startQuiz();

    fireEvent.click(screen.getByLabelText('wrong answer one'));
    fireEvent.click(screen.getByRole('button', { name: /Check answer/i }));

    expect(screen.getByText(/Not yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/Correct answer/i)).not.toBeInTheDocument();
    expect(recordEvidenceMock).not.toHaveBeenCalled();
    expect(addMistakeMock).not.toHaveBeenCalled();
  });

  it('records a retry success as recovered', () => {
    startQuiz();

    fireEvent.click(screen.getByLabelText('wrong answer one'));
    fireEvent.click(screen.getByRole('button', { name: /Check answer/i }));
    fireEvent.click(screen.getByLabelText('the number of years somebody has lived'));
    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));

    expect(screen.getByText(/Recovered after retry/i)).toBeInTheDocument();
    expect(reviewWordMock).toHaveBeenCalledWith('w-age', 'hard');
    expect(recordEventMock).toHaveBeenCalledWith(
      'practice-test-user',
      expect.objectContaining({ kind: 'practice_recovered' }),
    );
    expect(addMistakeMock).not.toHaveBeenCalled();
  });

  it('reveals the correct answer only after a second wrong multiple-choice attempt', () => {
    startQuiz();

    fireEvent.click(screen.getByLabelText('wrong answer one'));
    fireEvent.click(screen.getByRole('button', { name: /Check answer/i }));
    fireEvent.click(screen.getByLabelText('wrong answer two'));
    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));

    expect(screen.getByText(/Correct answer/i)).toBeInTheDocument();
    expect(screen.getAllByText('the number of years somebody has lived').length).toBeGreaterThan(0);
    expect(reviewWordMock).toHaveBeenCalledWith('w-age', 'again');
    expect(addMistakeMock).toHaveBeenCalledTimes(1);
  });

  it('does not show the expected listening word after the first wrong attempt', () => {
    startListening();

    fireEvent.change(screen.getByPlaceholderText(/Type what you hear/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /Check answer/i }));

    expect(screen.getAllByText(/Listen once more/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Expected:/i)).not.toBeInTheDocument();
    expect(screen.queryByText('abandon')).not.toBeInTheDocument();
    expect(addMistakeMock).not.toHaveBeenCalled();
  });

  it('reveals the expected listening word after the second wrong attempt', () => {
    startListening();

    fireEvent.change(screen.getByPlaceholderText(/Type what you hear/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /Check answer/i }));
    fireEvent.change(screen.getByPlaceholderText(/Type what you hear/i), { target: { value: 'still wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));

    expect(screen.getByText(/Correct answer/i)).toBeInTheDocument();
    expect(screen.getByText(/Expected: abandon/i)).toBeInTheDocument();
    expect(reviewWordMock).toHaveBeenCalledWith('w-abandon', 'again');
    expect(addMistakeMock).toHaveBeenCalledTimes(1);
  });

  it('uses a URL wordId as the first practice focus when launched from an IELTS Anki card', () => {
    renderPractice('/dashboard/practice?source=ielts-anki&wordId=ielts_anki_alleviate&q=alleviate');
    clickFirst(/Start with this/i);

    expect(buildPracticeQuestions).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'ielts_anki_alleviate', word: 'alleviate' }),
      ]),
      'quiz',
      'practice-test-user:quiz',
      expect.objectContaining({ focusWordId: 'ielts_anki_alleviate' }),
    );
  });
});

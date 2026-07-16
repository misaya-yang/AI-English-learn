import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const pronunciationMocks = vi.hoisted(() => ({
  reducedMotion: false,
  session: {
    status: 'idle',
    startListening: vi.fn(),
    cancelListening: vi.fn(),
    result: null as {
      transcript: string;
      overallScore: number;
      dimensions: { accuracy: number; fluency: number; intonation: number };
      phonemeIssues: never[];
      durationMs: number;
      hasAiFeedback: boolean;
    } | null,
    records: [] as Array<{
      id: string;
      wordId: string;
      word: string;
      phonetic: string;
      result: {
        transcript: string;
        overallScore: number;
        dimensions: { accuracy: number; fluency: number; intonation: number };
        phonemeIssues: never[];
        durationMs: number;
        hasAiFeedback: boolean;
      };
      createdAt: string;
    }>,
    errorMessage: null as string | null,
    reset: vi.fn(),
  },
}));

const translations: Record<string, string> = {
  'pronunciation.title': 'Pronunciation Practice',
  'pronunciation.subtitle': 'Record your voice and get focused feedback.',
  'pronunciation.wordMode': 'Word mode',
  'pronunciation.sentenceMode': 'Sentence mode',
  'pronunciation.startRecording': 'Start recording',
  'pronunciation.stopRecording': 'Stop recording',
  'pronunciation.listening': 'Listening',
  'pronunciation.scoring': 'Scoring',
  'pronunciation.tryAgain': 'Try again',
  'pronunciation.accuracy': 'Accuracy',
  'pronunciation.fluency': 'Fluency',
  'pronunciation.intonation': 'Intonation',
  'pronunciation.youSaid': 'You said',
  'pronunciation.phonemeIssues': 'Sound issues',
  'pronunciation.history': 'History',
  'common.previous': 'Previous',
  'common.next': 'Next',
  'word.listen': 'Listen',
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en-US' },
    t: (key: string) => translations[key] ?? key,
  }),
}));

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    useReducedMotion: () => pronunciationMocks.reducedMotion,
  };
});

vi.mock('@/contexts/UserDataContext', () => ({
  useUserData: () => ({
    dailyWords: [
      {
        id: 'word-1',
        word: 'pronunciation',
        phonetic: '/prəˌnʌnsiˈeɪʃən/',
        definition: 'the way a word is spoken',
        definitionZh: '发音',
        examples: [{ en: 'Pronunciation takes deliberate practice.' }],
      },
      {
        id: 'word-2',
        word: 'fluency',
        phonetic: '/ˈfluːənsi/',
        definition: 'the ability to speak smoothly',
        definitionZh: '流利度',
        examples: [{ en: 'Fluency grows with regular practice.' }],
      },
    ],
  }),
}));

vi.mock('@/hooks/usePronunciationSession', () => ({
  usePronunciationSession: () => pronunciationMocks.session,
}));

vi.mock('@/services/pronunciationScorer', () => ({
  isSpeechRecognitionSupported: () => true,
}));

vi.mock('@/services/tts', () => ({
  speakEnglishText: vi.fn(),
}));

import PronunciationPage from './PronunciationPage';

const result = {
  transcript: 'pronunciation',
  overallScore: 82,
  dimensions: { accuracy: 80, fluency: 75, intonation: 70 },
  phonemeIssues: [] as never[],
  durationMs: 1200,
  hasAiFeedback: true,
};

const renderPronunciation = () => {
  render(
    <MemoryRouter>
      <PronunciationPage />
    </MemoryRouter>,
  );
};

describe('PronunciationPage progress and results', () => {
  beforeEach(() => {
    pronunciationMocks.reducedMotion = false;
    pronunciationMocks.session.status = 'idle';
    pronunciationMocks.session.result = null;
    pronunciationMocks.session.records = [];
    pronunciationMocks.session.errorMessage = null;
    vi.clearAllMocks();
  });

  it('counts unique completed practice items instead of raw attempts', () => {
    pronunciationMocks.session.records = [
      {
        id: 'record-1',
        wordId: 'word-1',
        word: 'pronunciation',
        phonetic: '/prəˌnʌnsiˈeɪʃən/',
        result,
        createdAt: '2026-07-16T00:00:00.000Z',
      },
      {
        id: 'record-2',
        wordId: 'word-1',
        word: 'pronunciation',
        phonetic: '/prəˌnʌnsiˈeɪʃən/',
        result,
        createdAt: '2026-07-16T00:01:00.000Z',
      },
    ];

    renderPronunciation();

    expect(screen.getByLabelText('1 of 2 practice items completed')).toHaveTextContent('1/2');
    expect(screen.getByText('Records').previousElementSibling).toHaveTextContent('2');
  });

  it('shows one completion summary and accessible text for every score radial', () => {
    pronunciationMocks.session.status = 'done';
    pronunciationMocks.session.result = result;

    renderPronunciation();

    expect(screen.getAllByText('Pronunciation score 82/100')).toHaveLength(1);
    expect(screen.getByRole('img', { name: 'Accuracy: 80 out of 100' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Fluency: 75 out of 100' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Intonation: 70 out of 100' })).toBeInTheDocument();
  });

  it('disables the recording pulse when reduced motion is requested', () => {
    pronunciationMocks.reducedMotion = true;
    pronunciationMocks.session.status = 'listening';

    renderPronunciation();

    expect(screen.getByRole('button', { name: 'Stop recording' })).not.toHaveClass('animate-pulse');
    expect(screen.getByText('Listening')).toHaveClass('motion-reduce:animate-none');
  });
});

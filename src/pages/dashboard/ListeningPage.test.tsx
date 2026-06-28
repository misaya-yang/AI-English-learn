import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const listeningMocks = vi.hoisted(() => ({
  addStudySession: vi.fn(),
  recordLearningEvent: vi.fn().mockResolvedValue(undefined),
  incrementReviewCount: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'listening-test-user' } }),
}));

vi.mock('@/contexts/UserDataContext', () => ({
  useUserData: () => ({
    addStudySession: listeningMocks.addStudySession,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'en-US' } }),
}));

vi.mock('@/services/learningEvents', () => ({
  recordLearningEvent: (...args: unknown[]) => listeningMocks.recordLearningEvent(...args),
}));

vi.mock('@/services/gamification', () => ({
  incrementReviewCount: (...args: unknown[]) => listeningMocks.incrementReviewCount(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => listeningMocks.toastSuccess(...args),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import ListeningPage from './ListeningPage';

class MockSpeechSynthesisUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

const mockVoice = {
  name: 'Mock English',
  lang: 'en-GB',
  default: true,
  localService: true,
  voiceURI: 'mock-english',
} as SpeechSynthesisVoice;

const installSpeechSynthesis = (voices: SpeechSynthesisVoice[] = [mockVoice]) => {
  const speechSynthesisMock = {
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    speak: vi.fn(),
    getVoices: vi.fn(() => voices),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    value: MockSpeechSynthesisUtterance,
    configurable: true,
  });
  Object.defineProperty(window, 'speechSynthesis', {
    value: speechSynthesisMock,
    configurable: true,
  });

  return speechSynthesisMock;
};

const removeSpeechSynthesis = () => {
  Reflect.deleteProperty(window, 'speechSynthesis');
};

const renderListening = () => {
  render(
    <MemoryRouter>
      <ListeningPage />
    </MemoryRouter>,
  );
};

const startFirstClip = () => {
  renderListening();
  fireEvent.click(screen.getByRole('button', { name: /Start this clip/i }));
};

const skipToQuestions = () => {
  fireEvent.click(screen.getByRole('button', { name: /Skip to questions/i }));
};

const answerFirstClipPerfectly = () => {
  fireEvent.click(screen.getByRole('button', { name: /B\. The prefrontal cortex/i }));
  fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '15 percent' } });
  fireEvent.click(screen.getByRole('button', { name: /C\. Higher property tax revenues/i }));
  fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'Green gentrification.' } });
  fireEvent.click(screen.getByRole('button', { name: /C\. Up to 20 percent/i }));
};

describe('ListeningPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installSpeechSynthesis();
  });

  it('labels audio controls and transcript fallback before questions', () => {
    startFirstClip();

    expect(screen.getByRole('button', { name: /Reset audio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Skip to questions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Use transcript fallback/i })).toBeInTheDocument();
    expect(screen.getByText(/Listen first when audio works/i)).toBeInTheDocument();
  });

  it('keeps the route usable when browser TTS is unavailable', () => {
    removeSpeechSynthesis();

    startFirstClip();

    expect(screen.getByText(/TTS is unavailable in this browser/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open transcript fallback/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Reset audio/i })).not.toBeInTheDocument();
  });

  it('starts playback after a voice-loading timeout when voices never load', () => {
    vi.useFakeTimers();
    const speechSynthesisMock = installSpeechSynthesis([]);

    startFirstClip();
    fireEvent.click(screen.getByRole('button', { name: /Play/i }));

    expect(speechSynthesisMock.speak).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(speechSynthesisMock.removeEventListener).toHaveBeenCalledWith('voiceschanged', expect.any(Function));
    expect(speechSynthesisMock.speak).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('records transcript reveal as a deliberate pre-submit fallback event', () => {
    startFirstClip();

    fireEvent.click(screen.getByRole('button', { name: /Use transcript fallback/i }));

    expect(screen.getByText(/Welcome to today's lecture on urban planning/i)).toBeInTheDocument();
    expect(listeningMocks.recordLearningEvent).toHaveBeenCalledWith({
      userId: 'listening-test-user',
      eventName: 'listening.transcript_revealed',
      payload: expect.objectContaining({
        passageId: 'listening-001',
        source: 'listening',
        beforeSubmit: true,
        ttsSupported: true,
      }),
    });
  });

  it('prevents incomplete submissions with an all-answer gate', () => {
    startFirstClip();
    skipToQuestions();

    expect(screen.getByRole('button', { name: /Submit Answers/i })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /B\. The prefrontal cortex/i }));

    expect(screen.getByRole('button', { name: /Submit Answers/i })).toBeDisabled();
  });

  it('accepts normalized answer variants and records honest listening evidence', () => {
    startFirstClip();
    skipToQuestions();
    answerFirstClipPerfectly();

    fireEvent.click(screen.getByRole('button', { name: /Submit Answers/i }));

    expect(screen.getByText(/Listening score 5\/5/i)).toBeInTheDocument();
    expect(listeningMocks.addStudySession).toHaveBeenCalledWith(0, 0, 30, 2);
    expect(listeningMocks.recordLearningEvent).toHaveBeenCalledWith({
      userId: 'listening-test-user',
      eventName: 'listening.passage_completed',
      payload: expect.objectContaining({
        passageId: 'listening-001',
        correct: 5,
        total: 5,
        accuracy: 1,
        xp: 30,
        durationMinutes: 2,
        answerCount: 5,
        transcriptRevealedBeforeSubmit: false,
        ttsSupported: true,
      }),
    });
    expect(listeningMocks.incrementReviewCount).not.toHaveBeenCalled();
  });
});

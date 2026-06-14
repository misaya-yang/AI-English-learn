import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authState = vi.hoisted(() => ({
  isAuthenticated: false,
}));

const userDataState = vi.hoisted(() => ({
  addCustomWord: vi.fn(),
  markWordAsLearned: vi.fn(),
  customWords: [] as Array<{ id: string; word: string }>,
  progress: [] as Array<{ wordId: string }>,
}));

const i18nState = vi.hoisted(() => ({
  language: 'en',
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: i18nState.language },
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('@/contexts/UserDataContext', () => ({
  useUserData: () => userDataState,
}));

vi.mock('@/services/tts', () => ({
  speakEnglishText: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import WordOfTheDayPage from './WordOfTheDayPage';
import { getWordOfTheDay } from '@/data/words';
import { toast } from 'sonner';

const renderPage = () =>
  render(
    <MemoryRouter>
      <WordOfTheDayPage />
    </MemoryRouter>,
  );

describe('WordOfTheDayPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = false;
    userDataState.customWords = [];
    userDataState.progress = [];
    i18nState.language = 'en';
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  });

  it('keeps anonymous users on the signup path', () => {
    renderPage();

    expect(screen.getByRole('link', { name: 'Start Learning' })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: 'Save to My Word Bank' })).toHaveAttribute('href', '/register?redirect=%2Fword-of-the-day');
    expect(screen.getByRole('link', { name: 'Start Free Journey' }).getAttribute('href')).toContain('/register?redirect=%2Fdashboard%2Fpractice');
    expect(screen.getByRole('link', { name: 'Ask Coach About This Word' }).getAttribute('href')).toContain('/register?redirect=%2Fdashboard%2Fchat');
    expect(screen.getByText('Public Word Archive')).toBeInTheDocument();
    expect(screen.getByText('These are public sample words, not your personal learning history.')).toBeInTheDocument();
  });

  it('lets authenticated users save the daily word without routing to registration', () => {
    authState.isAuthenticated = true;

    renderPage();

    expect(screen.getByRole('link', { name: 'Go to Today' })).toHaveAttribute('href', '/dashboard/today');
    fireEvent.click(screen.getByRole('button', { name: 'Save to My Word Bank' }));

    expect(userDataState.addCustomWord).toHaveBeenCalledTimes(1);
    expect(userDataState.markWordAsLearned).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: 'Practice This Word' }).getAttribute('href')).toContain('/dashboard/practice?word=');
    expect(screen.getByRole('link', { name: 'Ask Coach About This Word' }).getAttribute('href')).toContain('/dashboard/chat?focus=');
  });

  it('does not duplicate the learning signal when the word already has progress', () => {
    authState.isAuthenticated = true;
    userDataState.customWords = [{ id: 'existing', word: 'placeholder' }];
    userDataState.progress = [{ wordId: getWordOfTheDay().id }];

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Save to My Word Bank' }));

    expect(userDataState.addCustomWord).toHaveBeenCalledTimes(1);
    expect(userDataState.markWordAsLearned).not.toHaveBeenCalled();
  });

  it('uses Chinese labels without presenting archive words as personal history', () => {
    i18nState.language = 'zh-CN';

    renderPage();

    expect(screen.getByText('每日单词')).toBeInTheDocument();
    expect(screen.getByText('公开词库样例')).toBeInTheDocument();
    expect(screen.getByText('这些是公开样例词，不是你的个人学习历史。')).toBeInTheDocument();
    expect(screen.queryByText('Previous Words / 往期单词')).not.toBeInTheDocument();
  });

  it('shares a public SVG word card when the device supports file sharing', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const canShare = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: canShare });

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Share word card' }));

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(canShare).toHaveBeenCalledWith({ files: [expect.any(File)] });

    const payload = share.mock.calls[0][0];
    expect(payload).toEqual(expect.objectContaining({
      title: expect.stringContaining('Word of the Day:'),
      text: expect.stringContaining('Word of the Day:'),
      url: 'http://localhost:3000/word-of-the-day',
    }));
    expect(payload.files[0]).toBeInstanceOf(File);
    expect(payload.files[0].name).toMatch(/^vocabdaily-.+\.svg$/);
    expect(payload.text).not.toContain('streak');
    expect(payload.text).not.toContain('XP');
  });

  it('copies public share text and downloads the card when native share is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const createObjectURL = vi.fn().mockReturnValue('blob:vocabdaily-word-card');
    const revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Share word card' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toContain('Word of the Day:');
    expect(writeText.mock.calls[0][0]).not.toContain('reviewCount');
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:vocabdaily-word-card');
    expect(toast.success).toHaveBeenCalledWith('Share text copied and word card downloaded');
  });
});

import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UserProgress } from '@/data/localStorage';
import type { WordBook } from '@/data/wordBooks';
import type { WordData } from '@/data/words';

const mitigateWord: WordData = {
  id: 'custom-mitigate',
  word: 'mitigate',
  phonetic: '/ˈmɪtɪɡeɪt/',
  partOfSpeech: 'v.',
  definition: 'to make something less severe or harmful',
  definitionZh: '减轻，缓和',
  examples: [
    {
      en: 'The policy may mitigate climate risk.',
      zh: '这项政策可能会减轻气候风险。',
    },
  ],
  synonyms: ['reduce', 'ease'],
  antonyms: ['worsen'],
  collocations: ['mitigate risk', 'mitigate impact'],
  level: 'B2',
  topic: 'academic',
  memoryTip: 'Use it when the problem is still there, but less serious.',
};

const preciseWord: WordData = {
  id: 'custom-precise',
  word: 'precise',
  phonetic: '/prɪˈsaɪs/',
  partOfSpeech: 'adj.',
  definition: 'exact and accurate',
  definitionZh: '精确的',
  examples: [{ en: 'Give a precise answer.', zh: '给出精确回答。' }],
  synonyms: ['exact'],
  antonyms: ['vague'],
  collocations: ['precise answer'],
  level: 'B1',
  topic: 'academic',
};

const activeBook: WordBook = {
  id: 'book-ielts-core',
  name: 'IELTS核心自建',
  source: 'Cambridge notes',
  license: 'User provided',
  levelRange: ['B2', 'C1'],
  topicTags: ['academic', 'ielts'],
  wordIds: [mitigateWord.id, preciseWord.id],
  createdAt: '2026-06-14T00:00:00.000Z',
  isBuiltIn: false,
  version: '2026.06',
};

const builtInBook: WordBook = {
  id: 'builtin-a1',
  name: 'A1基础',
  source: 'VocabDaily Open Word Set',
  license: 'Project dataset',
  levelRange: ['A1'],
  topicTags: ['daily'],
  wordIds: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  isBuiltIn: true,
  version: '1.0.0',
};

const progress: UserProgress[] = [
  {
    userId: 'vocabulary-page-user',
    wordId: mitigateWord.id,
    status: 'review',
    reviewCount: 5,
    lastReviewed: '2026-06-13T00:00:00.000Z',
    nextReview: '2026-06-14T00:00:00.000Z',
    easeFactor: 2.1,
    correctCount: 1,
    incorrectCount: 3,
  },
  {
    userId: 'vocabulary-page-user',
    wordId: preciseWord.id,
    status: 'mastered',
    reviewCount: 4,
    lastReviewed: '2026-06-13T00:00:00.000Z',
    nextReview: '2026-06-20T00:00:00.000Z',
    easeFactor: 2.7,
    correctCount: 4,
    incorrectCount: 0,
  },
];

const userDataState = vi.hoisted(() => ({
  wordBooks: [] as WordBook[],
  activeBook: null as WordBook | null,
  setActiveBook: vi.fn(),
  importWordBook: vi.fn(),
  inspectAnkiApkg: vi.fn(),
  importAnkiApkg: vi.fn(),
  deleteWordBook: vi.fn(),
  customWords: [] as WordData[],
  addCustomWord: vi.fn(),
  removeCustomWord: vi.fn(),
  progress: [] as UserProgress[],
  markWordAsLearned: vi.fn(),
  markWordAsMastered: vi.fn(),
}));

vi.mock('@/contexts/UserDataContext', () => ({
  useUserData: () => userDataState,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'zh-CN' } }),
}));

vi.mock('@/services/tts', () => ({
  speakEnglishText: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

import VocabularyBankPage from './VocabularyBankPage';

const renderPage = () => {
  render(
    <MemoryRouter>
      <VocabularyBankPage />
    </MemoryRouter>,
  );
};

describe('VocabularyBankPage — lexicon and word book ecosystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userDataState.wordBooks = [activeBook, builtInBook];
    userDataState.activeBook = activeBook;
    userDataState.customWords = [mitigateWord, preciseWord];
    userDataState.progress = progress;
    userDataState.deleteWordBook.mockReturnValue(true);
  });

  it('shows the active wordbook, lexical details, and practice/review entry points', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: '词典' })).toBeInTheDocument();
    expect(screen.getAllByText('mitigate').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText((_content, element) => (
      element?.textContent?.includes('/ˈmɪtɪɡeɪt/') ?? false
    )).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('to make something less severe or harmful')).toBeInTheDocument();
    expect(screen.getByText('减轻，缓和')).toBeInTheDocument();
    expect(screen.getByText('The policy may mitigate climate risk.')).toBeInTheDocument();
    expect(screen.getAllByText('IELTS核心自建').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('需要复习').length).toBeGreaterThanOrEqual(1);

    const practiceLink = screen.getByRole('link', { name: /用这个词练一次/ });
    expect(practiceLink.getAttribute('href')).toContain('/dashboard/practice?source=lexicon');
    expect(practiceLink.getAttribute('href')).toContain('wordId=custom-mitigate');

    const reviewLink = screen.getByRole('link', { name: /加入复习回合/ });
    expect(reviewLink.getAttribute('href')).toContain('/dashboard/review?source=lexicon');

    expect(screen.getAllByLabelText(/播放 mitigate 发音/).length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getAllByText('mitigate')[1]);
    expect(screen.getByText('学习状态')).toBeInTheDocument();
    expect(screen.getByText('来源词书')).toBeInTheDocument();
    expect(screen.getAllByText('复习中').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /删除自定义词 mitigate/ })).toBeInTheDocument();
  });

  it('surfaces source, license, level range, topic tags, and safe delete affordances for books', () => {
    renderPage();

    const activeBookRow = screen.getByText(/来源: Cambridge notes/).closest('div.rounded-md');
    expect(activeBookRow).not.toBeNull();
    expect(within(activeBookRow as HTMLElement).getByText('当前词书')).toBeInTheDocument();
    expect(within(activeBookRow as HTMLElement).getByText('B2')).toBeInTheDocument();
    expect(within(activeBookRow as HTMLElement).getByText('C1')).toBeInTheDocument();
    expect(within(activeBookRow as HTMLElement).getByText('academic')).toBeInTheDocument();
    expect(within(activeBookRow as HTMLElement).getByText('ielts')).toBeInTheDocument();
    expect(within(activeBookRow as HTMLElement).getByText(/版本 2026.06/)).toBeInTheDocument();
    expect(within(activeBookRow as HTMLElement).getByText(/来源: Cambridge notes/)).toBeInTheDocument();
    expect(within(activeBookRow as HTMLElement).getByText(/许可: User provided/)).toBeInTheDocument();

    expect(screen.getAllByRole('button', { name: /删除/ })).toHaveLength(1);
  });

  it('keeps import and add actions visible in the empty state', () => {
    userDataState.wordBooks = [builtInBook];
    userDataState.activeBook = null;
    userDataState.customWords = [];
    userDataState.progress = [];

    renderPage();

    expect(screen.getByText('先添加第一个词')).toBeInTheDocument();
    expect(screen.getByText('导入词书或添加自定义词后，这里会显示释义、例句和练习入口。')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /添加单词/ }).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole('button', { name: /导入词书/ }).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole('button', { name: /导入 Anki/ }).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('button', { name: /使用 A1基础/ })).toBeInTheDocument();
  });
});

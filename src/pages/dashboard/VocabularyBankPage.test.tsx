import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UserProgress } from '@/data/localStorage';
import { getIeltsAnkiDeck } from '@/data/ieltsAnkiCards';
import { BUILT_IN_WORD_BOOK_IDS, type WordBook } from '@/data/wordBooks';
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

const ieltsAnkiBook: WordBook = {
  id: BUILT_IN_WORD_BOOK_IDS.IELTS_ANKI_FOUNDATION,
  name: getIeltsAnkiDeck().name,
  source: getIeltsAnkiDeck().source,
  license: getIeltsAnkiDeck().license,
  levelRange: ['B2', 'C1'],
  topicTags: ['ielts', 'anki', 'writing', 'speaking'],
  wordIds: getIeltsAnkiDeck().cards.map((card) => card.id),
  createdAt: '2026-01-01T00:00:00.000Z',
  isBuiltIn: true,
  version: getIeltsAnkiDeck().version,
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

const i18nState = vi.hoisted(() => ({
  language: 'zh-CN',
}));

const ttsMocks = vi.hoisted(() => ({
  speakEnglishText: vi.fn(),
}));

vi.mock('@/contexts/UserDataContext', () => ({
  useUserData: () => userDataState,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: i18nState.language } }),
}));

vi.mock('@/services/tts', () => ({
  speakEnglishText: ttsMocks.speakEnglishText,
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

const openMenu = (name: string | RegExp) => {
  fireEvent.pointerDown(screen.getByRole('button', { name }), {
    button: 0,
    ctrlKey: false,
  });
};

describe('VocabularyBankPage — lexicon and word book ecosystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18nState.language = 'zh-CN';
    userDataState.wordBooks = [activeBook, builtInBook, ieltsAnkiBook];
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

    openMenu('词条动作');
    const practiceLink = screen.getByRole('menuitem', { name: /用这个词练一次/ });
    expect(practiceLink.getAttribute('href')).toContain('/dashboard/practice?source=lexicon');
    expect(practiceLink.getAttribute('href')).toContain('wordId=custom-mitigate');

    const reviewLink = screen.getByRole('menuitem', { name: /加入复习回合/ });
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

    const activeBookRow = screen.getByTestId('word-book-row-book-ielts-core');
    expect(activeBookRow).not.toBeNull();
    expect(within(activeBookRow as HTMLElement).getByText('当前词书')).toBeInTheDocument();
    expect(within(activeBookRow as HTMLElement).getByText('B2')).toBeInTheDocument();
    expect(within(activeBookRow as HTMLElement).getByText('C1')).toBeInTheDocument();
    expect(within(activeBookRow as HTMLElement).getByText('academic')).toBeInTheDocument();
    expect(within(activeBookRow as HTMLElement).getByText('ielts')).toBeInTheDocument();
    expect(within(activeBookRow as HTMLElement).getByText(/版本 2026.06/)).toBeInTheDocument();
    expect(within(activeBookRow as HTMLElement).getByText(/来源: Cambridge notes/)).toBeInTheDocument();
    expect(within(activeBookRow as HTMLElement).getByText(/许可: User provided/)).toBeInTheDocument();

    openMenu(/IELTS核心自建 词书动作/);
    expect(screen.getByRole('menuitem', { name: /删除/ })).toBeInTheDocument();
  });

  it('keeps import and add actions visible in the empty state', () => {
    userDataState.wordBooks = [builtInBook];
    userDataState.activeBook = null;
    userDataState.customWords = [];
    userDataState.progress = [];

    renderPage();

    expect(screen.getByText('添加第一个词')).toBeInTheDocument();
    expect(screen.getByText('导入词书或添加自定义词后，这里会显示释义、例句和练习入口。')).toBeInTheDocument();
    openMenu(/开始添加词条/);
    expect(screen.getByRole('menuitem', { name: /添加单词/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /导入词书/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /导入 Anki/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /使用 A1基础/ })).toBeInTheDocument();
  });

  it('surfaces the IELTS Anki card foundation with study and practice entry points', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'IELTS Anki 卡片' })).toBeInTheDocument();
    expect(screen.getByText('12 张卡片')).toBeInTheDocument();
    expect(screen.getAllByText('alleviate').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('写解决方案时用，比 make better 更正式。')).toBeInTheDocument();

    openMenu('IELTS 卡片动作');
    expect(screen.getByRole('menuitem', { name: '今天学这套' }).getAttribute('href')).toBe('/dashboard/today');
    const firstCardLink = screen.getByRole('menuitem', { name: '练第一张' });
    expect(firstCardLink.getAttribute('href')).toContain('/dashboard/practice?source=ielts-anki');
    expect(firstCardLink.getAttribute('href')).toContain('wordId=ielts_anki_alleviate');

    fireEvent.click(screen.getByRole('menuitem', { name: '设为当前词书' }));
    expect(userDataState.setActiveBook).toHaveBeenCalledWith(BUILT_IN_WORD_BOOK_IDS.IELTS_ANKI_FOUNDATION);
  });

  it('uses English UI copy for export, stats, empty search, and detail actions in English mode', () => {
    i18nState.language = 'en-US';

    renderPage();

    expect(screen.getByRole('heading', { name: 'Lexicon' })).toBeInTheDocument();
    expect(screen.getAllByText('Total words').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('New').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Mastered').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Needs review').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Learning').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('总词数')).not.toBeInTheDocument();
    expect(screen.queryByText('新词')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Open mitigate details/ }));
    expect(screen.getByText('Learning status')).toBeInTheDocument();
    expect(screen.getByText('Source book')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark mastered' })).toBeInTheDocument();
    expect(screen.queryByText('标记已掌握')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    openMenu('Dictionary tools');
    fireEvent.click(screen.getByRole('menuitem', { name: /Export current filter/ }));
    expect(screen.getByRole('heading', { name: 'Export vocabulary' })).toBeInTheDocument();
    expect(screen.getByText(/Exporting \d+ filtered words/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CSV (words only)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CSV (with progress)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anki import format (TXT)' })).toBeInTheDocument();
  });

  it('keeps pronunciation as a separate control that does not open word detail', () => {
    i18nState.language = 'en-US';

    renderPage();

    const row = screen.getByRole('button', { name: /Open mitigate details/ });
    const rowAudioButton = screen.getAllByLabelText('Play pronunciation for mitigate')[0];

    expect(within(row).queryByLabelText('Play pronunciation for mitigate')).not.toBeInTheDocument();
    fireEvent.keyDown(rowAudioButton, { key: 'Enter' });
    expect(screen.queryByText('Learning status')).not.toBeInTheDocument();

    fireEvent.click(rowAudioButton);
    expect(ttsMocks.speakEnglishText).toHaveBeenCalledWith('mitigate');
    expect(screen.queryByText('Learning status')).not.toBeInTheDocument();
  });

  it('keeps direct empty-state actions visible in English mode', () => {
    i18nState.language = 'en-US';
    userDataState.wordBooks = [builtInBook];
    userDataState.activeBook = null;
    userDataState.customWords = [];
    userDataState.progress = [];

    renderPage();

    expect(screen.getByText('Add your first word')).toBeInTheDocument();
    expect(screen.getByText('Import a word book or add a custom word to see definitions, examples, and practice actions.')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Add word' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: 'Import word book' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: 'Import Anki' }).length).toBeGreaterThanOrEqual(1);
  });

  it('closes the controlled add-word dialog from the empty-state Cancel action', () => {
    i18nState.language = 'en-US';
    userDataState.wordBooks = [builtInBook];
    userDataState.activeBook = null;
    userDataState.customWords = [];
    userDataState.progress = [];

    renderPage();

    fireEvent.click(screen.getAllByRole('button', { name: 'Add word' })[0]);
    expect(screen.getByRole('heading', { name: 'Add New Word' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('heading', { name: 'Add New Word' })).not.toBeInTheDocument();
  });

  it('shows English empty-search copy when filters remove all words', () => {
    i18nState.language = 'en-US';

    renderPage();

    fireEvent.change(screen.getByPlaceholderText('Search words, meanings, or notes...'), {
      target: { value: 'zzzz-not-found' },
    });

    expect(screen.getByText('No words found')).toBeInTheDocument();
    expect(screen.getByText('Adjust filters or import a new word book.')).toBeInTheDocument();
    expect(screen.queryByText('未找到词汇')).not.toBeInTheDocument();
  });
});

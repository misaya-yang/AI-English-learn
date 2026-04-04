// Local Storage based data management (no Supabase required)

import { normalizeWordKey, parseWordBookText } from '@/services/bookImport';
import { importApkg, inspectApkg, type AnkiProgressMapping } from '@/services/ankiApkgImport';
import { useStreakFreeze as tryUseStreakFreeze } from '@/services/gamification';
import type { FSRSState, FontSize, ThemePreference, UserSettings } from '@/types/core';
import {
  type AnkiDeckSummary,
  type AnkiImportOptions,
  type AnkiImportResult,
  BUILT_IN_BOOK_IDS,
  DEFAULT_ACTIVE_BOOK_ID,
  getBuiltInWordBooks,
  type ImportResult,
  type UserBookSelection,
  type WordBook,
} from './wordBooks';
import { wordsDatabase, type WordData } from './words';

// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  dailyGoal: number;
  preferredTopics: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  nativeLanguage: string;
}

export interface UserProgress {
  userId: string;
  wordId: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
  reviewCount: number;
  lastReviewed: string | null;
  nextReview: string | null;
  easeFactor: number;
  correctCount?: number;
  incorrectCount?: number;
  firstSeenAt?: string;
  masteredAt?: string | null;
  updatedAt?: string;
  fsrs?: FSRSState;
}

export interface StudySession {
  id: string;
  userId: string;
  date: string;
  wordsStudied: number;
  wordsLearned: number;
  xpEarned: number;
  duration: number; // in minutes
}

export interface LearningPlan {
  userId: string;
  targetLevel: string;
  targetDate: string;
  dailyWords: number;
  focusAreas: string[];
  reminderTime: string;
  reminderEnabled: boolean;
}

export interface ImportWordBookMeta {
  bookName?: string;
  source?: string;
  license?: string;
  version?: string;
  delimiter?: ',' | '\t';
  fileName?: string;
}

export interface ActiveBookSummary {
  activeBookId: string | null;
  totalWords: number;
  remainingWords: number;
  dailyGoal: number;
  isNearlyCompleted: boolean;
  isCompleted: boolean;
}

interface DailyWordsCacheEntry {
  date: string;
  wordIds: string[];
  activeBookId?: string;
}

interface ImportHistoryItem {
  id: string;
  userId: string;
  fileName: string;
  format: 'csv' | 'apkg';
  importedAt: string;
  result: ImportResult;
}

const LEGACY_CUSTOM_WORDS_KEY = 'customWords';
const MANUAL_WORD_BOOK_ID = 'custom_manual_entries';

// Storage keys
const KEYS = {
  USERS: 'vocabdaily_users',
  CURRENT_USER: 'vocabdaily_current_user',
  PROFILES: 'vocabdaily_profiles',
  PROGRESS: 'vocabdaily_progress',
  SESSIONS: 'vocabdaily_sessions',
  PLANS: 'vocabdaily_plans',
  SETTINGS: 'vocabdaily_settings',
  STREAK: 'vocabdaily_streak',
  XP: 'vocabdaily_xp',
  DAILY_WORDS: 'vocabdaily_daily_words',
  CUSTOM_WORDS: 'vocabdaily_custom_words',
  WORD_BOOKS: 'vocabdaily_word_books',
  USER_BOOK_SELECTION: 'vocabdaily_user_book_selection',
  IMPORT_HISTORY: 'vocabdaily_import_history',
};

const todayIso = (): string => new Date().toISOString().split('T')[0];
const nowIso = (): string => new Date().toISOString();
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  notifications: true,
  emailReminders: true,
  reminderTime: '20:00',
  soundEnabled: true,
  ttsEnabled: true,
  ttsVoice: 'en-US',
  autoPlayAudio: false,
  showPinyin: false,
  fontSize: 'medium',
};

// Helper functions
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';

const isFontSize = (value: unknown): value is FontSize =>
  value === 'small' || value === 'medium' || value === 'large';

const sanitizeIsoString = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const sanitizeFsrsState = (value: unknown): FSRSState | undefined => {
  if (!isRecord(value)) return undefined;
  if (
    typeof value.stability !== 'number' ||
    typeof value.difficulty !== 'number' ||
    typeof value.retrievability !== 'number' ||
    typeof value.lapses !== 'number' ||
    (value.state !== 'new' &&
      value.state !== 'learning' &&
      value.state !== 'review' &&
      value.state !== 'relearning')
  ) {
    return undefined;
  }

  const dueAt = sanitizeIsoString(value.dueAt);
  if (!dueAt) return undefined;

  return {
    stability: value.stability,
    difficulty: value.difficulty,
    retrievability: value.retrievability,
    lapses: value.lapses,
    state: value.state,
    dueAt,
    lastReviewAt: sanitizeIsoString(value.lastReviewAt),
  };
};

const sanitizeUserProgress = (userId: string, value: unknown): UserProgress | null => {
  if (!isRecord(value) || typeof value.wordId !== 'string') return null;

  const status =
    value.status === 'learning' || value.status === 'review' || value.status === 'mastered' || value.status === 'new'
      ? value.status
      : 'new';

  return {
    userId,
    wordId: value.wordId,
    status,
    reviewCount: typeof value.reviewCount === 'number' ? value.reviewCount : 0,
    lastReviewed: sanitizeIsoString(value.lastReviewed),
    nextReview: typeof value.nextReview === 'string' ? value.nextReview : null,
    easeFactor: typeof value.easeFactor === 'number' ? value.easeFactor : 2.5,
    correctCount: typeof value.correctCount === 'number' ? value.correctCount : 0,
    incorrectCount: typeof value.incorrectCount === 'number' ? value.incorrectCount : 0,
    firstSeenAt: sanitizeIsoString(value.firstSeenAt) ?? sanitizeIsoString(value.lastReviewed) ?? nowIso(),
    masteredAt: sanitizeIsoString(value.masteredAt),
    updatedAt: sanitizeIsoString(value.updatedAt) ?? nowIso(),
    fsrs: sanitizeFsrsState(value.fsrs),
  };
};

const sanitizeStudySession = (userId: string, value: unknown): StudySession | null => {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.date !== 'string') return null;

  return {
    id: value.id,
    userId,
    date: value.date,
    wordsStudied: typeof value.wordsStudied === 'number' ? value.wordsStudied : 0,
    wordsLearned: typeof value.wordsLearned === 'number' ? value.wordsLearned : 0,
    xpEarned: typeof value.xpEarned === 'number' ? value.xpEarned : 0,
    duration: typeof value.duration === 'number' ? value.duration : 0,
  };
};

const sanitizeUserSettings = (value: unknown): UserSettings => {
  if (!isRecord(value)) return DEFAULT_SETTINGS;

  return {
    theme: isThemePreference(value.theme) ? value.theme : DEFAULT_SETTINGS.theme,
    notifications: typeof value.notifications === 'boolean' ? value.notifications : DEFAULT_SETTINGS.notifications,
    emailReminders:
      typeof value.emailReminders === 'boolean' ? value.emailReminders : DEFAULT_SETTINGS.emailReminders,
    reminderTime:
      typeof value.reminderTime === 'string' && value.reminderTime.trim().length > 0
        ? value.reminderTime
        : DEFAULT_SETTINGS.reminderTime,
    soundEnabled: typeof value.soundEnabled === 'boolean' ? value.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
    ttsEnabled: typeof value.ttsEnabled === 'boolean' ? value.ttsEnabled : DEFAULT_SETTINGS.ttsEnabled,
    ttsVoice: typeof value.ttsVoice === 'string' ? value.ttsVoice : DEFAULT_SETTINGS.ttsVoice,
    autoPlayAudio:
      typeof value.autoPlayAudio === 'boolean' ? value.autoPlayAudio : DEFAULT_SETTINGS.autoPlayAudio,
    showPinyin: typeof value.showPinyin === 'boolean' ? value.showPinyin : DEFAULT_SETTINGS.showPinyin,
    fontSize: isFontSize(value.fontSize) ? value.fontSize : DEFAULT_SETTINGS.fontSize,
  };
};

const uniqueStrings = (values: string[]): string[] => Array.from(new Set(values));

const buildWordLookups = (words: WordData[]) => {
  const byId = new Map<string, WordData>();
  const byWordKey = new Map<string, WordData>();

  for (const word of words) {
    byId.set(word.id, word);
    byWordKey.set(normalizeWordKey(word.word), word);
  }

  return { byId, byWordKey };
};

const mergeWordOnlyFillEmpty = (existing: WordData, incoming: WordData): WordData => {
  const chooseString = (current?: string, next?: string): string | undefined => {
    if (current && current.trim().length > 0) {
      return current;
    }
    if (next && next.trim().length > 0) {
      return next;
    }
    return current;
  };

  const chooseArray = <T>(current: T[], next: T[]): T[] => {
    if (current.length > 0) {
      return current;
    }
    return next;
  };

  return {
    ...existing,
    phonetic: chooseString(existing.phonetic, incoming.phonetic) || '',
    partOfSpeech: chooseString(existing.partOfSpeech, incoming.partOfSpeech) || 'n.',
    definition: chooseString(existing.definition, incoming.definition) || existing.definition,
    definitionZh: chooseString(existing.definitionZh, incoming.definitionZh) || '',
    examples: chooseArray(existing.examples, incoming.examples),
    synonyms: chooseArray(existing.synonyms, incoming.synonyms),
    antonyms: chooseArray(existing.antonyms, incoming.antonyms),
    collocations: chooseArray(existing.collocations, incoming.collocations),
    level: existing.level || incoming.level,
    topic: chooseString(existing.topic, incoming.topic) || 'daily',
    etymology: chooseString(existing.etymology, incoming.etymology),
    memoryTip: chooseString(existing.memoryTip, incoming.memoryTip),
  };
};

const getCombinedWordsForUser = (userId: string, allWords: WordData[]): WordData[] => {
  const customWords = getCustomWords(userId);
  const byId = new Map<string, WordData>();

  for (const word of [...allWords, ...customWords]) {
    byId.set(word.id, word);
  }

  return [...byId.values()];
};

const clearDailyWordsCacheForUser = (userId: string): void => {
  const savedDaily = getItem<Record<string, DailyWordsCacheEntry>>(KEYS.DAILY_WORDS, {});
  if (savedDaily[userId]) {
    delete savedDaily[userId];
    setItem(KEYS.DAILY_WORDS, savedDaily);
  }
};

const getBookSelectionMap = (): Record<string, UserBookSelection> => {
  return getItem<Record<string, UserBookSelection>>(KEYS.USER_BOOK_SELECTION, {});
};

const setBookSelectionMap = (selectionMap: Record<string, UserBookSelection>): void => {
  setItem(KEYS.USER_BOOK_SELECTION, selectionMap);
};

const resolveDailyGoal = (userId: string): number => {
  const selection = getBookSelectionMap()[userId];
  if (selection?.dailyGoalOverride && selection.dailyGoalOverride > 0) {
    return selection.dailyGoalOverride;
  }

  const profile = getProfile(userId);
  if (profile?.dailyGoal && profile.dailyGoal > 0) {
    return profile.dailyGoal;
  }

  return 10;
};

const getWordBookMap = (): Record<string, WordBook[]> => {
  return getItem<Record<string, WordBook[]>>(KEYS.WORD_BOOKS, {});
};

const setWordBookMap = (wordBookMap: Record<string, WordBook[]>): void => {
  setItem(KEYS.WORD_BOOKS, wordBookMap);
};

const getImportHistoryMap = (): Record<string, ImportHistoryItem[]> => {
  return getItem<Record<string, ImportHistoryItem[]>>(KEYS.IMPORT_HISTORY, {});
};

const setImportHistoryMap = (historyMap: Record<string, ImportHistoryItem[]>): void => {
  setItem(KEYS.IMPORT_HISTORY, historyMap);
};

const appendImportHistory = (
  userId: string,
  fileName: string,
  result: ImportResult,
  format: 'csv' | 'apkg',
): void => {
  const historyMap = getImportHistoryMap();
  const current = historyMap[userId] || [];
  current.unshift({
    id: `import_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    fileName,
    format,
    importedAt: nowIso(),
    result,
  });

  historyMap[userId] = current.slice(0, 30);
  setImportHistoryMap(historyMap);
};

const createManualWordBook = (wordIds: string[] = []): WordBook => {
  return {
    id: MANUAL_WORD_BOOK_ID,
    name: '我的生词本',
    source: 'User Manual Entry',
    license: 'User content',
    levelRange: ['A1', 'A2', 'B1', 'B2', 'C1'],
    topicTags: ['custom'],
    wordIds: uniqueStrings(wordIds),
    createdAt: nowIso(),
    isBuiltIn: false,
    version: '1.0.0',
  };
};

const ensureManualWordBook = (userId: string, wordIds: string[] = []): WordBook => {
  const map = getWordBookMap();
  const books = map[userId] || [];
  const existing = books.find((book) => book.id === MANUAL_WORD_BOOK_ID);

  if (!existing) {
    const manual = createManualWordBook(wordIds);
    map[userId] = [manual, ...books];
    setWordBookMap(map);
    return manual;
  }

  const mergedWordIds = uniqueStrings([...existing.wordIds, ...wordIds]);
  if (mergedWordIds.length !== existing.wordIds.length) {
    const updated = { ...existing, wordIds: mergedWordIds };
    map[userId] = books.map((book) => (book.id === updated.id ? updated : book));
    setWordBookMap(map);
    return updated;
  }

  return existing;
};

const removeWordIdFromCustomBooks = (userId: string, wordId: string): void => {
  const map = getWordBookMap();
  const books = map[userId] || [];

  const updatedBooks = books
    .map((book) => ({
      ...book,
      wordIds: book.wordIds.filter((id) => id !== wordId),
    }))
    .filter((book) => {
      if (book.id === MANUAL_WORD_BOOK_ID) {
        return book.wordIds.length > 0;
      }
      return true;
    });

  map[userId] = updatedBooks;
  setWordBookMap(map);
};

const migrateLegacyCustomWordsIfNeeded = (userId: string): void => {
  const customWordMap = getItem<Record<string, WordData[]>>(KEYS.CUSTOM_WORDS, {});
  if (customWordMap[userId]?.length) {
    return;
  }

  const raw = localStorage.getItem(LEGACY_CUSTOM_WORDS_KEY);
  if (!raw) {
    return;
  }

  try {
    const legacyWords = JSON.parse(raw) as WordData[];
    if (!Array.isArray(legacyWords) || legacyWords.length === 0) {
      return;
    }

    customWordMap[userId] = legacyWords;
    setItem(KEYS.CUSTOM_WORDS, customWordMap);
    ensureManualWordBook(userId, legacyWords.map((word) => word.id));
    localStorage.removeItem(LEGACY_CUSTOM_WORDS_KEY);
  } catch {
    // Ignore bad legacy format.
  }
};

// User management
export const createUser = (email: string, password: string, displayName: string): User | null => {
  void password;
  const users = getItem<User[]>(KEYS.USERS, []);

  // Check if email already exists
  if (users.find((u) => u.email === email)) {
    return null;
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    email,
    displayName,
    createdAt: nowIso(),
  };

  users.push(newUser);
  setItem(KEYS.USERS, users);
  setItem(KEYS.CURRENT_USER, newUser);

  // Initialize default profile
  createProfile(newUser.id);

  return newUser;
};

export const loginUser = (email: string, password: string): User | null => {
  void password;
  const users = getItem<User[]>(KEYS.USERS, []);
  const user = users.find((u) => u.email === email);

  if (user) {
    setItem(KEYS.CURRENT_USER, user);
    return user;
  }

  return null;
};

export const logoutUser = (): void => {
  localStorage.removeItem(KEYS.CURRENT_USER);
};

export const getCurrentUser = (): User | null => {
  return getItem<User | null>(KEYS.CURRENT_USER, null);
};

export const isLoggedIn = (): boolean => {
  return getCurrentUser() !== null;
};

// Profile management
export const createProfile = (userId: string): UserProfile => {
  const profile: UserProfile = {
    userId,
    cefrLevel: 'B1',
    dailyGoal: 10,
    preferredTopics: ['daily', 'business', 'technology'],
    learningStyle: 'visual',
    nativeLanguage: 'zh-CN',
  };

  const profiles = getItem<Record<string, UserProfile>>(KEYS.PROFILES, {});
  profiles[userId] = profile;
  setItem(KEYS.PROFILES, profiles);

  return profile;
};

export const getProfile = (userId: string): UserProfile | null => {
  const profiles = getItem<Record<string, UserProfile>>(KEYS.PROFILES, {});
  return profiles[userId] || null;
};

export const updateProfile = (userId: string, updates: Partial<UserProfile>): UserProfile | null => {
  const profiles = getItem<Record<string, UserProfile>>(KEYS.PROFILES, {});

  if (profiles[userId]) {
    profiles[userId] = { ...profiles[userId], ...updates };
    setItem(KEYS.PROFILES, profiles);
    clearDailyWordsCacheForUser(userId);
    return profiles[userId];
  }

  return null;
};

// Custom words management
export const getCustomWords = (userId: string): WordData[] => {
  migrateLegacyCustomWordsIfNeeded(userId);
  const customWordMap = getItem<Record<string, WordData[]>>(KEYS.CUSTOM_WORDS, {});
  return customWordMap[userId] || [];
};

const setCustomWords = (userId: string, words: WordData[]): void => {
  const customWordMap = getItem<Record<string, WordData[]>>(KEYS.CUSTOM_WORDS, {});
  customWordMap[userId] = words;
  setItem(KEYS.CUSTOM_WORDS, customWordMap);
};

export const saveCustomWord = (userId: string, word: WordData): WordData => {
  const currentWords = getCustomWords(userId);
  const key = normalizeWordKey(word.word);
  const normalizedWord: WordData = {
    ...word,
    id: word.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    topic: word.topic || 'daily',
    partOfSpeech: word.partOfSpeech || 'n.',
    phonetic: word.phonetic || '',
    definitionZh: word.definitionZh || '',
    examples: word.examples || [],
    synonyms: word.synonyms || [],
    antonyms: word.antonyms || [],
    collocations: word.collocations || [],
    level: word.level || 'B1',
  };

  let savedWord = normalizedWord;
  const updatedWords = [...currentWords];

  const existingIndex = updatedWords.findIndex(
    (item) => normalizeWordKey(item.word) === key || item.id === normalizedWord.id,
  );

  if (existingIndex >= 0) {
    savedWord = mergeWordOnlyFillEmpty(updatedWords[existingIndex], normalizedWord);
    updatedWords[existingIndex] = savedWord;
  } else {
    updatedWords.push(savedWord);
  }

  setCustomWords(userId, updatedWords);
  ensureManualWordBook(userId, [savedWord.id]);
  clearDailyWordsCacheForUser(userId);

  return savedWord;
};

export const deleteCustomWord = (userId: string, wordId: string): void => {
  const currentWords = getCustomWords(userId);
  const nextWords = currentWords.filter((word) => word.id !== wordId);
  setCustomWords(userId, nextWords);
  removeWordIdFromCustomBooks(userId, wordId);
  clearDailyWordsCacheForUser(userId);
};

// Word books
export const getWordBooks = (userId: string): WordBook[] => {
  const customWords = getCustomWords(userId);
  if (customWords.length > 0) {
    ensureManualWordBook(userId, customWords.map((word) => word.id));
  }

  const builtInBooks = getBuiltInWordBooks(wordsDatabase);
  const map = getWordBookMap();
  const userBooks = map[userId] || [];

  const dedupedUserBooks = userBooks.map((book) => ({
    ...book,
    isBuiltIn: false,
    wordIds: uniqueStrings(book.wordIds),
  }));

  return [...builtInBooks, ...dedupedUserBooks];
};

export const saveWordBook = (userId: string, book: WordBook): WordBook => {
  if (BUILT_IN_BOOK_IDS.has(book.id)) {
    throw new Error('Built-in books cannot be modified');
  }

  const map = getWordBookMap();
  const books = map[userId] || [];

  const normalizedBook: WordBook = {
    ...book,
    isBuiltIn: false,
    createdAt: book.createdAt || nowIso(),
    version: book.version || '1.0.0',
    wordIds: uniqueStrings(book.wordIds),
    source: book.source || 'User import',
    license: book.license || 'User provided',
  };

  const existingIndex = books.findIndex((item) => item.id === normalizedBook.id);
  if (existingIndex >= 0) {
    books[existingIndex] = normalizedBook;
  } else {
    books.unshift(normalizedBook);
  }

  map[userId] = books;
  setWordBookMap(map);

  const activeSelection = getBookSelectionMap()[userId];
  if (!activeSelection) {
    setActiveBook(userId, normalizedBook.id);
  } else {
    clearDailyWordsCacheForUser(userId);
  }

  return normalizedBook;
};

export const deleteWordBook = (userId: string, bookId: string): boolean => {
  if (BUILT_IN_BOOK_IDS.has(bookId)) {
    return false;
  }

  const map = getWordBookMap();
  const books = map[userId] || [];
  const hasBook = books.some((book) => book.id === bookId);

  if (!hasBook) {
    return false;
  }

  map[userId] = books.filter((book) => book.id !== bookId);
  setWordBookMap(map);

  const selectionMap = getBookSelectionMap();
  if (selectionMap[userId]?.activeBookId === bookId) {
    const fallbackBooks = getWordBooks(userId);
    const fallbackBook =
      fallbackBooks.find((book) => book.id === DEFAULT_ACTIVE_BOOK_ID) || fallbackBooks[0] || null;

    if (fallbackBook) {
      selectionMap[userId] = {
        userId,
        activeBookId: fallbackBook.id,
        dailyGoalOverride: selectionMap[userId]?.dailyGoalOverride,
      };
    } else {
      delete selectionMap[userId];
    }
    setBookSelectionMap(selectionMap);
  }

  clearDailyWordsCacheForUser(userId);
  return true;
};

export const setActiveBook = (userId: string, bookId: string): WordBook | null => {
  const books = getWordBooks(userId);
  const targetBook = books.find((book) => book.id === bookId) || null;

  if (!targetBook) {
    return null;
  }

  const selectionMap = getBookSelectionMap();
  const current = selectionMap[userId];
  selectionMap[userId] = {
    userId,
    activeBookId: targetBook.id,
    dailyGoalOverride: current?.dailyGoalOverride,
  };

  setBookSelectionMap(selectionMap);
  clearDailyWordsCacheForUser(userId);

  return targetBook;
};

export const getActiveBook = (userId: string): WordBook | null => {
  const books = getWordBooks(userId);
  if (books.length === 0) {
    return null;
  }

  const selectionMap = getBookSelectionMap();
  const savedSelection = selectionMap[userId];
  const selectedBook = books.find((book) => book.id === savedSelection?.activeBookId);

  if (selectedBook) {
    return selectedBook;
  }

  const fallbackBook = books.find((book) => book.id === DEFAULT_ACTIVE_BOOK_ID) || books[0];
  selectionMap[userId] = {
    userId,
    activeBookId: fallbackBook.id,
    dailyGoalOverride: savedSelection?.dailyGoalOverride,
  };
  setBookSelectionMap(selectionMap);

  return fallbackBook;
};

export const getActiveBookSummary = (userId: string, allWords: WordData[]): ActiveBookSummary => {
  const activeBook = getActiveBook(userId);
  const dailyGoal = resolveDailyGoal(userId);

  if (!activeBook) {
    return {
      activeBookId: null,
      totalWords: 0,
      remainingWords: 0,
      dailyGoal,
      isNearlyCompleted: false,
      isCompleted: false,
    };
  }

  const combinedWords = getCombinedWordsForUser(userId, allWords);
  const { byId } = buildWordLookups(combinedWords);
  const progressMap = new Map(getProgress(userId).map((item) => [item.wordId, item]));

  const wordsInBook = activeBook.wordIds
    .map((id) => byId.get(id))
    .filter((word): word is WordData => Boolean(word));

  const remainingWords = wordsInBook.filter((word) => {
    const item = progressMap.get(word.id);
    return item?.status !== 'mastered';
  }).length;

  return {
    activeBookId: activeBook.id,
    totalWords: wordsInBook.length,
    remainingWords,
    dailyGoal,
    isNearlyCompleted: wordsInBook.length > 0 && remainingWords <= dailyGoal,
    isCompleted: wordsInBook.length > 0 && remainingWords === 0,
  };
};

interface ImportedWordRow {
  key: string;
  word: WordData;
  progress?: AnkiProgressMapping | null;
  raw?: string;
}

interface UpsertImportedWordsResult {
  importedWordIds: string[];
  mappedProgressCount: number;
}

const upsertImportedWords = (
  userId: string,
  rows: ImportedWordRow[],
): UpsertImportedWordsResult => {
  const combinedExisting = getCombinedWordsForUser(userId, wordsDatabase);
  const { byWordKey: existingByWordKey } = buildWordLookups(combinedExisting);

  const customWords = getCustomWords(userId);
  const customByWordKey = new Map(customWords.map((word) => [normalizeWordKey(word.word), word]));
  const updatedCustomWords = [...customWords];

  const importedWordIds: string[] = [];
  const pendingProgress = new Map<string, AnkiProgressMapping>();
  let createdWordCount = 0;

  for (const row of rows) {
    const existingWord = existingByWordKey.get(row.key);

    if (existingWord) {
      importedWordIds.push(existingWord.id);

      const existingCustom = customByWordKey.get(row.key);
      if (existingCustom) {
        const merged = mergeWordOnlyFillEmpty(existingCustom, row.word);
        const index = updatedCustomWords.findIndex((item) => item.id === existingCustom.id);
        if (index >= 0) {
          updatedCustomWords[index] = merged;
          customByWordKey.set(row.key, merged);
          existingByWordKey.set(row.key, merged);
        }
      }

      if (row.progress) {
        pendingProgress.set(existingWord.id, row.progress);
      }

      continue;
    }

    const createdWord: WordData = {
      ...row.word,
      id: `import_${Date.now()}_${createdWordCount}`,
    };

    createdWordCount += 1;
    updatedCustomWords.push(createdWord);
    customByWordKey.set(row.key, createdWord);
    existingByWordKey.set(row.key, createdWord);
    importedWordIds.push(createdWord.id);

    if (row.progress) {
      pendingProgress.set(createdWord.id, row.progress);
    }
  }

  setCustomWords(userId, updatedCustomWords);

  if (pendingProgress.size > 0) {
    const allProgress = getItem<Record<string, UserProgress[]>>(KEYS.PROGRESS, {});
    if (!allProgress[userId]) {
      allProgress[userId] = [];
    }

    for (const [wordId, mapped] of pendingProgress.entries()) {
      const existingIndex = allProgress[userId].findIndex((item) => item.wordId === wordId);

      if (existingIndex >= 0) {
        allProgress[userId][existingIndex] = {
          ...allProgress[userId][existingIndex],
          status: mapped.status,
          reviewCount: Math.max(mapped.reviewCount, allProgress[userId][existingIndex].reviewCount),
          easeFactor: mapped.easeFactor,
          nextReview: mapped.nextReview,
          lastReviewed: nowIso(),
        };
      } else {
        allProgress[userId].push({
          userId,
          wordId,
          status: mapped.status,
          reviewCount: mapped.reviewCount,
          lastReviewed: nowIso(),
          nextReview: mapped.nextReview,
          easeFactor: mapped.easeFactor,
        });
      }
    }

    setItem(KEYS.PROGRESS, allProgress);
  }

  return {
    importedWordIds,
    mappedProgressCount: pendingProgress.size,
  };
};

const createBookFromImportedWordIds = (
  userId: string,
  importedWordIds: string[],
  meta: ImportWordBookMeta,
): string | undefined => {
  const uniqueWordIds = uniqueStrings(importedWordIds);
  if (uniqueWordIds.length === 0) {
    return undefined;
  }

  const allWords = getCombinedWordsForUser(userId, wordsDatabase);
  const { byId } = buildWordLookups(allWords);

  const levels = uniqueStrings(
    uniqueWordIds
      .map((wordId) => byId.get(wordId)?.level)
      .filter((level): level is WordData['level'] => Boolean(level)),
  );

  const topics = uniqueStrings(
    uniqueWordIds
      .map((wordId) => byId.get(wordId)?.topic)
      .filter((topic): topic is string => Boolean(topic)),
  );

  const generatedBookId = `book_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const book: WordBook = {
    id: generatedBookId,
    name: meta.bookName?.trim() || 'Imported Word Book',
    source: meta.source || 'CSV/TSV Import',
    license: meta.license || 'User provided',
    levelRange: levels.length > 0 ? levels : ['B1'],
    topicTags: topics,
    wordIds: uniqueWordIds,
    createdAt: nowIso(),
    isBuiltIn: false,
    version: meta.version || '1.0.0',
  };

  saveWordBook(userId, book);
  setActiveBook(userId, book.id);
  return book.id;
};

export const importWordBookFromCsv = (
  userId: string,
  fileText: string,
  meta: ImportWordBookMeta = {},
): ImportResult => {
  const parsed = parseWordBookText(fileText, { delimiter: meta.delimiter });
  const upsertResult = upsertImportedWords(
    userId,
    parsed.successRows.map((row) => ({
      key: row.key,
      word: row.word,
      raw: row.raw,
    })),
  );

  const createdBookId = createBookFromImportedWordIds(userId, upsertResult.importedWordIds, meta);

  clearDailyWordsCacheForUser(userId);

  const result: ImportResult = {
    totalRows: parsed.totalRows,
    successCount: uniqueStrings(upsertResult.importedWordIds).length,
    duplicateCount: parsed.duplicateCount,
    errorRows: parsed.errorRows,
    createdBookId,
  };

  appendImportHistory(userId, meta.fileName || 'manual-import', result, 'csv');
  return result;
};

export const inspectAnkiApkg = async (file: File): Promise<AnkiDeckSummary[]> => {
  const result = await inspectApkg(file);
  return result.decks;
};

export const importWordBookFromAnkiApkg = async (
  userId: string,
  file: File,
  options: AnkiImportOptions,
): Promise<AnkiImportResult> => {
  const parsed = await importApkg(file, options);

  const upsertResult = upsertImportedWords(
    userId,
    parsed.rows.map((row) => ({
      key: row.key,
      word: row.word,
      progress: row.progress,
      raw: row.raw,
    })),
  );

  const createdBookId = createBookFromImportedWordIds(userId, upsertResult.importedWordIds, {
    bookName: options.bookName,
    source: options.source || `Anki APKG Import: ${file.name}`,
    license: options.license || 'User provided',
    version: options.version,
  });

  clearDailyWordsCacheForUser(userId);

  const result: AnkiImportResult = {
    totalRows: parsed.rows.length + parsed.unmappedRows.length,
    successCount: uniqueStrings(upsertResult.importedWordIds).length,
    duplicateCount: parsed.skippedCards - parsed.unmappedRows.length,
    errorRows: parsed.unmappedRows,
    createdBookId,
    selectedDeck: parsed.selectedDeck,
    skippedCards: parsed.skippedCards,
    mappedProgressCount: upsertResult.mappedProgressCount,
    unmappedRows: parsed.unmappedRows,
  };

  appendImportHistory(userId, options.fileName || file.name, result, 'apkg');
  return result;
};

// Progress tracking
export const getProgress = (userId: string): UserProgress[] => {
  const allProgress = getItem<Record<string, unknown[]>>(KEYS.PROGRESS, {});
  const progressRows = Array.isArray(allProgress[userId]) ? allProgress[userId] : [];
  return progressRows
    .map((row) => sanitizeUserProgress(userId, row))
    .filter((row): row is UserProgress => row !== null);
};

export const updateWordProgress = (
  userId: string,
  wordId: string,
  updates: Partial<UserProgress>,
): UserProgress => {
  const allProgress = getItem<Record<string, UserProgress[]>>(KEYS.PROGRESS, {});

  if (!allProgress[userId]) {
    allProgress[userId] = [];
  }

  const existingIndex = allProgress[userId].findIndex((p) => p.wordId === wordId);

  if (existingIndex >= 0) {
    allProgress[userId][existingIndex] = {
      ...allProgress[userId][existingIndex],
      ...updates,
    };
  } else {
    const newProgress: UserProgress = {
      userId,
      wordId,
      status: 'new',
      reviewCount: 0,
      lastReviewed: null,
      nextReview: null,
      easeFactor: 2.5,
      correctCount: 0,
      incorrectCount: 0,
      firstSeenAt: nowIso(),
      masteredAt: null,
      updatedAt: nowIso(),
      ...updates,
    };
    allProgress[userId].push(newProgress);
  }

  setItem(KEYS.PROGRESS, allProgress);
  return allProgress[userId].find((p) => p.wordId === wordId)!;
};

export const getWordProgress = (userId: string, wordId: string): UserProgress | null => {
  const progress = getProgress(userId);
  return progress.find((p) => p.wordId === wordId) || null;
};

export const getDueWords = (userId: string): UserProgress[] => {
  const progress = getProgress(userId);
  const today = todayIso();
  const now = Date.now();

  return progress.filter((p) => {
    if (p.status === 'mastered') return false;
    if (p.fsrs?.state === 'new') return true;
    if (p.fsrs?.dueAt) {
      return new Date(p.fsrs.dueAt).getTime() <= now;
    }
    if (!p.nextReview) return true;
    return p.nextReview <= today;
  });
};

export const getMasteredWords = (userId: string): UserProgress[] => {
  const progress = getProgress(userId);
  return progress.filter((p) => p.status === 'mastered');
};

// SRS Algorithm
export const calculateNextReview = (
  rating: 'again' | 'hard' | 'good' | 'easy',
  currentEase: number,
  reviewCount: number,
): { nextReview: string; newEase: number } => {
  const today = new Date();
  let days = 1;
  let newEase = currentEase;

  switch (rating) {
    case 'again':
      days = 1;
      newEase = Math.max(1.3, currentEase - 0.2);
      break;
    case 'hard':
      days = Math.max(1, Math.round(reviewCount === 0 ? 1 : reviewCount * 1.2));
      newEase = Math.max(1.3, currentEase - 0.15);
      break;
    case 'good':
      days = reviewCount === 0 ? 1 : Math.round(reviewCount * currentEase);
      break;
    case 'easy':
      days = reviewCount === 0 ? 4 : Math.round(reviewCount * currentEase * 1.3);
      newEase = Math.min(2.5, currentEase + 0.15);
      break;
  }

  const nextReview = new Date(today);
  nextReview.setDate(nextReview.getDate() + days);

  return { nextReview: nextReview.toISOString().split('T')[0], newEase };
};

// XP and Streak
export const getXP = (userId: string): { total: number; today: number; level: number } => {
  const xpData = getItem<Record<string, { total: number; today: number; lastDate: string }>>(KEYS.XP, {});

  if (!xpData[userId]) {
    xpData[userId] = { total: 0, today: 0, lastDate: todayIso() };
    setItem(KEYS.XP, xpData);
  }

  // Reset daily XP if it's a new day
  const today = todayIso();
  if (xpData[userId].lastDate !== today) {
    xpData[userId].today = 0;
    xpData[userId].lastDate = today;
    setItem(KEYS.XP, xpData);
  }

  const level = Math.floor(xpData[userId].total / 100) + 1;

  return {
    total: xpData[userId].total,
    today: xpData[userId].today,
    level,
  };
};

export const addXP = (userId: string, amount: number): void => {
  const xpData = getItem<Record<string, { total: number; today: number; lastDate: string }>>(KEYS.XP, {});

  if (!xpData[userId]) {
    xpData[userId] = { total: 0, today: 0, lastDate: todayIso() };
  }

  const today = todayIso();
  if (xpData[userId].lastDate !== today) {
    xpData[userId].today = 0;
    xpData[userId].lastDate = today;
  }

  xpData[userId].total += amount;
  xpData[userId].today += amount;

  setItem(KEYS.XP, xpData);
};

export const getStreak = (
  userId: string,
): { current: number; longest: number; lastStudyDate: string | null } => {
  const streakData = getItem<
    Record<string, { current: number; longest: number; lastStudyDate: string | null }>
  >(KEYS.STREAK, {});

  if (!streakData[userId]) {
    streakData[userId] = { current: 0, longest: 0, lastStudyDate: null };
    setItem(KEYS.STREAK, streakData);
  }

  // Check if streak should be broken
  const today = todayIso();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (
    streakData[userId].lastStudyDate &&
    streakData[userId].lastStudyDate !== today &&
    streakData[userId].lastStudyDate !== yesterdayStr
  ) {
    // Try to use a streak freeze before breaking the streak
    const saved = tryUseStreakFreeze(userId);
    if (!saved) {
      streakData[userId].current = 0;
    }
    setItem(KEYS.STREAK, streakData);
  }

  return streakData[userId];
};

export const updateStreak = (userId: string): void => {
  const streakData = getItem<
    Record<string, { current: number; longest: number; lastStudyDate: string | null }>
  >(KEYS.STREAK, {});

  if (!streakData[userId]) {
    streakData[userId] = { current: 0, longest: 0, lastStudyDate: null };
  }

  const today = todayIso();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (streakData[userId].lastStudyDate === today) {
    return;
  }

  if (streakData[userId].lastStudyDate === yesterdayStr || streakData[userId].current === 0) {
    streakData[userId].current += 1;
  }

  if (streakData[userId].current > streakData[userId].longest) {
    streakData[userId].longest = streakData[userId].current;
  }

  streakData[userId].lastStudyDate = today;
  setItem(KEYS.STREAK, streakData);
};

// Study sessions
export const recordStudySession = (
  userId: string,
  wordsStudied: number,
  wordsLearned: number,
  xpEarned: number,
  duration: number,
): void => {
  const sessions = getItem<StudySession[]>(KEYS.SESSIONS, []);

  const session: StudySession = {
    id: `session_${Date.now()}`,
    userId,
    date: todayIso(),
    wordsStudied,
    wordsLearned,
    xpEarned,
    duration,
  };

  sessions.push(session);
  setItem(KEYS.SESSIONS, sessions);

  updateStreak(userId);
  addXP(userId, xpEarned);
};

export const getStudySessions = (userId: string): StudySession[] => {
  const sessions = getItem<unknown[]>(KEYS.SESSIONS, []);
  return sessions
    .map((row) => sanitizeStudySession(userId, row))
    .filter((row): row is StudySession => row !== null);
};

export const getStudyStats = (userId: string) => {
  const sessions = getStudySessions(userId);
  const progress = getProgress(userId);

  const totalWords = progress.length;
  const masteredWords = progress.filter((p) => p.status === 'mastered').length;
  const learningWords = progress.filter((p) => p.status === 'learning').length;
  const reviewWords = progress.filter((p) => p.status === 'review').length;

  const totalXP = getXP(userId).total;
  const streak = getStreak(userId);

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklySessions = sessions.filter((s) => new Date(s.date) >= weekAgo);
  const weeklyWords = weeklySessions.reduce((sum, s) => sum + s.wordsLearned, 0);
  const weeklyXP = weeklySessions.reduce((sum, s) => sum + s.xpEarned, 0);

  return {
    totalWords,
    masteredWords,
    learningWords,
    reviewWords,
    totalXP,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    weeklyWords,
    weeklyXP,
  };
};

// Learning Plan
export const getLearningPlan = (userId: string): LearningPlan | null => {
  const plans = getItem<Record<string, LearningPlan>>(KEYS.PLANS, {});
  return plans[userId] || null;
};

export const saveLearningPlan = (userId: string, plan: Partial<LearningPlan>): LearningPlan => {
  const plans = getItem<Record<string, LearningPlan>>(KEYS.PLANS, {});

  const existingPlan = plans[userId] || {
    userId,
    targetLevel: 'C1',
    targetDate: '',
    dailyWords: 10,
    focusAreas: [],
    reminderTime: '20:00',
    reminderEnabled: false,
  };

  plans[userId] = { ...existingPlan, ...plan };
  setItem(KEYS.PLANS, plans);

  return plans[userId];
};

// Daily words (active book based)
export const getDailyWords = (userId: string, allWords: WordData[]): WordData[] => {
  const today = todayIso();
  const activeBook = getActiveBook(userId);

  if (!activeBook) {
    return [];
  }

  const savedDaily = getItem<Record<string, DailyWordsCacheEntry>>(KEYS.DAILY_WORDS, {});
  const cached = savedDaily[userId];

  const combinedWords = getCombinedWordsForUser(userId, allWords);
  const { byId } = buildWordLookups(combinedWords);

  if (cached && cached.date === today && cached.activeBookId === activeBook.id) {
    const cachedWords = cached.wordIds
      .map((id) => byId.get(id))
      .filter((word): word is WordData => Boolean(word));

    if (cachedWords.length === cached.wordIds.length) {
      return cachedWords;
    }
  }

  const progressMap = new Map(getProgress(userId).map((item) => [item.wordId, item]));
  const bookWords = activeBook.wordIds
    .map((id) => byId.get(id))
    .filter((word): word is WordData => Boolean(word));

  if (bookWords.length === 0) {
    savedDaily[userId] = {
      date: today,
      activeBookId: activeBook.id,
      wordIds: [],
    };
    setItem(KEYS.DAILY_WORDS, savedDaily);
    return [];
  }

  const dueWords: WordData[] = [];
  const newWords: WordData[] = [];
  const learningWords: WordData[] = [];

  for (const word of bookWords) {
    const progress = progressMap.get(word.id);

    if (!progress) {
      newWords.push(word);
      continue;
    }

    if (progress.status === 'mastered') {
      continue;
    }

    const isDue = !progress.nextReview || progress.nextReview <= today;
    if (isDue) {
      dueWords.push(word);
    } else {
      learningWords.push(word);
    }
  }

  dueWords.sort((a, b) => {
    const aReview = progressMap.get(a.id)?.nextReview || '';
    const bReview = progressMap.get(b.id)?.nextReview || '';
    return aReview.localeCompare(bReview);
  });

  const shuffle = <T,>(list: T[]): T[] => [...list].sort(() => Math.random() - 0.5);

  const dailyGoal = resolveDailyGoal(userId);
  const prioritized = [...dueWords, ...shuffle(newWords), ...shuffle(learningWords)];
  const selectedWords = prioritized.slice(0, dailyGoal);

  savedDaily[userId] = {
    date: today,
    activeBookId: activeBook.id,
    wordIds: selectedWords.map((word) => word.id),
  };
  setItem(KEYS.DAILY_WORDS, savedDaily);

  return selectedWords;
};

// Settings
export const getSettings = (userId: string): UserSettings => {
  const settings = getItem<Record<string, unknown>>(KEYS.SETTINGS, {});
  return sanitizeUserSettings(settings[userId]);
};

export const saveSettings = (userId: string, settings: Partial<UserSettings>): UserSettings => {
  const allSettings = getItem<Record<string, unknown>>(KEYS.SETTINGS, {});
  const nextSettings = sanitizeUserSettings({
    ...sanitizeUserSettings(allSettings[userId]),
    ...settings,
  });
  allSettings[userId] = nextSettings;
  setItem(KEYS.SETTINGS, allSettings);
  return nextSettings;
};

// Clear all data (for logout/reset)
export const clearAllData = (): void => {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem(LEGACY_CUSTOM_WORDS_KEY);
};

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getDailyWords as getDailyWordsFromStorage,
  getProgress,
  getDueWords,
  getMasteredWords,
  updateWordProgress,
  calculateNextReview,
  getXP,
  addXP,
  getStreak,
  updateStreak,
  recordStudySession,
  getStudyStats,
  getLearningPlan,
  saveLearningPlan,
  getSettings,
  saveSettings,
  getWordBooks,
  getActiveBook as getActiveBookFromStorage,
  setActiveBook as setActiveBookInStorage,
  importWordBookFromCsv,
  deleteWordBook as deleteWordBookFromStorage,
  getActiveBookSummary,
  getCustomWords,
  saveCustomWord,
  deleteCustomWord,
  type ActiveBookSummary,
  type ImportWordBookMeta,
  type UserProgress,
  type LearningPlan,
} from '@/data/localStorage';
import { wordsDatabase, type WordData, getWordOfTheDay, getPreviousWords } from '@/data/words';
import type { ImportResult, WordBook } from '@/data/wordBooks';

interface StudyStats {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  reviewWords: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  weeklyWords: number;
  weeklyXP: number;
}

interface UserDataContextType {
  // Daily words
  dailyWords: WordData[];
  refreshDailyWords: () => void;

  // Word books
  wordBooks: WordBook[];
  activeBook: WordBook | null;
  activeBookSummary: ActiveBookSummary;
  setActiveBook: (bookId: string) => void;
  importWordBook: (fileText: string, meta?: ImportWordBookMeta) => ImportResult;
  deleteWordBook: (bookId: string) => boolean;

  // Custom words
  customWords: WordData[];
  addCustomWord: (word: WordData) => void;
  removeCustomWord: (wordId: string) => void;

  // Word of the day
  wordOfTheDay: WordData;
  previousWords: { date: string; word: WordData }[];

  // Progress
  progress: UserProgress[];
  dueWords: UserProgress[];
  masteredWords: UserProgress[];
  markWordAsLearned: (wordId: string) => void;
  markWordAsMastered: (wordId: string) => void;
  reviewWord: (wordId: string, rating: 'again' | 'hard' | 'good' | 'easy') => void;

  // Stats
  xp: { total: number; today: number; level: number };
  streak: { current: number; longest: number; lastStudyDate: string | null };
  stats: StudyStats;
  refreshStats: () => void;

  // Learning plan
  learningPlan: LearningPlan | null;
  savePlan: (plan: Partial<LearningPlan>) => void;

  // Settings
  settings: any;
  updateSettings: (settings: any) => void;

  // Actions
  addStudySession: (wordsStudied: number, wordsLearned: number, xpEarned: number, duration: number) => void;
}

const EMPTY_IMPORT_RESULT: ImportResult = {
  totalRows: 0,
  successCount: 0,
  duplicateCount: 0,
  errorRows: [],
};

const EMPTY_BOOK_SUMMARY: ActiveBookSummary = {
  activeBookId: null,
  totalWords: 0,
  remainingWords: 0,
  dailyGoal: 10,
  isNearlyCompleted: false,
  isCompleted: false,
};

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const [dailyWords, setDailyWords] = useState<WordData[]>([]);
  const [wordBooks, setWordBooks] = useState<WordBook[]>([]);
  const [activeBook, setActiveBookState] = useState<WordBook | null>(null);
  const [activeBookSummary, setActiveBookSummary] = useState<ActiveBookSummary>(EMPTY_BOOK_SUMMARY);
  const [customWords, setCustomWords] = useState<WordData[]>([]);

  const [wordOfTheDay] = useState<WordData>(getWordOfTheDay());
  const [previousWords] = useState<{ date: string; word: WordData }[]>(getPreviousWords(7));
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [dueWords, setDueWords] = useState<UserProgress[]>([]);
  const [masteredWords, setMasteredWords] = useState<UserProgress[]>([]);
  const [xp, setXp] = useState({ total: 0, today: 0, level: 1 });
  const [streak, setStreak] = useState({ current: 0, longest: 0, lastStudyDate: null as string | null });
  const [stats, setStats] = useState<StudyStats>({
    totalWords: 0,
    masteredWords: 0,
    learningWords: 0,
    reviewWords: 0,
    totalXP: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyWords: 0,
    weeklyXP: 0,
  });
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [settings, setSettings] = useState<any>({});

  const loadData = useCallback(() => {
    if (!user) return;

    const books = getWordBooks(userId);
    setWordBooks(books);

    const currentActiveBook = getActiveBookFromStorage(userId);
    setActiveBookState(currentActiveBook);

    const userCustomWords = getCustomWords(userId);
    setCustomWords(userCustomWords);

    const daily = getDailyWordsFromStorage(userId, wordsDatabase);
    setDailyWords(daily);

    const summary = getActiveBookSummary(userId, wordsDatabase);
    setActiveBookSummary(summary);

    const userProgress = getProgress(userId);
    setProgress(userProgress);

    const due = getDueWords(userId);
    setDueWords(due);

    const mastered = getMasteredWords(userId);
    setMasteredWords(mastered);

    const userXP = getXP(userId);
    setXp(userXP);

    const userStreak = getStreak(userId);
    setStreak(userStreak);

    const studyStats = getStudyStats(userId);
    setStats(studyStats);

    const plan = getLearningPlan(userId);
    setLearningPlan(plan);

    const userSettings = getSettings(userId);
    setSettings(userSettings);
  }, [user, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshDailyWords = useCallback(() => {
    if (!user) return;

    const daily = getDailyWordsFromStorage(userId, wordsDatabase);
    setDailyWords(daily);

    const summary = getActiveBookSummary(userId, wordsDatabase);
    setActiveBookSummary(summary);
  }, [user, userId]);

  const setActiveBook = (bookId: string) => {
    if (!user) return;

    setActiveBookInStorage(userId, bookId);
    loadData();
  };

  const importWordBook = (fileText: string, meta: ImportWordBookMeta = {}): ImportResult => {
    if (!user) return EMPTY_IMPORT_RESULT;

    const result = importWordBookFromCsv(userId, fileText, meta);
    loadData();
    return result;
  };

  const deleteWordBook = (bookId: string): boolean => {
    if (!user) return false;

    const deleted = deleteWordBookFromStorage(userId, bookId);
    if (deleted) {
      loadData();
    }
    return deleted;
  };

  const addCustomWord = (word: WordData) => {
    if (!user) return;

    saveCustomWord(userId, word);
    loadData();
  };

  const removeCustomWord = (wordId: string) => {
    if (!user) return;

    deleteCustomWord(userId, wordId);
    loadData();
  };

  const markWordAsLearned = (wordId: string) => {
    if (!user) return;

    updateWordProgress(userId, wordId, {
      status: 'learning',
      lastReviewed: new Date().toISOString(),
    });

    addXP(userId, 5);
    updateStreak(userId);
    loadData();
  };

  const markWordAsMastered = (wordId: string) => {
    if (!user) return;

    updateWordProgress(userId, wordId, {
      status: 'mastered',
      lastReviewed: new Date().toISOString(),
    });

    addXP(userId, 10);
    updateStreak(userId);
    loadData();
  };

  const reviewWord = (wordId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!user) return;

    const wordProgress = progress.find((p) => p.wordId === wordId);
    const currentEase = wordProgress?.easeFactor || 2.5;
    const reviewCount = wordProgress?.reviewCount || 0;

    const { nextReview, newEase } = calculateNextReview(rating, currentEase, reviewCount);

    let newStatus: 'new' | 'learning' | 'review' | 'mastered' = 'learning';
    if (rating === 'again') newStatus = 'learning';
    else if (rating === 'easy' && reviewCount >= 3) newStatus = 'mastered';
    else newStatus = 'review';

    updateWordProgress(userId, wordId, {
      status: newStatus,
      reviewCount: reviewCount + 1,
      lastReviewed: new Date().toISOString(),
      nextReview,
      easeFactor: newEase,
    });

    const xpAmount = rating === 'again' ? 3 : rating === 'hard' ? 5 : rating === 'good' ? 7 : 10;
    addXP(userId, xpAmount);
    updateStreak(userId);
    loadData();
  };

  const refreshStats = () => {
    if (!user) return;

    const studyStats = getStudyStats(userId);
    setStats(studyStats);

    const userXP = getXP(userId);
    setXp(userXP);

    const userStreak = getStreak(userId);
    setStreak(userStreak);
  };

  const savePlan = (plan: Partial<LearningPlan>) => {
    if (!user) return;

    const saved = saveLearningPlan(userId, plan);
    setLearningPlan(saved);
  };

  const updateSettings = (newSettings: any) => {
    if (!user) return;

    saveSettings(userId, newSettings);
    setSettings({ ...settings, ...newSettings });
  };

  const addStudySession = (
    wordsStudied: number,
    wordsLearned: number,
    xpEarned: number,
    duration: number,
  ) => {
    if (!user) return;

    recordStudySession(userId, wordsStudied, wordsLearned, xpEarned, duration);
    loadData();
  };

  return (
    <UserDataContext.Provider
      value={{
        dailyWords,
        refreshDailyWords,
        wordBooks,
        activeBook,
        activeBookSummary,
        setActiveBook,
        importWordBook,
        deleteWordBook,
        customWords,
        addCustomWord,
        removeCustomWord,
        wordOfTheDay,
        previousWords,
        progress,
        dueWords,
        masteredWords,
        markWordAsLearned,
        markWordAsMastered,
        reviewWord,
        xp,
        streak,
        stats,
        refreshStats,
        learningPlan,
        savePlan,
        settings,
        updateSettings,
        addStudySession,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}

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
  importWordBookFromAnkiApkg,
  inspectAnkiApkg,
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
import type { AnkiDeckSummary, AnkiImportOptions, AnkiImportResult, ImportResult, WordBook } from '@/data/wordBooks';
import type { LearningMission, LearningProfile } from '@/types/examContent';
import {
  completeMissionTask as completeMissionTaskInService,
  getLearningProfile,
  getOrCreateDailyMission,
  saveLearningProfile,
} from '@/services/learningMissions';
import { completeMissionTaskEvent, recordLearningEvent } from '@/services/learningEvents';
import {
  reviewWord as reviewWordInSupabase,
  markWordAsLearned as markWordAsLearnedInSupabase,
  markWordAsMastered as markWordAsMasteredInSupabase,
} from '@/lib/supabase';
import { scheduleReview } from '@/services/fsrs';
import { ensureFSRS } from '@/services/fsrsMigration';

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
  inspectAnkiApkg: (file: File) => Promise<AnkiDeckSummary[]>;
  importAnkiApkg: (file: File, options: AnkiImportOptions) => Promise<AnkiImportResult>;
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

  // Learning profile & mission
  learningProfile: LearningProfile;
  updateLearningProfile: (updates: Partial<Omit<LearningProfile, 'userId' | 'updatedAt'>>) => void;
  dailyMission: LearningMission | null;
  refreshDailyMission: () => void;
  completeMissionTask: (taskId: string) => void;

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

const EMPTY_ANKI_IMPORT_RESULT: AnkiImportResult = {
  totalRows: 0,
  successCount: 0,
  duplicateCount: 0,
  errorRows: [],
  skippedCards: 0,
  mappedProgressCount: 0,
  unmappedRows: [],
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
  const [learningProfile, setLearningProfileState] = useState<LearningProfile>(() => getLearningProfile(userId));
  const [dailyMission, setDailyMission] = useState<LearningMission | null>(null);
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

    const profile = getLearningProfile(userId);
    setLearningProfileState(profile);

    void getOrCreateDailyMission({
      userId,
      goalWords: profile.dailyMinutes > 30 ? 20 : 10,
      dueCount: due.length,
    }).then((mission) => {
      setDailyMission(mission);
    });

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

  const inspectAnkiApkgDecks = async (file: File): Promise<AnkiDeckSummary[]> => {
    if (!user) return [];
    return inspectAnkiApkg(file);
  };

  const importAnkiApkg = async (
    file: File,
    options: AnkiImportOptions,
  ): Promise<AnkiImportResult> => {
    if (!user) return EMPTY_ANKI_IMPORT_RESULT;

    const result = await importWordBookFromAnkiApkg(userId, file, options);
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
    void recordLearningEvent({
      userId,
      eventName: 'today.word_marked',
      payload: { wordId, status: 'learned' },
    });
    // Sync to Supabase (fire-and-forget)
    void markWordAsLearnedInSupabase(userId, wordId);
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
    void recordLearningEvent({
      userId,
      eventName: 'today.word_marked',
      payload: { wordId, status: 'mastered' },
    });
    // Sync to Supabase (fire-and-forget)
    void markWordAsMasteredInSupabase(userId, wordId);
    loadData();
  };

  const reviewWord = (wordId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!user) return;

    const wordProgress = progress.find((p) => p.wordId === wordId);
    const reviewCount = wordProgress?.reviewCount || 0;

    // ── FSRS-5 scheduling ────────────────────────────────────────────────────
    // Lazily migrate old SM-2 records; new cards start from initCard() defaults.
    const currentFSRS = wordProgress
      ? ensureFSRS(wordProgress as Parameters<typeof ensureFSRS>[0])
      : { stability: 0, difficulty: 0, retrievability: 0, lapses: 0,
          state: 'new' as const, dueAt: new Date().toISOString(), lastReviewAt: null };

    const nextFSRS = scheduleReview(currentFSRS, rating);

    // Map FSRS state back to the legacy "status" field so the rest of the app
    // (ReviewPage, Analytics, etc.) continues to work unchanged.
    let newStatus: 'new' | 'learning' | 'review' | 'mastered' = 'review';
    if (nextFSRS.state === 'learning' || nextFSRS.state === 'relearning') {
      newStatus = 'learning';
    } else if (nextFSRS.lapses === 0 && nextFSRS.stability >= 21 && rating !== 'again') {
      // Promote to mastered once stable for 21+ days with no lapses
      newStatus = 'mastered';
    } else {
      newStatus = 'review';
    }

    updateWordProgress(userId, wordId, {
      status: newStatus,
      reviewCount: reviewCount + 1,
      lastReviewed: nextFSRS.lastReviewAt!,
      // nextReview uses date-only string (YYYY-MM-DD) for legacy compatibility
      nextReview: nextFSRS.dueAt.split('T')[0],
      easeFactor: wordProgress?.easeFactor ?? 2.5,
      // Store the full FSRS state as an extra field (transparently extended)
      fsrs: nextFSRS,
    } as Parameters<typeof updateWordProgress>[2]);

    const xpAmount = rating === 'again' ? 3 : rating === 'hard' ? 5 : rating === 'good' ? 7 : 10;
    addXP(userId, xpAmount);
    updateStreak(userId);
    void recordLearningEvent({
      userId,
      eventName: 'review.word_rated',
      payload: {
        wordId,
        rating,
        status: newStatus,
        stability: nextFSRS.stability,
        difficulty: nextFSRS.difficulty,
        scheduledDays: Math.round(
          (new Date(nextFSRS.dueAt).getTime() - Date.now()) / 86_400_000,
        ),
      },
    });
    // Sync to Supabase (fire-and-forget)
    void reviewWordInSupabase(userId, wordId, rating);
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
    void recordLearningEvent({
      userId,
      eventName: 'mission.task_completed',
      payload: {
        source: 'study_session',
        wordsStudied,
        wordsLearned,
        xpEarned,
        duration,
      },
    });
    loadData();
  };

  const updateLearningProfile = useCallback(
    (updates: Partial<Omit<LearningProfile, 'userId' | 'updatedAt'>>) => {
      if (!user) return;
      void saveLearningProfile(userId, updates).then((profile) => {
        setLearningProfileState(profile);
        void getOrCreateDailyMission({
          userId,
          goalWords: profile.dailyMinutes > 30 ? 20 : 10,
          dueCount: dueWords.length,
        }).then((mission) => setDailyMission(mission));
      });
    },
    [dueWords.length, user, userId],
  );

  const refreshDailyMission = useCallback(() => {
    if (!user) return;
    void getOrCreateDailyMission({
      userId,
      goalWords: learningProfile.dailyMinutes > 30 ? 20 : 10,
      dueCount: dueWords.length,
    }).then((mission) => setDailyMission(mission));
  }, [dueWords.length, learningProfile.dailyMinutes, user, userId]);

  const completeMissionTask = useCallback(
    (taskId: string) => {
      if (!user || !dailyMission) return;
      void completeMissionTaskInService({
        userId,
        missionId: dailyMission.id,
        taskId,
      }).then((updated) => {
        if (!updated) return;
        setDailyMission(updated);
        void completeMissionTaskEvent({
          userId,
          missionId: updated.id,
          taskId,
          taskType: updated.tasks.find((task) => task.id === taskId)?.type || 'unknown',
        });
      });
    },
    [dailyMission, user, userId],
  );

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
        inspectAnkiApkg: inspectAnkiApkgDecks,
        importAnkiApkg,
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
        learningProfile,
        updateLearningProfile,
        dailyMission,
        refreshDailyMission,
        completeMissionTask,
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

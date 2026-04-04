import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getDailyWords as getDailyWordsFromStorage,
  getProgress,
  getDueWords,
  getMasteredWords,
  updateWordProgress,
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
import { buildWordProgressSyncPayload } from '@/lib/wordProgressSync';
import {
  addReviewLog,
  pruneReviewLogs,
  setWordProgress as setWordProgressInDb,
} from '@/lib/localDb';
import { initCard, scheduleReview } from '@/services/fsrs';
import { ensureFSRS } from '@/services/fsrsMigration';
import { computeLearnerModel } from '@/services/learnerModel';
import { buildIdempotencyKey, syncQueue } from '@/services/syncQueue';
import type { FSRSState, UserSettings } from '@/types/core';
import {
  checkAchievements,
  incrementWordCount,
  incrementReviewCount,
  getDailyMultiplier,
  getGamificationStats,
  getStreakFreezes,
  purchaseStreakFreeze as purchaseStreakFreezeService,
  STREAK_FREEZE_COST,
  type Achievement,
  type AchievementDef,
  ACHIEVEMENT_DEFS,
} from '@/services/gamification';

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
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;

  // Actions
  addStudySession: (wordsStudied: number, wordsLearned: number, xpEarned: number, duration: number) => void;

  // Gamification
  streakFreezes: number;
  achievements: Achievement[];
  allAchievementDefs: AchievementDef[];
  dailyMultiplier: number;
  purchaseStreakFreeze: () => { success: boolean; cost: number };
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
  const [settings, setSettings] = useState<UserSettings>(() => getSettings(userId));
  const [streakFreezesCount, setStreakFreezesCount] = useState(() => getStreakFreezes(userId));
  const [achievements, setAchievements] = useState<Achievement[]>(() => getGamificationStats(userId).achievements);
  const currentStreak = streak.current;
  const dailyMultiplier = getDailyMultiplier(currentStreak);

  const persistProgressSnapshot = useCallback(
    async (wordId: string, snapshot: UserProgress & { fsrs?: FSRSState }) => {
      const fsrs = ensureFSRS(snapshot);
      await setWordProgressInDb({
        user_id: userId,
        word_id: wordId,
        status: snapshot.status,
        srs: fsrs,
        correct_count: snapshot.correctCount ?? 0,
        incorrect_count: snapshot.incorrectCount ?? 0,
        first_seen_at: snapshot.firstSeenAt ?? snapshot.lastReviewed ?? new Date().toISOString(),
        mastered_at: snapshot.masteredAt ?? null,
        updated_at: snapshot.updatedAt ?? new Date().toISOString(),
      });
    },
    [userId],
  );

  const enqueueProgressSync = useCallback(
    (wordId: string, snapshot: UserProgress & { fsrs?: FSRSState }) => {
      const payload = buildWordProgressSyncPayload({
        userId,
        wordId,
        status: snapshot.status,
        reviewCount: snapshot.reviewCount,
        correctCount: snapshot.correctCount ?? 0,
        incorrectCount: snapshot.incorrectCount ?? 0,
        easeFactor: snapshot.easeFactor,
        nextReviewAt: snapshot.nextReview,
        lastReviewedAt: snapshot.lastReviewed,
        firstLearnedAt: snapshot.firstSeenAt ?? snapshot.lastReviewed,
        masteredAt: snapshot.masteredAt ?? null,
        fsrs: ensureFSRS(snapshot),
      });

      return syncQueue.enqueue({
        table: 'user_word_progress',
        operation: 'upsert',
        payload,
        idempotency_key: buildIdempotencyKey('user_word_progress', {
          user_id: userId,
          word_ref: wordId,
        }),
      });
    },
    [userId],
  );

  const backfillIndexedProgress = useCallback(
    (userProgress: UserProgress[]) => {
      if (userProgress.length === 0) return;
      void Promise.all(
        userProgress.map((item) =>
          persistProgressSnapshot(item.wordId, item as UserProgress & { fsrs?: FSRSState }),
        ),
      );
      void pruneReviewLogs();
    },
    [persistProgressSnapshot],
  );

  const checkAndNotifyAchievements = useCallback(() => {
    const gamStats = getGamificationStats(userId);
    const userXP = getXP(userId);
    const userStreak = getStreak(userId);
    const mastered = getMasteredWords(userId);

    const newlyUnlocked = checkAchievements(userId, {
      totalWordsLearned: gamStats.totalWordsLearned,
      totalReviews: gamStats.totalReviews,
      currentStreak: userStreak.current,
      longestStreak: userStreak.longest,
      masteredWords: mastered.length,
      totalXP: userXP.total,
      level: userXP.level,
    });

    if (newlyUnlocked.length > 0) {
      setAchievements(getGamificationStats(userId).achievements);
    }

    return newlyUnlocked;
  }, [userId]);

  const handlePurchaseStreakFreeze = useCallback(() => {
    const userXP = getXP(userId);
    const result = purchaseStreakFreezeService(userId, userXP.total);
    if (result.success) {
      addXP(userId, -STREAK_FREEZE_COST);
      setStreakFreezesCount(result.remaining);
    }
    return { success: result.success, cost: result.cost };
  }, [userId]);

  const buildDailyLearnerModel = useCallback(
    (userProgress: UserProgress[], streakDays: number, dailyGoal: number) => {
      if (userProgress.length === 0) return null;
      return computeLearnerModel(userId, userProgress, streakDays, dailyGoal);
    },
    [userId],
  );

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
    backfillIndexedProgress(userProgress);

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

    const learnerModel = buildDailyLearnerModel(userProgress, userStreak.current, summary.dailyGoal);

    void getOrCreateDailyMission({
      userId,
      goalWords: summary.dailyGoal,
      dueCount: due.length,
      learnerModel,
    }).then((mission) => {
      setDailyMission(mission);
    });

    const userSettings = getSettings(userId);
    setSettings(userSettings);
  }, [backfillIndexedProgress, buildDailyLearnerModel, user, userId]);

  useEffect(() => {
    const run = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => window.clearTimeout(run);
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

    const now = new Date().toISOString();
    const existing = progress.find((item) => item.wordId === wordId);
    const existingFsrs = existing
      ? ensureFSRS(existing as UserProgress & { fsrs?: FSRSState })
      : initCard();
    const nextFsrs: FSRSState = {
      ...existingFsrs,
      state: existingFsrs.state === 'new' ? 'learning' : existingFsrs.state,
      dueAt: now,
    };

    const nextProgress = updateWordProgress(userId, wordId, {
      status: 'learning',
      lastReviewed: now,
      nextReview: nextFsrs.dueAt.split('T')[0],
      correctCount: existing?.correctCount ?? 0,
      incorrectCount: existing?.incorrectCount ?? 0,
      firstSeenAt: existing?.firstSeenAt ?? now,
      masteredAt: null,
      updatedAt: now,
      fsrs: nextFsrs,
    });

    addXP(userId, Math.round(5 * dailyMultiplier));
    updateStreak(userId);
    incrementWordCount(userId);
    void recordLearningEvent({
      userId,
      eventName: 'today.word_marked',
      payload: { wordId, status: 'learned' },
    });
    void persistProgressSnapshot(wordId, nextProgress as UserProgress & { fsrs?: FSRSState });
    void enqueueProgressSync(wordId, nextProgress as UserProgress & { fsrs?: FSRSState });
    checkAndNotifyAchievements();
    loadData();
  };

  const markWordAsMastered = (wordId: string) => {
    if (!user) return;

    const now = new Date().toISOString();
    const existing = progress.find((item) => item.wordId === wordId);
    const existingFsrs = existing
      ? ensureFSRS(existing as UserProgress & { fsrs?: FSRSState })
      : initCard();
    const masteredDueAt = new Date(Date.now() + 30 * 86_400_000).toISOString();
    const nextFsrs: FSRSState = {
      ...existingFsrs,
      stability: Math.max(existingFsrs.stability, 21),
      retrievability: 1,
      state: 'review',
      dueAt: masteredDueAt,
      lastReviewAt: now,
    };

    const nextProgress = updateWordProgress(userId, wordId, {
      status: 'mastered',
      lastReviewed: now,
      nextReview: nextFsrs.dueAt.split('T')[0],
      correctCount: existing?.correctCount ?? 0,
      incorrectCount: existing?.incorrectCount ?? 0,
      firstSeenAt: existing?.firstSeenAt ?? now,
      masteredAt: now,
      updatedAt: now,
      fsrs: nextFsrs,
    });

    addXP(userId, 10);
    updateStreak(userId);
    void recordLearningEvent({
      userId,
      eventName: 'today.word_marked',
      payload: { wordId, status: 'mastered' },
    });
    void persistProgressSnapshot(wordId, nextProgress as UserProgress & { fsrs?: FSRSState });
    void enqueueProgressSync(wordId, nextProgress as UserProgress & { fsrs?: FSRSState });
    loadData();
  };

  const reviewWord = (wordId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!user) return;

    const wordProgress = progress.find((p) => p.wordId === wordId);
    const reviewCount = wordProgress?.reviewCount || 0;
    const correctCount = wordProgress?.correctCount ?? 0;
    const incorrectCount = wordProgress?.incorrectCount ?? 0;
    const now = new Date().toISOString();

    // ── FSRS-5 scheduling ────────────────────────────────────────────────────
    // Lazily migrate old SM-2 records; new cards start from initCard() defaults.
    const currentFSRS = wordProgress
      ? ensureFSRS(wordProgress as Parameters<typeof ensureFSRS>[0])
      : initCard();

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

    const nextCorrectCount = rating === 'again' ? correctCount : correctCount + 1;
    const nextIncorrectCount = rating === 'again' ? incorrectCount + 1 : incorrectCount;
    const scheduledDays = Math.max(
      0,
      Math.round(
        (new Date(nextFSRS.dueAt).getTime() - new Date(nextFSRS.lastReviewAt || now).getTime()) /
          86_400_000,
      ),
    );
    const nextProgress = updateWordProgress(userId, wordId, {
      status: newStatus,
      reviewCount: reviewCount + 1,
      lastReviewed: nextFSRS.lastReviewAt!,
      // nextReview uses date-only string (YYYY-MM-DD) for legacy compatibility
      nextReview: nextFSRS.dueAt.split('T')[0],
      easeFactor: wordProgress?.easeFactor ?? 2.5,
      correctCount: nextCorrectCount,
      incorrectCount: nextIncorrectCount,
      firstSeenAt: wordProgress?.firstSeenAt ?? wordProgress?.lastReviewed ?? now,
      masteredAt: newStatus === 'mastered' ? now : wordProgress?.masteredAt ?? null,
      updatedAt: now,
      // Store the full FSRS state as an extra field (transparently extended)
      fsrs: nextFSRS,
    } as Parameters<typeof updateWordProgress>[2]);

    const xpAmount = rating === 'again' ? 3 : rating === 'hard' ? 5 : rating === 'good' ? 7 : 10;
    addXP(userId, Math.round(xpAmount * dailyMultiplier));
    updateStreak(userId);
    incrementReviewCount(userId);
    void recordLearningEvent({
      userId,
      eventName: 'review.word_rated',
      payload: {
        wordId,
        rating,
        status: newStatus,
        stability: nextFSRS.stability,
        difficulty: nextFSRS.difficulty,
        scheduledDays,
      },
    });
    const reviewEventId = crypto.randomUUID();
    void addReviewLog({
      event_id: reviewEventId,
      user_id: userId,
      word_id: wordId,
      rated_at: nextFSRS.lastReviewAt || now,
      rating,
      pre_stability: currentFSRS.stability,
      post_stability: nextFSRS.stability,
      pre_difficulty: currentFSRS.difficulty,
      post_difficulty: nextFSRS.difficulty,
      scheduled_days: scheduledDays,
    });
    void pruneReviewLogs();
    void syncQueue.enqueue({
      table: 'review_logs',
      operation: 'upsert',
      payload: {
        id: reviewEventId,
        user_id: userId,
        word_ref: wordId,
        word_id: null,
        rated_at: nextFSRS.lastReviewAt || now,
        rating,
        duration_ms: null,
        pre_stability: currentFSRS.stability,
        post_stability: nextFSRS.stability,
        pre_difficulty: currentFSRS.difficulty,
        post_difficulty: nextFSRS.difficulty,
        scheduled_days: scheduledDays,
        session_id: null,
        created_at: nextFSRS.lastReviewAt || now,
      },
      idempotency_key: buildIdempotencyKey('review_logs', { id: reviewEventId }),
    });
    void persistProgressSnapshot(wordId, nextProgress as UserProgress & { fsrs?: FSRSState });
    void enqueueProgressSync(wordId, nextProgress as UserProgress & { fsrs?: FSRSState });
    checkAndNotifyAchievements();
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

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    if (!user) return;

    const saved = saveSettings(userId, newSettings);
    setSettings(saved);
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
        const learnerModel = buildDailyLearnerModel(progress, currentStreak, activeBookSummary.dailyGoal);
        void getOrCreateDailyMission({
          userId,
          goalWords: activeBookSummary.dailyGoal,
          dueCount: dueWords.length,
          learnerModel,
        }).then((mission) => setDailyMission(mission));
      });
    },
    [activeBookSummary.dailyGoal, buildDailyLearnerModel, currentStreak, dueWords.length, progress, user, userId],
  );

  const refreshDailyMission = useCallback(() => {
    if (!user) return;
    const learnerModel = buildDailyLearnerModel(progress, currentStreak, activeBookSummary.dailyGoal);
    void getOrCreateDailyMission({
      userId,
      goalWords: activeBookSummary.dailyGoal,
      dueCount: dueWords.length,
      learnerModel,
    }).then((mission) => setDailyMission(mission));
  }, [activeBookSummary.dailyGoal, buildDailyLearnerModel, currentStreak, dueWords.length, progress, user, userId]);

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
        streakFreezes: streakFreezesCount,
        achievements,
        allAchievementDefs: ACHIEVEMENT_DEFS,
        dailyMultiplier,
        purchaseStreakFreeze: handlePurchaseStreakFreeze,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}

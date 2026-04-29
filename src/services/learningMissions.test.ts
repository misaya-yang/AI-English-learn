import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { LearnerModel } from '@/services/learnerModel';
import type { LearningMission } from '@/types/examContent';
import { buildLocalAuthUserId } from '@/lib/localAuthIdentity';

// ---------------------------------------------------------------------------
// Mocks — must be declared before importing the module under test
// ---------------------------------------------------------------------------

const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null });
const updateMock = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
});

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: upsertMock,
      update: updateMock,
    })),
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Import module under test AFTER mocks are set up
// ---------------------------------------------------------------------------

import {
  getLearningProfile,
  saveLearningProfile,
  getOrCreateDailyMission,
  completeMissionTask,
} from './learningMissions';

// ---------------------------------------------------------------------------
// localStorage stub
// ---------------------------------------------------------------------------

const createStorageMock = (): Storage => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_USER = 'user-aaaa-bbbb-cccc-dddddddddddd';
const LOCAL_USER = buildLocalAuthUserId('demo@example.com');

const baseLearnerModel = (overrides: Partial<LearnerModel> = {}): LearnerModel => ({
  userId: TEST_USER,
  computedAt: new Date().toISOString(),
  mode: 'steady',
  avgRetrievability: 0.85,
  predictedRetention30d: 0.7,
  weakTopics: [],
  strongTopics: [],
  recommendedDailyNew: 10,
  recommendedDailyReview: 8,
  burnoutRisk: 0.1,
  dueCount: 5,
  avgStability: 12,
  stubbornWordCount: 0,
  stubbornTopics: [],
  ...overrides,
});

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('learningMissions', () => {
  let storageMock: Storage;

  beforeEach(() => {
    storageMock = createStorageMock();
    vi.stubGlobal('localStorage', storageMock);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-04T09:00:00Z'));
    upsertMock.mockClear();
    updateMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // =========================================================================
  // getLearningProfile
  // =========================================================================

  describe('getLearningProfile', () => {
    it('returns a default profile for a new user', () => {
      const profile = getLearningProfile(TEST_USER);

      expect(profile.userId).toBe(TEST_USER);
      expect(profile.level).toBe('B1');
      expect(profile.target).toBe('general_improvement');
      expect(profile.tracks).toEqual(['daily_communication', 'workplace_english']);
      expect(profile.dailyMinutes).toBe(20);
      expect(profile.languagePreference).toBe('bilingual');
      expect(profile.updatedAt).toBeTruthy();
    });

    it('persists the default profile to localStorage on first access', () => {
      getLearningProfile(TEST_USER);

      expect(storageMock.setItem).toHaveBeenCalled();
      const raw = storageMock.getItem('vocabdaily_user_learning_profiles');
      expect(raw).toBeTruthy();
      const map = JSON.parse(raw!);
      expect(map[TEST_USER]).toBeDefined();
    });

    it('returns the existing profile on subsequent calls', () => {
      const first = getLearningProfile(TEST_USER);
      const second = getLearningProfile(TEST_USER);

      expect(first).toEqual(second);
    });

    it('keeps profiles separate per user', () => {
      const p1 = getLearningProfile('user-1111');
      const p2 = getLearningProfile('user-2222');

      expect(p1.userId).toBe('user-1111');
      expect(p2.userId).toBe('user-2222');
    });
  });

  // =========================================================================
  // saveLearningProfile
  // =========================================================================

  describe('saveLearningProfile', () => {
    it('merges partial updates into the existing profile', async () => {
      getLearningProfile(TEST_USER);
      const updated = await saveLearningProfile(TEST_USER, { level: 'C1', dailyMinutes: 30 });

      expect(updated.level).toBe('C1');
      expect(updated.dailyMinutes).toBe(30);
      // unchanged fields should be preserved
      expect(updated.target).toBe('general_improvement');
      expect(updated.userId).toBe(TEST_USER);
    });

    it('syncs to supabase', async () => {
      getLearningProfile(TEST_USER);
      await saveLearningProfile(TEST_USER, { level: 'B2' });

      expect(upsertMock).toHaveBeenCalledTimes(1);
      const payload = upsertMock.mock.calls[0][0];
      expect(payload.user_id).toBe(TEST_USER);
      expect(payload.level).toBe('B2');
    });

    it('keeps local fallback profiles local-only', async () => {
      await saveLearningProfile(LOCAL_USER, { level: 'A2' });

      expect(upsertMock).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // getOrCreateDailyMission — creation
  // =========================================================================

  describe('getOrCreateDailyMission', () => {
    it('creates a new mission for today when none exists', async () => {
      const mission = await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 10,
        dueCount: 5,
      });

      expect(mission.userId).toBe(TEST_USER);
      expect(mission.date).toBe('2026-04-04');
      expect(mission.status).toBe('pending');
      expect(mission.tasks).toHaveLength(3);
      expect(mission.tasks.map((t) => t.type)).toEqual(['vocabulary', 'quiz', 'review']);
      expect(mission.tasks.every((t) => t.done === false)).toBe(true);
    });

    it('generates a deterministic mission id', async () => {
      const mission = await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 10,
        dueCount: 5,
      });

      expect(mission.id).toBe(`mission_2026-04-04_${TEST_USER.slice(0, 8)}`);
    });

    it('returns the same mission on a second call with same inputs', async () => {
      const first = await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 10,
        dueCount: 5,
      });
      const second = await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 10,
        dueCount: 5,
      });

      expect(first.id).toBe(second.id);
      expect(first.tasks).toEqual(second.tasks);
    });

    it('syncs new mission to supabase', async () => {
      await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 10,
        dueCount: 5,
      });

      expect(upsertMock).toHaveBeenCalledTimes(1);
      const payload = upsertMock.mock.calls[0][0];
      expect(payload.user_id).toBe(TEST_USER);
      expect(payload.mission_date).toBe('2026-04-04');
    });

    it('keeps local fallback missions local-only', async () => {
      await getOrCreateDailyMission({
        userId: LOCAL_USER,
        goalWords: 10,
        dueCount: 5,
      });

      expect(upsertMock).not.toHaveBeenCalled();
    });

    it('limits stored missions to 90 entries', async () => {
      // Pre-populate with 90 old missions
      const oldMissions: LearningMission[] = Array.from({ length: 90 }, (_, i) => ({
        id: `old_mission_${i}`,
        userId: TEST_USER,
        date: `2025-01-${String(i + 1).padStart(2, '0')}`,
        status: 'completed' as const,
        estimatedMinutes: 20,
        tasks: [],
        updatedAt: '2025-01-01T00:00:00Z',
      }));

      storageMock.setItem(
        'vocabdaily_learning_missions',
        JSON.stringify({ [TEST_USER]: oldMissions }),
      );

      await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 10,
        dueCount: 5,
      });

      const raw = storageMock.getItem('vocabdaily_learning_missions');
      const map = JSON.parse(raw!);
      // new mission prepended, then sliced to 90
      expect(map[TEST_USER].length).toBe(90);
      expect(map[TEST_USER][0].date).toBe('2026-04-04');
    });

    // -----------------------------------------------------------------------
    // Refresh logic
    // -----------------------------------------------------------------------

    it('refreshes a pending mission when tasks differ', async () => {
      const first = await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 5,
        dueCount: 0,
      });
      expect(first.status).toBe('pending');

      // Call again with a different learner model that changes outputs
      const refreshed = await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 5,
        dueCount: 0,
        learnerModel: baseLearnerModel({ mode: 'recovery', recommendedDailyNew: 3 }),
      });

      // Should keep the same id but update tasks
      expect(refreshed.id).toBe(first.id);
      const vocabTask = refreshed.tasks.find((t) => t.type === 'vocabulary')!;
      expect(vocabTask.meta?.mode).toBe('recovery');
    });

    it('does NOT refresh a mission that is already in_progress', async () => {
      // Create initial mission
      await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 10,
        dueCount: 5,
      });

      // Manually mark one task done to move status to in_progress
      const missionMap = JSON.parse(storageMock.getItem('vocabdaily_learning_missions')!);
      const mission = missionMap[TEST_USER][0];
      mission.status = 'in_progress';
      mission.tasks[0].done = true;
      storageMock.setItem('vocabdaily_learning_missions', JSON.stringify(missionMap));

      // Try to refresh with different params
      const result = await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 100,
        dueCount: 100,
        learnerModel: baseLearnerModel({ mode: 'recovery' }),
      });

      // Tasks should remain unchanged
      expect(result.status).toBe('in_progress');
      expect(result.tasks[0].done).toBe(true);
      expect(result.tasks[0].meta?.mode).not.toBe('recovery');
    });

    it('does NOT refresh when a task is already marked done', async () => {
      await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 10,
        dueCount: 5,
      });

      // Mark a task done but keep status as pending
      const missionMap = JSON.parse(storageMock.getItem('vocabdaily_learning_missions')!);
      missionMap[TEST_USER][0].tasks[0].done = true;
      storageMock.setItem('vocabdaily_learning_missions', JSON.stringify(missionMap));

      const result = await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 100,
        dueCount: 100,
        learnerModel: baseLearnerModel({ mode: 'sprint' }),
      });

      // Should not refresh — the task was already started
      expect(result.tasks[0].done).toBe(true);
    });
  });

  // =========================================================================
  // Task targets by learner mode (tests buildMissionTasks indirectly)
  // =========================================================================

  describe('task targets by learner mode', () => {
    const getMissionForMode = async (
      mode: LearnerModel['mode'],
      extra: Partial<LearnerModel> = {},
    ) =>
      getOrCreateDailyMission({
        userId: `user-mode-${mode}`,
        goalWords: 10,
        dueCount: 10,
        learnerModel: baseLearnerModel({ mode, ...extra }),
      });

    it('recovery mode: fewer new words, more reviews, consolidation quiz', async () => {
      const mission = await getMissionForMode('recovery');
      const vocab = mission.tasks.find((t) => t.type === 'vocabulary')!;
      const review = mission.tasks.find((t) => t.type === 'review')!;
      const quiz = mission.tasks.find((t) => t.type === 'quiz')!;

      expect(vocab.meta?.target).toBeGreaterThanOrEqual(3);
      expect(vocab.meta?.target).toBeLessThanOrEqual(6);
      expect(review.meta?.target).toBeGreaterThanOrEqual(8);
      expect(quiz.title).toContain('consolidation');
      expect(quiz.meta?.focus).toBe('consolidation');
    });

    it('maintenance mode: moderate new words', async () => {
      const mission = await getMissionForMode('maintenance');
      const vocab = mission.tasks.find((t) => t.type === 'vocabulary')!;
      const review = mission.tasks.find((t) => t.type === 'review')!;

      expect(vocab.meta?.target).toBeGreaterThanOrEqual(4);
      expect(vocab.meta?.target).toBeLessThanOrEqual(10);
      expect(review.meta?.target).toBeGreaterThanOrEqual(6);
    });

    it('steady mode: balanced defaults', async () => {
      const mission = await getMissionForMode('steady');
      const vocab = mission.tasks.find((t) => t.type === 'vocabulary')!;

      expect(vocab.meta?.target).toBeGreaterThanOrEqual(5);
      expect(vocab.meta?.target).toBeLessThanOrEqual(20);
      expect(vocab.meta?.mode).toBe('steady');
    });

    it('stretch mode: higher new word ceiling', async () => {
      const mission = await getMissionForMode('stretch');
      const vocab = mission.tasks.find((t) => t.type === 'vocabulary')!;

      expect(vocab.meta?.target).toBeGreaterThanOrEqual(8);
      expect(vocab.meta?.target).toBeLessThanOrEqual(24);
    });

    it('sprint mode: exam-oriented quiz', async () => {
      const mission = await getMissionForMode('sprint');
      const vocab = mission.tasks.find((t) => t.type === 'vocabulary')!;
      const quiz = mission.tasks.find((t) => t.type === 'quiz')!;

      expect(vocab.meta?.target).toBeGreaterThanOrEqual(6);
      expect(vocab.meta?.target).toBeLessThanOrEqual(18);
      expect(quiz.title).toContain('IELTS');
      expect(quiz.meta?.focus).toBe('ielts_boost');
    });

    it('recovery gives fewer new words than stretch', async () => {
      const recovery = await getMissionForMode('recovery');
      const stretch = await getMissionForMode('stretch');

      const recoveryVocab = recovery.tasks.find((t) => t.type === 'vocabulary')!;
      const stretchVocab = stretch.tasks.find((t) => t.type === 'vocabulary')!;

      expect((recoveryVocab.meta?.target as number)).toBeLessThanOrEqual(
        stretchVocab.meta?.target as number,
      );
    });

    it('recovery demands more reviews than stretch', async () => {
      const recovery = await getMissionForMode('recovery', {
        recommendedDailyReview: 10,
      });
      const stretch = await getMissionForMode('stretch', {
        recommendedDailyReview: 4,
      });

      const recoveryReview = recovery.tasks.find((t) => t.type === 'review')!;
      const stretchReview = stretch.tasks.find((t) => t.type === 'review')!;

      expect((recoveryReview.meta?.target as number)).toBeGreaterThanOrEqual(
        stretchReview.meta?.target as number,
      );
    });

    it('stubborn words increase review target', async () => {
      const withStubborn = await getOrCreateDailyMission({
        userId: 'user-stubborn-yes',
        goalWords: 10,
        dueCount: 5,
        learnerModel: baseLearnerModel({ stubbornWordCount: 10 }),
      });
      const withoutStubborn = await getOrCreateDailyMission({
        userId: 'user-stubborn-no',
        goalWords: 10,
        dueCount: 5,
        learnerModel: baseLearnerModel({ stubbornWordCount: 0 }),
      });

      const reviewWith = withStubborn.tasks.find((t) => t.type === 'review')!;
      const reviewWithout = withoutStubborn.tasks.find((t) => t.type === 'review')!;

      expect((reviewWith.meta?.target as number)).toBeGreaterThan(
        reviewWithout.meta?.target as number,
      );
    });

    it('stubborn words trigger reinforcement quiz (non-exam target)', async () => {
      const mission = await getOrCreateDailyMission({
        userId: 'user-reinforcement',
        goalWords: 10,
        dueCount: 5,
        learnerModel: baseLearnerModel({ mode: 'steady', stubbornWordCount: 5 }),
      });

      const quiz = mission.tasks.find((t) => t.type === 'quiz')!;
      expect(quiz.meta?.focus).toBe('reinforcement');
      expect(quiz.title).toContain('stubborn');
    });

    it('weak topic drives quiz focus when no stubborn words', async () => {
      const mission = await getOrCreateDailyMission({
        userId: 'user-weaktopic',
        goalWords: 10,
        dueCount: 5,
        learnerModel: baseLearnerModel({ weakTopics: ['phrasal_verbs'], stubbornWordCount: 0 }),
      });

      const quiz = mission.tasks.find((t) => t.type === 'quiz')!;
      expect(quiz.meta?.focus).toBe('phrasal_verbs');
      expect(quiz.title).toContain('weak-spot');
    });

    it('falls back to general quiz when no weak topics and no stubborn words', async () => {
      const mission = await getOrCreateDailyMission({
        userId: 'user-general-quiz',
        goalWords: 10,
        dueCount: 5,
        learnerModel: baseLearnerModel({
          mode: 'steady',
          weakTopics: [],
          stubbornWordCount: 0,
        }),
      });

      const quiz = mission.tasks.find((t) => t.type === 'quiz')!;
      expect(quiz.meta?.focus).toBe('general');
    });

    it('exam target profile triggers IELTS quiz in steady mode', async () => {
      // Set up a profile with an IELTS target
      getLearningProfile('user-ielts');
      await saveLearningProfile('user-ielts', { target: 'IELTS 7.0' });

      const mission = await getOrCreateDailyMission({
        userId: 'user-ielts',
        goalWords: 10,
        dueCount: 5,
        learnerModel: baseLearnerModel({ mode: 'steady', stubbornWordCount: 0 }),
      });

      const quiz = mission.tasks.find((t) => t.type === 'quiz')!;
      expect(quiz.meta?.focus).toBe('ielts_boost');
    });
  });

  // =========================================================================
  // estimatedMinutes
  // =========================================================================

  describe('estimated minutes', () => {
    it('uses profile dailyMinutes as base when no learner model', async () => {
      const mission = await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 10,
        dueCount: 5,
      });

      // Default profile has dailyMinutes = 20
      expect(mission.estimatedMinutes).toBe(20);
    });

    it('recovery mode reduces estimated time', async () => {
      const mission = await getOrCreateDailyMission({
        userId: 'user-est-recovery',
        goalWords: 10,
        dueCount: 5,
        learnerModel: baseLearnerModel({ mode: 'recovery' }),
      });

      // 20 * 0.9 = 18
      expect(mission.estimatedMinutes).toBe(18);
    });

    it('stretch mode increases estimated time', async () => {
      const mission = await getOrCreateDailyMission({
        userId: 'user-est-stretch',
        goalWords: 10,
        dueCount: 5,
        learnerModel: baseLearnerModel({ mode: 'stretch' }),
      });

      // 20 * 1.15 = 23
      expect(mission.estimatedMinutes).toBe(23);
    });

    it('clamps estimated minutes between 12 and 45', async () => {
      // Very low base
      getLearningProfile('user-low-mins');
      await saveLearningProfile('user-low-mins', { dailyMinutes: 5 });
      const low = await getOrCreateDailyMission({
        userId: 'user-low-mins',
        goalWords: 10,
        dueCount: 5,
        learnerModel: baseLearnerModel({ mode: 'recovery' }),
      });
      expect(low.estimatedMinutes).toBeGreaterThanOrEqual(12);

      // Very high base
      getLearningProfile('user-high-mins');
      await saveLearningProfile('user-high-mins', { dailyMinutes: 60 });
      const high = await getOrCreateDailyMission({
        userId: 'user-high-mins',
        goalWords: 10,
        dueCount: 5,
        learnerModel: baseLearnerModel({ mode: 'sprint' }),
      });
      expect(high.estimatedMinutes).toBeLessThanOrEqual(45);
    });
  });

  // =========================================================================
  // completeMissionTask
  // =========================================================================

  describe('completeMissionTask', () => {
    let missionId: string;

    beforeEach(async () => {
      const mission = await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 10,
        dueCount: 5,
      });
      missionId = mission.id;
    });

    it('returns null for unknown mission', async () => {
      const result = await completeMissionTask({
        userId: TEST_USER,
        missionId: 'nonexistent',
        taskId: 'task_vocab_today',
      });

      expect(result).toBeNull();
    });

    it('marks a single task as done', async () => {
      const result = await completeMissionTask({
        userId: TEST_USER,
        missionId,
        taskId: 'task_vocab_today',
      });

      expect(result).not.toBeNull();
      const vocabTask = result!.tasks.find((t) => t.id === 'task_vocab_today')!;
      expect(vocabTask.done).toBe(true);
    });

    it('transitions status from pending to in_progress on first completion', async () => {
      const result = await completeMissionTask({
        userId: TEST_USER,
        missionId,
        taskId: 'task_vocab_today',
      });

      expect(result!.status).toBe('in_progress');
    });

    it('stays in_progress while not all tasks are done', async () => {
      await completeMissionTask({
        userId: TEST_USER,
        missionId,
        taskId: 'task_vocab_today',
      });

      const result = await completeMissionTask({
        userId: TEST_USER,
        missionId,
        taskId: 'task_quiz_today',
      });

      expect(result!.status).toBe('in_progress');
      // One task remains undone
      expect(result!.tasks.filter((t) => !t.done)).toHaveLength(1);
    });

    it('transitions to completed when all tasks are done', async () => {
      await completeMissionTask({
        userId: TEST_USER,
        missionId,
        taskId: 'task_vocab_today',
      });
      await completeMissionTask({
        userId: TEST_USER,
        missionId,
        taskId: 'task_quiz_today',
      });
      const result = await completeMissionTask({
        userId: TEST_USER,
        missionId,
        taskId: 'task_review_today',
      });

      expect(result!.status).toBe('completed');
      expect(result!.tasks.every((t) => t.done)).toBe(true);
    });

    it('persists updated mission to localStorage', async () => {
      await completeMissionTask({
        userId: TEST_USER,
        missionId,
        taskId: 'task_vocab_today',
      });

      const raw = storageMock.getItem('vocabdaily_learning_missions');
      const map = JSON.parse(raw!);
      const stored = map[TEST_USER].find((m: LearningMission) => m.id === missionId);
      expect(stored.tasks.find((t: { id: string }) => t.id === 'task_vocab_today').done).toBe(
        true,
      );
    });

    it('syncs completion to supabase', async () => {
      await completeMissionTask({
        userId: TEST_USER,
        missionId,
        taskId: 'task_vocab_today',
      });

      expect(updateMock).toHaveBeenCalledTimes(1);
      const payload = updateMock.mock.calls[0][0];
      expect(payload.status).toBe('in_progress');
      expect(payload.tasks).toBeDefined();
    });

    it('keeps local fallback mission completion local-only', async () => {
      const mission = await getOrCreateDailyMission({
        userId: LOCAL_USER,
        goalWords: 10,
        dueCount: 5,
      });
      upsertMock.mockClear();
      updateMock.mockClear();

      await completeMissionTask({
        userId: LOCAL_USER,
        missionId: mission.id,
        taskId: mission.tasks[0].id,
      });

      expect(upsertMock).not.toHaveBeenCalled();
      expect(updateMock).not.toHaveBeenCalled();
    });

    it('does not affect other tasks when completing one', async () => {
      const result = await completeMissionTask({
        userId: TEST_USER,
        missionId,
        taskId: 'task_vocab_today',
      });

      const quizTask = result!.tasks.find((t) => t.id === 'task_quiz_today')!;
      const reviewTask = result!.tasks.find((t) => t.id === 'task_review_today')!;
      expect(quizTask.done).toBe(false);
      expect(reviewTask.done).toBe(false);
    });
  });

  // =========================================================================
  // Edge cases
  // =========================================================================

  describe('edge cases', () => {
    it('handles corrupt localStorage gracefully in getLearningProfile', () => {
      storageMock.setItem('vocabdaily_user_learning_profiles', 'not-json');

      // Should fall back to default profile without throwing
      const profile = getLearningProfile(TEST_USER);
      expect(profile.userId).toBe(TEST_USER);
      expect(profile.level).toBe('B1');
    });

    it('handles missing localStorage key in getOrCreateDailyMission', async () => {
      const mission = await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 10,
        dueCount: 5,
      });

      expect(mission).toBeDefined();
      expect(mission.tasks).toHaveLength(3);
    });

    it('handles supabase errors without throwing', async () => {
      upsertMock.mockRejectedValueOnce(new Error('network error'));

      // Should not throw
      const mission = await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 10,
        dueCount: 5,
      });

      expect(mission).toBeDefined();
    });

    it('no learner model defaults to steady mode task generation', async () => {
      const mission = await getOrCreateDailyMission({
        userId: TEST_USER,
        goalWords: 10,
        dueCount: 5,
        learnerModel: null,
      });

      const vocab = mission.tasks.find((t) => t.type === 'vocabulary')!;
      expect(vocab.meta?.mode).toBe('steady');
    });

    it('title strings contain the computed target numbers', async () => {
      const mission = await getOrCreateDailyMission({
        userId: 'user-title-check',
        goalWords: 10,
        dueCount: 5,
        learnerModel: baseLearnerModel({ mode: 'steady', recommendedDailyNew: 10 }),
      });

      const vocab = mission.tasks.find((t) => t.type === 'vocabulary')!;
      const target = vocab.meta?.target as number;
      expect(vocab.title).toBe(`Learn ${target} new words`);
      expect(vocab.titleZh).toBe(`学习 ${target} 个新词`);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/lib/localDb', () => ({
  getGamificationRecord: vi.fn().mockResolvedValue(undefined),
  setGamificationRecord: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/syncQueue', () => ({
  syncQueue: { enqueue: vi.fn().mockResolvedValue(undefined) },
  buildIdempotencyKey: vi.fn(() => 'test-key'),
}));

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import type { AchievementCheckStats } from './gamification';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeStats(overrides: Partial<AchievementCheckStats> = {}): AchievementCheckStats {
  return {
    totalWordsLearned: 0,
    totalReviews: 0,
    currentStreak: 0,
    longestStreak: 0,
    masteredWords: 0,
    totalXP: 0,
    level: 0,
    ...overrides,
  };
}

function setupLocalStorage() {
  const store: Record<string, string> = {};
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      for (const key of Object.keys(store)) delete store[key];
    }),
  });
  return store;
}

/**
 * Helper: reset modules + localStorage, then dynamically import a fresh
 * gamification module. This guarantees a clean _cache Map AND a fresh
 * defaultData object (whose achievements array is not shared with prior tests).
 */
async function freshModule() {
  vi.resetModules();
  setupLocalStorage();
  return import('./gamification');
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('getDailyMultiplier', () => {
  let getDailyMultiplier: typeof import('./gamification').getDailyMultiplier;

  beforeEach(async () => {
    const mod = await freshModule();
    getDailyMultiplier = mod.getDailyMultiplier;
  });

  it('returns 1x for streak 0', () => {
    expect(getDailyMultiplier(0)).toBe(1);
  });

  it('returns 1x for streak below 7', () => {
    expect(getDailyMultiplier(1)).toBe(1);
    expect(getDailyMultiplier(6)).toBe(1);
  });

  it('returns 1.5x at exactly streak 7', () => {
    expect(getDailyMultiplier(7)).toBe(1.5);
  });

  it('returns 1.5x for streak between 7 and 13', () => {
    expect(getDailyMultiplier(10)).toBe(1.5);
    expect(getDailyMultiplier(13)).toBe(1.5);
  });

  it('returns 2x at exactly streak 14', () => {
    expect(getDailyMultiplier(14)).toBe(2);
  });

  it('returns 2x for streak between 14 and 29', () => {
    expect(getDailyMultiplier(20)).toBe(2);
    expect(getDailyMultiplier(29)).toBe(2);
  });

  it('returns 2.5x at exactly streak 30', () => {
    expect(getDailyMultiplier(30)).toBe(2.5);
  });

  it('returns 2.5x for streak above 30', () => {
    expect(getDailyMultiplier(100)).toBe(2.5);
    expect(getDailyMultiplier(365)).toBe(2.5);
  });
});

describe('checkAchievements', () => {
  let checkAchievements: typeof import('./gamification').checkAchievements;
  let getAchievements: typeof import('./gamification').getAchievements;
  let ACHIEVEMENT_DEFS: typeof import('./gamification').ACHIEVEMENT_DEFS;

  beforeEach(async () => {
    const mod = await freshModule();
    checkAchievements = mod.checkAchievements;
    getAchievements = mod.getAchievements;
    ACHIEVEMENT_DEFS = mod.ACHIEVEMENT_DEFS;
  });

  it('unlocks first_word when totalWordsLearned >= 1', () => {
    const unlocked = checkAchievements('u1', makeStats({ totalWordsLearned: 1 }));
    const ids = unlocked.map((a) => a.id);
    expect(ids).toContain('first_word');
  });

  it('unlocks multiple achievements at once', () => {
    const unlocked = checkAchievements(
      'u1',
      makeStats({
        totalWordsLearned: 100,
        totalReviews: 200,
        longestStreak: 35,
        level: 10,
        totalXP: 2000,
        masteredWords: 60,
      }),
    );
    const ids = unlocked.map((a) => a.id);
    expect(ids).toContain('first_word');
    expect(ids).toContain('ten_words');
    expect(ids).toContain('fifty_words');
    expect(ids).toContain('hundred_words');
    expect(ids).toContain('streak_7');
    expect(ids).toContain('streak_30');
    expect(ids).toContain('review_100');
    expect(ids).toContain('level_10');
    expect(ids).toContain('xp_1000');
    expect(ids).toContain('mastered_50');
  });

  it('does not re-unlock already unlocked achievements', () => {
    const first = checkAchievements('u1', makeStats({ totalWordsLearned: 1 }));
    expect(first.map((a) => a.id)).toContain('first_word');

    const second = checkAchievements('u1', makeStats({ totalWordsLearned: 1 }));
    expect(second).toHaveLength(0);
  });

  it('returns empty array when no achievements are met', () => {
    const unlocked = checkAchievements('u1', makeStats());
    expect(unlocked).toHaveLength(0);
  });

  it('persists unlocked achievements in getAchievements', () => {
    checkAchievements('u1', makeStats({ totalWordsLearned: 10 }));
    const stored = getAchievements('u1');
    const ids = stored.map((a) => a.id);
    expect(ids).toContain('first_word');
    expect(ids).toContain('ten_words');
    stored.forEach((a) => {
      expect(a.unlockedAt).toBeTruthy();
    });
  });

  it('unlocks streak achievements based on longestStreak', () => {
    const unlocked = checkAchievements('u1', makeStats({ longestStreak: 100 }));
    const ids = unlocked.map((a) => a.id);
    expect(ids).toContain('streak_7');
    expect(ids).toContain('streak_30');
    expect(ids).toContain('streak_100');
  });

  it('returns AchievementDef objects with full metadata', () => {
    const unlocked = checkAchievements('u1', makeStats({ totalWordsLearned: 1 }));
    const firstWord = unlocked.find((a) => a.id === 'first_word');
    expect(firstWord).toBeDefined();
    expect(firstWord!.nameEn).toBe('First Seed');
  });

  it('only unlocks newly qualifying achievements on a second call', () => {
    checkAchievements('u1', makeStats({ totalWordsLearned: 1 }));
    const second = checkAchievements('u1', makeStats({ totalWordsLearned: 10 }));
    const ids = second.map((a) => a.id);
    // first_word was already unlocked, should not appear again
    expect(ids).not.toContain('first_word');
    expect(ids).toContain('ten_words');
  });

  it('has unique ids in ACHIEVEMENT_DEFS', () => {
    const ids = ACHIEVEMENT_DEFS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every definition has required fields', () => {
    for (const def of ACHIEVEMENT_DEFS) {
      expect(def.id).toBeTruthy();
      expect(def.icon).toBeTruthy();
      expect(def.nameEn).toBeTruthy();
      expect(def.nameZh).toBeTruthy();
      expect(def.descriptionEn).toBeTruthy();
      expect(def.descriptionZh).toBeTruthy();
      expect(typeof def.check).toBe('function');
    }
  });
});

describe('incrementWordCount', () => {
  let incrementWordCount: typeof import('./gamification').incrementWordCount;
  let getGamificationStats: typeof import('./gamification').getGamificationStats;

  beforeEach(async () => {
    const mod = await freshModule();
    incrementWordCount = mod.incrementWordCount;
    getGamificationStats = mod.getGamificationStats;
  });

  it('increments by 1 by default', () => {
    incrementWordCount('u1');
    expect(getGamificationStats('u1').totalWordsLearned).toBe(1);
  });

  it('increments by a custom count', () => {
    incrementWordCount('u1', 5);
    expect(getGamificationStats('u1').totalWordsLearned).toBe(5);
  });

  it('accumulates across multiple calls', () => {
    incrementWordCount('u1', 3);
    incrementWordCount('u1', 7);
    expect(getGamificationStats('u1').totalWordsLearned).toBe(10);
  });
});

describe('incrementReviewCount', () => {
  let incrementReviewCount: typeof import('./gamification').incrementReviewCount;
  let getGamificationStats: typeof import('./gamification').getGamificationStats;

  beforeEach(async () => {
    const mod = await freshModule();
    incrementReviewCount = mod.incrementReviewCount;
    getGamificationStats = mod.getGamificationStats;
  });

  it('increments by 1 by default', () => {
    incrementReviewCount('u1');
    expect(getGamificationStats('u1').totalReviews).toBe(1);
  });

  it('increments by a custom count', () => {
    incrementReviewCount('u1', 10);
    expect(getGamificationStats('u1').totalReviews).toBe(10);
  });

  it('accumulates across multiple calls', () => {
    incrementReviewCount('u1', 4);
    incrementReviewCount('u1', 6);
    expect(getGamificationStats('u1').totalReviews).toBe(10);
  });
});

describe('getStreakFreezes', () => {
  let getStreakFreezes: typeof import('./gamification').getStreakFreezes;

  beforeEach(async () => {
    const mod = await freshModule();
    getStreakFreezes = mod.getStreakFreezes;
  });

  it('returns default freeze count (1) for new user', () => {
    expect(getStreakFreezes('u1')).toBe(1);
  });
});

describe('purchaseStreakFreeze', () => {
  let purchaseStreakFreeze: typeof import('./gamification').purchaseStreakFreeze;
  let getStreakFreezes: typeof import('./gamification').getStreakFreezes;
  let STREAK_FREEZE_COST: number;

  beforeEach(async () => {
    const mod = await freshModule();
    purchaseStreakFreeze = mod.purchaseStreakFreeze;
    getStreakFreezes = mod.getStreakFreezes;
    STREAK_FREEZE_COST = mod.STREAK_FREEZE_COST;
  });

  it('succeeds when user has enough XP', () => {
    const result = purchaseStreakFreeze('u1', STREAK_FREEZE_COST);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.cost).toBe(STREAK_FREEZE_COST);
  });

  it('fails when user does not have enough XP', () => {
    const result = purchaseStreakFreeze('u1', STREAK_FREEZE_COST - 1);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(1);
    expect(result.cost).toBe(STREAK_FREEZE_COST);
  });

  it('increments freeze count on each purchase', () => {
    purchaseStreakFreeze('u1', 1000);
    purchaseStreakFreeze('u1', 1000);
    expect(getStreakFreezes('u1')).toBe(3);
  });

  it('reports cost as STREAK_FREEZE_COST (50)', () => {
    expect(STREAK_FREEZE_COST).toBe(50);
  });
});

describe('useStreakFreeze', () => {
  let useStreakFreeze: typeof import('./gamification').useStreakFreeze;
  let getStreakFreezes: typeof import('./gamification').getStreakFreezes;
  let purchaseStreakFreeze: typeof import('./gamification').purchaseStreakFreeze;

  beforeEach(async () => {
    const mod = await freshModule();
    useStreakFreeze = mod.useStreakFreeze;
    getStreakFreezes = mod.getStreakFreezes;
    purchaseStreakFreeze = mod.purchaseStreakFreeze;
  });

  it('succeeds when user has freezes available', () => {
    const used = useStreakFreeze('u1');
    expect(used).toBe(true);
    expect(getStreakFreezes('u1')).toBe(0);
  });

  it('fails when user has no freezes', () => {
    useStreakFreeze('u1');
    const secondUse = useStreakFreeze('u1');
    expect(secondUse).toBe(false);
  });

  it('cannot be used twice on the same day', () => {
    purchaseStreakFreeze('u1', 1000);
    expect(getStreakFreezes('u1')).toBe(2);

    const firstUse = useStreakFreeze('u1');
    expect(firstUse).toBe(true);
    expect(getStreakFreezes('u1')).toBe(1);

    // Second use same day should be denied
    const secondUse = useStreakFreeze('u1');
    expect(secondUse).toBe(false);
    expect(getStreakFreezes('u1')).toBe(1);
  });

  it('decrements freeze count on successful use', () => {
    purchaseStreakFreeze('u1', 1000);
    purchaseStreakFreeze('u1', 1000);
    expect(getStreakFreezes('u1')).toBe(3);

    useStreakFreeze('u1');
    expect(getStreakFreezes('u1')).toBe(2);
  });
});

describe('getGamificationStats', () => {
  let getGamificationStats: typeof import('./gamification').getGamificationStats;
  let incrementWordCount: typeof import('./gamification').incrementWordCount;
  let incrementReviewCount: typeof import('./gamification').incrementReviewCount;
  let checkAchievements: typeof import('./gamification').checkAchievements;
  let purchaseStreakFreeze: typeof import('./gamification').purchaseStreakFreeze;

  beforeEach(async () => {
    const mod = await freshModule();
    getGamificationStats = mod.getGamificationStats;
    incrementWordCount = mod.incrementWordCount;
    incrementReviewCount = mod.incrementReviewCount;
    checkAchievements = mod.checkAchievements;
    purchaseStreakFreeze = mod.purchaseStreakFreeze;
  });

  it('returns default stats for new user', () => {
    const stats = getGamificationStats('u1');
    expect(stats).toEqual({
      streakFreezes: 1,
      totalWordsLearned: 0,
      totalReviews: 0,
      achievements: [],
    });
  });

  it('reflects word and review increments', () => {
    incrementWordCount('u1', 42);
    incrementReviewCount('u1', 99);
    const stats = getGamificationStats('u1');
    expect(stats.totalWordsLearned).toBe(42);
    expect(stats.totalReviews).toBe(99);
  });

  it('reflects unlocked achievements', () => {
    checkAchievements('u1', makeStats({ totalWordsLearned: 50, longestStreak: 7 }));
    const stats = getGamificationStats('u1');
    const ids = stats.achievements.map((a) => a.id);
    expect(ids).toContain('first_word');
    expect(ids).toContain('ten_words');
    expect(ids).toContain('fifty_words');
    expect(ids).toContain('streak_7');
  });

  it('reflects streak freeze purchases', () => {
    purchaseStreakFreeze('u1', 1000);
    const stats = getGamificationStats('u1');
    expect(stats.streakFreezes).toBe(2);
  });
});

/**
 * gamification.ts — Streak protection, achievements, and XP bonuses
 * ─────────────────────────────────────────────────────────────────────────────
 * Storage: IndexedDB (primary) → localStorage (fallback) → Supabase (sync)
 */

import {
  getGamificationRecord,
  setGamificationRecord,
  type GamificationRecord,
} from '@/lib/localDb';
import { logger } from '@/lib/logger';
import { syncQueue, buildIdempotencyKey } from '@/services/syncQueue';

// ─── Storage keys ────────────────────────────────────────────────────────────

const GAMIFICATION_KEY = 'vocabdaily_gamification';

interface GamificationData {
  streakFreezes: number;
  lastFreezeUsedAt: string | null;
  achievements: Achievement[];
  dailyMultiplier: number;
  totalWordsLearned: number;
  totalReviews: number;
}

// ─── Achievement definitions ─────────────────────────────────────────────────

export interface Achievement {
  id: string;
  unlockedAt: string;
}

export interface AchievementDef {
  id: string;
  icon: string;
  nameEn: string;
  nameZh: string;
  descriptionEn: string;
  descriptionZh: string;
  check: (stats: AchievementCheckStats) => boolean;
}

export interface AchievementCheckStats {
  totalWordsLearned: number;
  totalReviews: number;
  currentStreak: number;
  longestStreak: number;
  masteredWords: number;
  totalXP: number;
  level: number;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: 'first_word',
    icon: '🌱',
    nameEn: 'First Seed',
    nameZh: '初始之种',
    descriptionEn: 'Learn your first word',
    descriptionZh: '学习第一个单词',
    check: (s) => s.totalWordsLearned >= 1,
  },
  {
    id: 'ten_words',
    icon: '📚',
    nameEn: 'Getting Started',
    nameZh: '初露锋芒',
    descriptionEn: 'Learn 10 words',
    descriptionZh: '学习 10 个单词',
    check: (s) => s.totalWordsLearned >= 10,
  },
  {
    id: 'fifty_words',
    icon: '🎯',
    nameEn: 'Word Collector',
    nameZh: '单词收集者',
    descriptionEn: 'Learn 50 words',
    descriptionZh: '学习 50 个单词',
    check: (s) => s.totalWordsLearned >= 50,
  },
  {
    id: 'hundred_words',
    icon: '💯',
    nameEn: 'Centurion',
    nameZh: '百词斩',
    descriptionEn: 'Learn 100 words',
    descriptionZh: '学习 100 个单词',
    check: (s) => s.totalWordsLearned >= 100,
  },
  {
    id: 'five_hundred_words',
    icon: '🏆',
    nameEn: 'Vocab Master',
    nameZh: '词汇大师',
    descriptionEn: 'Learn 500 words',
    descriptionZh: '学习 500 个单词',
    check: (s) => s.totalWordsLearned >= 500,
  },
  {
    id: 'streak_7',
    icon: '🔥',
    nameEn: 'On Fire',
    nameZh: '连续七天',
    descriptionEn: 'Maintain a 7-day streak',
    descriptionZh: '连续学习 7 天',
    check: (s) => s.longestStreak >= 7,
  },
  {
    id: 'streak_30',
    icon: '⚡',
    nameEn: 'Unstoppable',
    nameZh: '势不可挡',
    descriptionEn: 'Maintain a 30-day streak',
    descriptionZh: '连续学习 30 天',
    check: (s) => s.longestStreak >= 30,
  },
  {
    id: 'streak_100',
    icon: '👑',
    nameEn: 'Legendary',
    nameZh: '百日传奇',
    descriptionEn: 'Maintain a 100-day streak',
    descriptionZh: '连续学习 100 天',
    check: (s) => s.longestStreak >= 100,
  },
  {
    id: 'mastered_10',
    icon: '⭐',
    nameEn: 'Memory Expert',
    nameZh: '记忆达人',
    descriptionEn: 'Master 10 words',
    descriptionZh: '掌握 10 个单词',
    check: (s) => s.masteredWords >= 10,
  },
  {
    id: 'mastered_50',
    icon: '🌟',
    nameEn: 'Memory Champion',
    nameZh: '记忆冠军',
    descriptionEn: 'Master 50 words',
    descriptionZh: '掌握 50 个单词',
    check: (s) => s.masteredWords >= 50,
  },
  {
    id: 'review_100',
    icon: '🔁',
    nameEn: 'Review Machine',
    nameZh: '复习机器',
    descriptionEn: 'Complete 100 reviews',
    descriptionZh: '完成 100 次复习',
    check: (s) => s.totalReviews >= 100,
  },
  {
    id: 'level_5',
    icon: '🎖️',
    nameEn: 'Rising Star',
    nameZh: '冉冉新星',
    descriptionEn: 'Reach level 5',
    descriptionZh: '达到 5 级',
    check: (s) => s.level >= 5,
  },
  {
    id: 'level_10',
    icon: '🏅',
    nameEn: 'Veteran Learner',
    nameZh: '学习老兵',
    descriptionEn: 'Reach level 10',
    descriptionZh: '达到 10 级',
    check: (s) => s.level >= 10,
  },
  {
    id: 'xp_1000',
    icon: '💎',
    nameEn: 'XP Hoarder',
    nameZh: '经验富翁',
    descriptionEn: 'Earn 1000 XP',
    descriptionZh: '获得 1000 经验值',
    check: (s) => s.totalXP >= 1000,
  },
];

// ─── Data access (IndexedDB primary, localStorage fallback) ─────────────────

const defaultData: GamificationData = {
  streakFreezes: 1,
  lastFreezeUsedAt: null,
  achievements: [],
  dailyMultiplier: 1,
  totalWordsLearned: 0,
  totalReviews: 0,
};

function toRecord(userId: string, data: GamificationData): GamificationRecord {
  return {
    user_id: userId,
    streak_freezes: data.streakFreezes,
    last_freeze_used_at: data.lastFreezeUsedAt,
    achievements: data.achievements,
    daily_multiplier: data.dailyMultiplier,
    total_words_learned: data.totalWordsLearned,
    total_reviews: data.totalReviews,
    updated_at: new Date().toISOString(),
  };
}

function fromRecord(record: GamificationRecord): GamificationData {
  return {
    streakFreezes: record.streak_freezes,
    lastFreezeUsedAt: record.last_freeze_used_at,
    achievements: record.achievements,
    dailyMultiplier: record.daily_multiplier,
    totalWordsLearned: record.total_words_learned,
    totalReviews: record.total_reviews,
  };
}

function getLocalStorageData(userId: string): GamificationData {
  try {
    const raw = localStorage.getItem(GAMIFICATION_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[userId] ?? { ...defaultData };
  } catch {
    return { ...defaultData };
  }
}

function setLocalStorageData(userId: string, data: GamificationData): void {
  try {
    const raw = localStorage.getItem(GAMIFICATION_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[userId] = data;
    localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(all));
  } catch {
    // localStorage unavailable
  }
}

async function getData(userId: string): Promise<GamificationData> {
  const record = await getGamificationRecord(userId);
  if (record) return fromRecord(record);

  const lsData = getLocalStorageData(userId);
  await setGamificationRecord(toRecord(userId, lsData));
  return lsData;
}

async function setData(userId: string, data: GamificationData): Promise<void> {
  const record = toRecord(userId, data);
  await setGamificationRecord(record);
  setLocalStorageData(userId, data);

  void syncQueue.enqueue({
    table: 'user_gamification',
    operation: 'upsert',
    payload: record,
    idempotency_key: buildIdempotencyKey('user_gamification', { user_id: userId }),
  }).catch((err) => {
    logger.error('[gamification] sync enqueue failed:', err);
  });
}

// ─── Sync helpers (synchronous wrappers for backward compat) ────────────────
// Internal sync cache to avoid breaking existing synchronous call sites
const _cache = new Map<string, GamificationData>();

function getDataSync(userId: string): GamificationData {
  if (_cache.has(userId)) return _cache.get(userId)!;
  const data = getLocalStorageData(userId);
  _cache.set(userId, data);
  void getData(userId).then((idbData) => _cache.set(userId, idbData));
  return data;
}

function setDataSync(userId: string, data: GamificationData): void {
  _cache.set(userId, data);
  void setData(userId, data);
}

// ─── Streak Freeze ───────────────────────────────────────────────────────────

const STREAK_FREEZE_COST = 50;

export function getStreakFreezes(userId: string): number {
  return getDataSync(userId).streakFreezes;
}

export function purchaseStreakFreeze(
  userId: string,
  currentXP: number,
): { success: boolean; remaining: number; cost: number } {
  if (currentXP < STREAK_FREEZE_COST) {
    return { success: false, remaining: getDataSync(userId).streakFreezes, cost: STREAK_FREEZE_COST };
  }

  const data = getDataSync(userId);
  data.streakFreezes += 1;
  setDataSync(userId, data);

  return { success: true, remaining: data.streakFreezes, cost: STREAK_FREEZE_COST };
}

export function useStreakFreeze(userId: string): boolean {
  const data = getDataSync(userId);
  if (data.streakFreezes <= 0) return false;

  const today = new Date().toISOString().split('T')[0];
  if (data.lastFreezeUsedAt === today) return false;

  data.streakFreezes -= 1;
  data.lastFreezeUsedAt = today;
  setDataSync(userId, data);
  return true;
}

// ─── Daily XP Multiplier ────────────────────────────────────────────────────

export function getDailyMultiplier(currentStreak: number): number {
  if (currentStreak >= 30) return 2.5;
  if (currentStreak >= 14) return 2;
  if (currentStreak >= 7) return 1.5;
  return 1;
}

// ─── Achievements ────────────────────────────────────────────────────────────

export function getAchievements(userId: string): Achievement[] {
  return getDataSync(userId).achievements;
}

export function checkAchievements(
  userId: string,
  stats: AchievementCheckStats,
): AchievementDef[] {
  const data = getDataSync(userId);
  const unlockedIds = new Set(data.achievements.map((a) => a.id));

  const newlyUnlocked: AchievementDef[] = [];

  for (const def of ACHIEVEMENT_DEFS) {
    if (unlockedIds.has(def.id)) continue;
    if (def.check(stats)) {
      data.achievements.push({ id: def.id, unlockedAt: new Date().toISOString() });
      newlyUnlocked.push(def);
    }
  }

  if (newlyUnlocked.length > 0) {
    setDataSync(userId, data);
  }

  return newlyUnlocked;
}

// ─── Stats tracking ──────────────────────────────────────────────────────────

export function incrementWordCount(userId: string, count: number = 1): void {
  const data = getDataSync(userId);
  data.totalWordsLearned += count;
  setDataSync(userId, data);
}

export function incrementReviewCount(userId: string, count: number = 1): void {
  const data = getDataSync(userId);
  data.totalReviews += count;
  setDataSync(userId, data);
}

export function getGamificationStats(userId: string): {
  streakFreezes: number;
  totalWordsLearned: number;
  totalReviews: number;
  achievements: Achievement[];
} {
  const data = getDataSync(userId);
  return {
    streakFreezes: data.streakFreezes,
    totalWordsLearned: data.totalWordsLearned,
    totalReviews: data.totalReviews,
    achievements: data.achievements,
  };
}

/**
 * Warm the IndexedDB cache for a user. Call on login/app init.
 */
export async function warmGamificationCache(userId: string): Promise<void> {
  const data = await getData(userId);
  _cache.set(userId, data);
}

/** @internal Reset in-memory cache (for testing only) */
export function _resetCache(): void {
  _cache.clear();
}

export { STREAK_FREEZE_COST };

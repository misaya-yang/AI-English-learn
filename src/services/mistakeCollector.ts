/**
 * Mistake Book service.
 * Persisted in IndexedDB under the `mistakes` store and synced to Supabase
 * `user_mistakes` via the offline-first syncQueue. All operations are scoped
 * to a userId so multi-account devices stay isolated.
 *
 * On first call per session a one-shot migration drains the legacy
 * localStorage payload at `vocabdaily_mistakes` into IndexedDB so existing
 * users do not lose their mistake history.
 */

import {
  putMistake,
  getMistakesForUser,
  getMistake,
  clearMistakesForUser,
  type MistakeRecord,
} from '@/lib/localDb';
import { syncQueue, buildIdempotencyKey } from '@/services/syncQueue';

export type MistakeSource = 'practice' | 'pronunciation' | 'roleplay' | 'manual';

export interface MistakeEntry {
  id: string;
  source: MistakeSource;
  word: string;
  correctAnswer: string;
  userAnswer: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: number;
  reviewCount: number;
  eliminated: boolean;
}

export interface MistakeFilters {
  source?: MistakeSource;
  category?: string;
  eliminated?: boolean;
}

export interface MistakeStats {
  total: number;
  bySource: Record<MistakeSource, number>;
  byCategory: Record<string, number>;
  eliminatedCount: number;
  trend: number[];
}

const LEGACY_STORAGE_KEY = 'vocabdaily_mistakes';
const migratedUsers = new Set<string>();

function generateId(): string {
  return `mistake_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function recordToEntry(rec: MistakeRecord): MistakeEntry {
  return {
    id: rec.id,
    source: rec.source,
    word: rec.word,
    correctAnswer: rec.correct_answer,
    userAnswer: rec.user_answer,
    category: rec.category,
    severity: rec.severity,
    createdAt: new Date(rec.created_at).getTime(),
    reviewCount: rec.review_count,
    eliminated: rec.eliminated,
  };
}

function entryToRecord(userId: string, entry: MistakeEntry): MistakeRecord {
  return {
    id: entry.id,
    user_id: userId,
    source: entry.source,
    word: entry.word,
    correct_answer: entry.correctAnswer,
    user_answer: entry.userAnswer,
    category: entry.category,
    severity: entry.severity,
    review_count: entry.reviewCount,
    eliminated: entry.eliminated,
    created_at: new Date(entry.createdAt).toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function enqueueSync(record: MistakeRecord): Promise<void> {
  await syncQueue.enqueue({
    table: 'user_mistakes',
    operation: 'upsert',
    payload: record as unknown as Record<string, unknown>,
    idempotency_key: buildIdempotencyKey('user_mistakes', { id: record.id }),
  });
}

async function migrateLegacyOnce(userId: string): Promise<void> {
  if (migratedUsers.has(userId)) return;
  migratedUsers.add(userId);
  let raw: string | null = null;
  try {
    raw = globalThis.localStorage?.getItem(LEGACY_STORAGE_KEY) ?? null;
  } catch {
    return;
  }
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as MistakeEntry[];
    if (!Array.isArray(parsed)) return;
    for (const entry of parsed) {
      if (!entry?.id) continue;
      const existing = await getMistake(userId, entry.id);
      if (existing) continue;
      const record = entryToRecord(userId, entry);
      await putMistake(record);
      await enqueueSync(record);
    }
    globalThis.localStorage?.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // malformed legacy blob — drop it
    try { globalThis.localStorage?.removeItem(LEGACY_STORAGE_KEY); } catch { /* noop */ }
  }
}

export async function addMistake(
  userId: string,
  params: Omit<MistakeEntry, 'id' | 'createdAt' | 'reviewCount' | 'eliminated'>,
): Promise<MistakeEntry> {
  await migrateLegacyOnce(userId);
  const entry: MistakeEntry = {
    ...params,
    id: generateId(),
    createdAt: Date.now(),
    reviewCount: 0,
    eliminated: false,
  };
  const record = entryToRecord(userId, entry);
  await putMistake(record);
  await enqueueSync(record);
  return entry;
}

export async function getMistakes(
  userId: string,
  filters: MistakeFilters = {},
): Promise<MistakeEntry[]> {
  await migrateLegacyOnce(userId);
  const records = await getMistakesForUser(userId);
  let entries = records.map(recordToEntry);
  if (filters.source !== undefined) entries = entries.filter((e) => e.source === filters.source);
  if (filters.category !== undefined) entries = entries.filter((e) => e.category === filters.category);
  if (filters.eliminated !== undefined) entries = entries.filter((e) => e.eliminated === filters.eliminated);
  return entries;
}

export async function markMistakeReviewed(
  userId: string,
  id: string,
): Promise<MistakeEntry | undefined> {
  const existing = await getMistake(userId, id);
  if (!existing) return undefined;
  const next: MistakeRecord = {
    ...existing,
    review_count: existing.review_count + 1,
    updated_at: new Date().toISOString(),
  };
  await putMistake(next);
  await enqueueSync(next);
  return recordToEntry(next);
}

export async function eliminateMistake(
  userId: string,
  id: string,
): Promise<MistakeEntry | undefined> {
  const existing = await getMistake(userId, id);
  if (!existing) return undefined;
  const next: MistakeRecord = {
    ...existing,
    eliminated: true,
    updated_at: new Date().toISOString(),
  };
  await putMistake(next);
  await enqueueSync(next);
  return recordToEntry(next);
}

export async function getMistakeStats(userId: string): Promise<MistakeStats> {
  const all = await getMistakes(userId);

  const bySource: Record<MistakeSource, number> = {
    practice: 0,
    pronunciation: 0,
    roleplay: 0,
    manual: 0,
  };
  const byCategory: Record<string, number> = {};
  let eliminatedCount = 0;

  for (const e of all) {
    bySource[e.source] = (bySource[e.source] ?? 0) + 1;
    byCategory[e.category] = (byCategory[e.category] ?? 0) + 1;
    if (e.eliminated) eliminatedCount += 1;
  }

  const trend: number[] = Array(7).fill(0);
  const now = Date.now();
  const DAY_MS = 86_400_000;
  for (const e of all) {
    const daysAgo = Math.floor((now - e.createdAt) / DAY_MS);
    if (daysAgo >= 0 && daysAgo < 7) trend[6 - daysAgo] += 1;
  }

  return { total: all.length, bySource, byCategory, eliminatedCount, trend };
}

export async function clearAllMistakes(userId: string): Promise<void> {
  migratedUsers.delete(userId);
  await clearMistakesForUser(userId);
}

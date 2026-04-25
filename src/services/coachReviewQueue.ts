// Coach-driven review queue.
//
// Persists ReviewQueueItems produced by `toReviewQueueItems(coachingActions)`
// in IndexedDB and syncs to Supabase `coach_review_queue` via syncQueue. Each
// item's id is the FNV-1a hash of the source action, so replays of the same
// action upsert (refresh dueAt + prompt) instead of duplicating.

import { emitStructuredEvent } from '@/lib/observability';
import {
  putCoachReview,
  getCoachReview,
  getCoachReviewsForUser,
  deleteCoachReview,
  deleteCoachReviewsForUser,
  type CoachReviewRecord,
} from '@/lib/localDb';
import { syncQueue, buildIdempotencyKey } from '@/services/syncQueue';
import type { ReviewQueueItem } from '@/features/coach/coachingPolicy';

const LEGACY_STORAGE_KEY = 'vocabdaily_coach_reviews';
const MAX_ENTRIES = 500;
const migratedUsers = new Set<string>();

function recordToItem(rec: CoachReviewRecord): ReviewQueueItem {
  return {
    id: rec.id,
    userInputRef: rec.user_input_ref,
    skill: rec.skill as ReviewQueueItem['skill'],
    targetWord: rec.target_word,
    prompt: rec.prompt,
    dueAt: rec.due_at,
    sourceAction: rec.source_action as ReviewQueueItem['sourceAction'],
  };
}

function itemToRecord(
  userId: string,
  item: ReviewQueueItem,
  prev?: CoachReviewRecord,
): CoachReviewRecord {
  return {
    id: item.id,
    user_id: userId,
    user_input_ref: item.userInputRef,
    skill: item.skill,
    target_word: item.targetWord,
    prompt: item.prompt,
    due_at: item.dueAt,
    source_action: item.sourceAction,
    completed_at: prev?.completed_at,
    created_at: prev?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function enqueueSync(record: CoachReviewRecord): Promise<void> {
  await syncQueue.enqueue({
    table: 'coach_review_queue',
    operation: 'upsert',
    payload: record as unknown as Record<string, unknown>,
    idempotency_key: buildIdempotencyKey('coach_review_queue', { id: record.id }),
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
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    for (const entry of parsed) {
      if (!entry?.id || !entry?.dueAt) continue;
      const existing = await getCoachReview(userId, entry.id);
      if (existing) continue;
      const record: CoachReviewRecord = {
        id: entry.id,
        user_id: userId,
        user_input_ref: entry.userInputRef,
        skill: entry.skill,
        target_word: entry.targetWord,
        prompt: entry.prompt,
        due_at: entry.dueAt,
        source_action: entry.sourceAction,
        completed_at: entry.completedAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await putCoachReview(record);
      await enqueueSync(record);
    }
    globalThis.localStorage?.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    try { globalThis.localStorage?.removeItem(LEGACY_STORAGE_KEY); } catch { /* noop */ }
  }
}

export interface ReviewQueueQuery {
  includeCompleted?: boolean;
}

export async function getCoachReviews(
  userId: string,
  query: ReviewQueueQuery = {},
): Promise<ReviewQueueItem[]> {
  await migrateLegacyOnce(userId);
  const records = await getCoachReviewsForUser(userId);
  const filtered = query.includeCompleted
    ? records
    : records.filter((r) => !r.completed_at);
  return filtered.map(recordToItem);
}

export async function getDueCoachReviews(
  userId: string,
  opts: { now?: Date } = {},
): Promise<ReviewQueueItem[]> {
  const cutoff = (opts.now ?? new Date()).getTime();
  const all = await getCoachReviews(userId);
  return all.filter((item) => new Date(item.dueAt).getTime() <= cutoff);
}

async function trimToCap(userId: string): Promise<void> {
  const all = await getCoachReviewsForUser(userId);
  if (all.length <= MAX_ENTRIES) return;
  const sortedByCreated = [...all].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const overflow = all.length - MAX_ENTRIES;
  const completed = sortedByCreated.filter((r) => r.completed_at);
  const open = sortedByCreated.filter((r) => !r.completed_at);
  let toDrop: CoachReviewRecord[];
  if (completed.length >= overflow) {
    toDrop = completed.slice(0, overflow);
  } else {
    toDrop = [...completed, ...open.slice(0, overflow - completed.length)];
  }
  for (const r of toDrop) {
    await syncQueue.enqueue({
      table: 'coach_review_queue',
      operation: 'delete',
      payload: { id: r.id, user_id: userId },
      idempotency_key: buildIdempotencyKey('coach_review_queue:delete', { id: r.id }),
    });
    await deleteCoachReview(userId, r.id);
  }
}

export async function addCoachReviewItems(
  userId: string,
  items: ReviewQueueItem[],
): Promise<void> {
  if (!Array.isArray(items) || items.length === 0) return;
  await migrateLegacyOnce(userId);

  for (const item of items) {
    if (!item || typeof item.id !== 'string' || typeof item.dueAt !== 'string') continue;
    const previous = await getCoachReview(userId, item.id);
    const record = itemToRecord(userId, item, previous);
    await putCoachReview(record);
    await enqueueSync(record);
  }

  await trimToCap(userId);

  try {
    emitStructuredEvent({
      category: 'coach',
      name: 'review_queue.write',
      payload: {
        count: items.length,
        skills: Array.from(
          new Set(
            items
              .map((item) => (typeof item?.skill === 'string' ? item.skill : ''))
              .filter(Boolean),
          ),
        ),
      },
    });
  } catch {
    // Telemetry must never break the durable write.
  }
}

export async function markCoachReviewCompleted(
  userId: string,
  id: string,
  opts: { now?: Date } = {},
): Promise<void> {
  const existing = await getCoachReview(userId, id);
  if (!existing) return;
  const next: CoachReviewRecord = {
    ...existing,
    completed_at: (opts.now ?? new Date()).toISOString(),
    updated_at: new Date().toISOString(),
  };
  await putCoachReview(next);
  await enqueueSync(next);
  try {
    emitStructuredEvent({
      category: 'coach',
      name: 'review_queue.complete',
      payload: { id, skill: existing.skill },
    });
  } catch {
    /* noop */
  }
}

export async function clearCoachReviewQueue(userId: string): Promise<void> {
  migratedUsers.delete(userId);
  await deleteCoachReviewsForUser(userId);
}

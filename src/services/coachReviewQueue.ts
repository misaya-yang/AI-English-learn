// Coach-driven review queue.
//
// Persists ReviewQueueItems produced by `toReviewQueueItems(coachingActions)`
// so a chat-coach `schedule_review` or `retry_with_hint` action becomes a
// real, due-able review entry. Lives in localStorage today (matches the
// existing mistake collector pattern); a future story can promote this to
// Supabase.
//
// Items are keyed by their FNV-1a id from the policy module: replays of the
// same action overwrite (refresh dueAt + prompt) instead of duplicating.

import type { ReviewQueueItem } from '@/features/coach/coachingPolicy';

const STORAGE_KEY = 'vocabdaily_coach_reviews';
const MAX_ENTRIES = 500;

interface StoredItem extends ReviewQueueItem {
  completedAt?: string;
}

const safeGetStorage = (): Storage | null => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

const loadAll = (): StoredItem[] => {
  const storage = safeGetStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is StoredItem => {
      return (
        entry &&
        typeof entry === 'object' &&
        typeof (entry as StoredItem).id === 'string' &&
        typeof (entry as StoredItem).dueAt === 'string'
      );
    });
  } catch {
    return [];
  }
};

const saveAll = (entries: StoredItem[]): void => {
  const storage = safeGetStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // QuotaExceeded / private mode — degrade silently.
  }
};

export interface ReviewQueueQuery {
  includeCompleted?: boolean;
}

export function getCoachReviews(query: ReviewQueueQuery = {}): ReviewQueueItem[] {
  const entries = loadAll();
  const filtered = query.includeCompleted ? entries : entries.filter((e) => !e.completedAt);
  return filtered.map((entry) => ({
    id: entry.id,
    userInputRef: entry.userInputRef,
    skill: entry.skill,
    targetWord: entry.targetWord,
    prompt: entry.prompt,
    dueAt: entry.dueAt,
    sourceAction: entry.sourceAction,
  }));
}

export function getDueCoachReviews(opts: { now?: Date } = {}): ReviewQueueItem[] {
  const now = opts.now ?? new Date();
  const cutoff = now.getTime();
  return getCoachReviews().filter((item) => new Date(item.dueAt).getTime() <= cutoff);
}

export function addCoachReviewItems(items: ReviewQueueItem[]): void {
  if (!Array.isArray(items) || items.length === 0) return;
  const storage = safeGetStorage();
  if (!storage) return;

  const existing = loadAll();
  const byId = new Map(existing.map((entry) => [entry.id, entry] as const));

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    if (typeof item.id !== 'string' || typeof item.dueAt !== 'string') continue;
    const previous = byId.get(item.id);
    byId.set(item.id, {
      ...(previous || {}),
      ...item,
      // Preserve completion across repeats — don't resurrect a finished item.
      completedAt: previous?.completedAt,
    });
  }

  // Maintain insertion order for the existing IDs and append fresh ones.
  const merged: StoredItem[] = [];
  const inserted = new Set<string>();
  for (const entry of existing) {
    const next = byId.get(entry.id);
    if (next) {
      merged.push(next);
      inserted.add(entry.id);
    }
  }
  for (const item of items) {
    if (typeof item.id !== 'string') continue;
    if (inserted.has(item.id)) continue;
    const stored = byId.get(item.id);
    if (!stored) continue;
    merged.push(stored);
    inserted.add(item.id);
  }

  // Cap to keep storage bounded. Drop the oldest *completed* items first;
  // if we still need to trim, drop the oldest open ones too. Either way the
  // freshest entries — which are most likely to be due — survive.
  let trimmed = merged;
  if (trimmed.length > MAX_ENTRIES) {
    const completed = trimmed.filter((e) => e.completedAt);
    const open = trimmed.filter((e) => !e.completedAt);
    const overflow = trimmed.length - MAX_ENTRIES;
    if (completed.length >= overflow) {
      trimmed = [...completed.slice(overflow), ...open];
    } else {
      const remaining = overflow - completed.length;
      trimmed = open.slice(remaining);
    }
  }

  saveAll(trimmed);
}

export function markCoachReviewCompleted(id: string, opts: { now?: Date } = {}): void {
  const all = loadAll();
  const idx = all.findIndex((entry) => entry.id === id);
  if (idx === -1) return;
  const completedAt = (opts.now ?? new Date()).toISOString();
  all[idx] = { ...all[idx], completedAt };
  saveAll(all);
}

export function clearCoachReviewQueue(): void {
  saveAll([]);
}

// todayWorkbenchPersistence.ts — per-day local flags for the Today workbench.
//
// `learnedWords` flows through `markWordAsLearned()` and durably lives in
// the user_word_progress store. `hardWords` and `bookmarkedWords` were
// previously component-state only — they vanished on refresh. This module
// adds a thin localStorage layer keyed by (userId, dayKey) so those two
// affordances survive a reload, without touching FSRS state. A single
// blob per (user, day) keeps the storage footprint trivially small.

const STORAGE_KEY_PREFIX = 'vocabdaily_today_flags';
const MAX_PER_DAY = 200;

interface StoredFlags {
  hard: string[];
  bookmark: string[];
  updatedAt: string;
}

const empty = (): StoredFlags => ({ hard: [], bookmark: [], updatedAt: new Date().toISOString() });

const safeStorage = (): Storage | null => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

export interface DayKey {
  userId: string;
  date: Date;
}

export function dayKeyFor(date: Date): string {
  // Use the user's local calendar day so the workbench resets at midnight
  // local time, matching how the daily mission rolls over.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const storageKeyFor = ({ userId, date }: DayKey): string =>
  `${STORAGE_KEY_PREFIX}_${userId}_${dayKeyFor(date)}`;

const readBlob = (key: DayKey): StoredFlags => {
  const storage = safeStorage();
  if (!storage) return empty();
  try {
    const raw = storage.getItem(storageKeyFor(key));
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return empty();
    return {
      hard: Array.isArray(parsed.hard)
        ? parsed.hard.filter((entry: unknown): entry is string => typeof entry === 'string').slice(0, MAX_PER_DAY)
        : [],
      bookmark: Array.isArray(parsed.bookmark)
        ? parsed.bookmark.filter((entry: unknown): entry is string => typeof entry === 'string').slice(0, MAX_PER_DAY)
        : [],
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return empty();
  }
};

const writeBlob = (key: DayKey, blob: StoredFlags): void => {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(storageKeyFor(key), JSON.stringify({
      ...blob,
      updatedAt: new Date().toISOString(),
    }));
  } catch {
    // QuotaExceeded / private mode — degrade silently.
  }
};

export interface TodayWorkbenchFlags {
  hard: Set<string>;
  bookmark: Set<string>;
}

export function loadTodayFlags(key: DayKey): TodayWorkbenchFlags {
  const blob = readBlob(key);
  return {
    hard: new Set(blob.hard),
    bookmark: new Set(blob.bookmark),
  };
}

const updateSet = (
  key: DayKey,
  field: keyof Omit<StoredFlags, 'updatedAt'>,
  wordId: string,
  mode: 'add' | 'remove' | 'toggle',
): TodayWorkbenchFlags => {
  if (typeof wordId !== 'string' || !wordId.trim()) {
    return loadTodayFlags(key);
  }
  const blob = readBlob(key);
  const current = new Set(blob[field]);
  let nextHas: boolean;
  if (mode === 'add') {
    current.add(wordId);
    nextHas = true;
  } else if (mode === 'remove') {
    current.delete(wordId);
    nextHas = false;
  } else {
    if (current.has(wordId)) {
      current.delete(wordId);
      nextHas = false;
    } else {
      current.add(wordId);
      nextHas = true;
    }
  }
  // Cap so a runaway loop can't blow out localStorage.
  let trimmed = Array.from(current);
  if (trimmed.length > MAX_PER_DAY) {
    trimmed = trimmed.slice(trimmed.length - MAX_PER_DAY);
  }
  blob[field] = trimmed;
  writeBlob(key, blob);
  return {
    hard: field === 'hard' ? new Set(trimmed) : new Set(blob.hard),
    bookmark: field === 'bookmark'
      ? new Set(trimmed)
      : new Set(blob.bookmark),
    // include the new presence so the caller doesn't have to re-check;
    // `Set.has` is O(1) so this is mostly defensive.
    ...(nextHas ? {} : {}),
  };
};

export function markTodayWordHard(key: DayKey, wordId: string): TodayWorkbenchFlags {
  return updateSet(key, 'hard', wordId, 'add');
}

export function unmarkTodayWordHard(key: DayKey, wordId: string): TodayWorkbenchFlags {
  return updateSet(key, 'hard', wordId, 'remove');
}

export function toggleTodayBookmark(key: DayKey, wordId: string): TodayWorkbenchFlags {
  return updateSet(key, 'bookmark', wordId, 'toggle');
}

export function clearTodayFlags(key: DayKey): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.removeItem(storageKeyFor(key));
  } catch {
    // ignore
  }
}

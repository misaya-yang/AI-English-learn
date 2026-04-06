/**
 * Mistake Book service for S22.
 * Collects, stores, and queries user mistakes from various practice sources.
 * Persisted in localStorage under key 'vocabdaily_mistakes'.
 */

export type MistakeSource = 'practice' | 'pronunciation' | 'roleplay' | 'manual';

export interface MistakeEntry {
  id: string;
  source: MistakeSource;
  word: string;
  correctAnswer: string;
  userAnswer: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: number; // Unix timestamp ms
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
  /** Net new mistakes per day for the last 7 days (index 0 = oldest) */
  trend: number[];
}

const STORAGE_KEY = 'vocabdaily_mistakes';

// ─── Internal helpers ────────────────────────────────────────────────────────

function loadAll(): MistakeEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MistakeEntry[]) : [];
  } catch {
    return [];
  }
}

function saveAll(entries: MistakeEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function generateId(): string {
  return `mistake_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Add a new mistake entry.
 * Returns the created entry.
 */
export function addMistake(
  params: Omit<MistakeEntry, 'id' | 'createdAt' | 'reviewCount' | 'eliminated'>,
): MistakeEntry {
  const entry: MistakeEntry = {
    ...params,
    id: generateId(),
    createdAt: Date.now(),
    reviewCount: 0,
    eliminated: false,
  };
  const all = loadAll();
  all.push(entry);
  saveAll(all);
  return entry;
}

/**
 * Retrieve mistakes, optionally filtered by source, category, and/or eliminated status.
 */
export function getMistakes(filters: MistakeFilters = {}): MistakeEntry[] {
  let entries = loadAll();
  if (filters.source !== undefined) {
    entries = entries.filter((e) => e.source === filters.source);
  }
  if (filters.category !== undefined) {
    entries = entries.filter((e) => e.category === filters.category);
  }
  if (filters.eliminated !== undefined) {
    entries = entries.filter((e) => e.eliminated === filters.eliminated);
  }
  return entries;
}

/**
 * Increment reviewCount for the mistake with the given id.
 * Returns the updated entry, or undefined if not found.
 */
export function markMistakeReviewed(id: string): MistakeEntry | undefined {
  const all = loadAll();
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], reviewCount: all[idx].reviewCount + 1 };
  saveAll(all);
  return all[idx];
}

/**
 * Mark a mistake as eliminated (mastered).
 * Returns the updated entry, or undefined if not found.
 */
export function eliminateMistake(id: string): MistakeEntry | undefined {
  const all = loadAll();
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], eliminated: true };
  saveAll(all);
  return all[idx];
}

/**
 * Compute aggregate statistics over all stored mistakes.
 */
export function getMistakeStats(): MistakeStats {
  const all = loadAll();

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
    if (e.eliminated) eliminatedCount++;
  }

  // Build 7-day trend (count of mistakes created each day, newest day = index 6)
  const trend: number[] = Array(7).fill(0);
  const now = Date.now();
  const DAY_MS = 86_400_000;
  for (const e of all) {
    const daysAgo = Math.floor((now - e.createdAt) / DAY_MS);
    if (daysAgo >= 0 && daysAgo < 7) {
      trend[6 - daysAgo] += 1;
    }
  }

  return {
    total: all.length,
    bySource,
    byCategory,
    eliminatedCount,
    trend,
  };
}

/**
 * Remove all stored mistakes. Primarily useful for testing or a "reset" feature.
 */
export function clearAllMistakes(): void {
  saveAll([]);
}

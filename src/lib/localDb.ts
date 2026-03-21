/**
 * localDb.ts — IndexedDB wrapper (replaces localStorage for SRS data)
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses the `idb` library for a clean Promise API over IndexedDB.
 * Falls back gracefully if IndexedDB is unavailable (SSR / privacy mode).
 *
 * Stores:
 *   word_progress  — per-user per-word FSRS state (keyed by [user_id, word_id])
 *   review_logs    — immutable review event log (append-only)
 *   sync_queue     — pending writes awaiting Supabase sync
 *   words_cache    — offline copy of the words table
 *   settings       — user preferences key-value
 *   events         — learning events (analytics)
 */

import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import type { FSRSState, ReviewLog, SyncQueueEntry } from '@/types/core';

// ─── Schema ──────────────────────────────────────────────────────────────────

export interface WordProgressRecord {
  user_id: string;
  word_id: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
  srs: FSRSState;
  correct_count: number;
  incorrect_count: number;
  first_seen_at: string;
  mastered_at: string | null;
  updated_at: string;
}

export interface SyncQueueRecord extends Omit<SyncQueueEntry, 'id'> {
  id?: number;  // autoincrement
  status: 'pending' | 'inflight' | 'failed';
  last_attempt_at?: string;
}

export interface VocabDailyDB extends DBSchema {
  word_progress: {
    key: [string, string]; // [user_id, word_id]
    value: WordProgressRecord;
    indexes: {
      'by_user_dueAt': [string, string];  // [user_id, srs.dueAt]
      'by_user_status': [string, string]; // [user_id, status]
    };
  };
  review_logs: {
    key: number;          // autoincrement id
    value: ReviewLog & { id: number };
    indexes: {
      'by_user_word': [string, string]; // [user_id, word_id]
      'by_user_date': [string, string]; // [user_id, rated_at]
    };
  };
  sync_queue: {
    key: number;
    value: SyncQueueRecord;
    indexes: {
      'by_status': string;
    };
  };
  words_cache: {
    key: string;          // word id
    value: { id: string; [key: string]: unknown };
  };
  settings: {
    key: string;          // setting key
    value: { key: string; value: unknown; updated_at: string };
  };
  events: {
    key: number;
    value: {
      id?: number;
      user_id: string;
      event_name: string;
      payload: Record<string, unknown>;
      created_at: string;
      synced: boolean;
    };
    indexes: { 'by_user': string };
  };
}

// ─── Database singleton ───────────────────────────────────────────────────────

const DB_NAME    = 'vocabdaily';
const DB_VERSION = 1;

let _dbPromise: Promise<IDBPDatabase<VocabDailyDB>> | null = null;

function getDb(): Promise<IDBPDatabase<VocabDailyDB>> {
  if (_dbPromise) return _dbPromise;

  _dbPromise = openDB<VocabDailyDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // ── word_progress ────────────────────────────────────────────────────
      const prog = db.createObjectStore('word_progress', {
        keyPath: ['user_id', 'word_id'],
      });
      prog.createIndex('by_user_dueAt',   ['user_id', 'srs.dueAt']);
      prog.createIndex('by_user_status',  ['user_id', 'status']);

      // ── review_logs ──────────────────────────────────────────────────────
      const logs = db.createObjectStore('review_logs', {
        keyPath: 'id',
        autoIncrement: true,
      });
      logs.createIndex('by_user_word', ['user_id', 'word_id']);
      logs.createIndex('by_user_date', ['user_id', 'rated_at']);

      // ── sync_queue ───────────────────────────────────────────────────────
      const queue = db.createObjectStore('sync_queue', {
        keyPath: 'id',
        autoIncrement: true,
      });
      queue.createIndex('by_status', 'status');

      // ── words_cache / settings / events ──────────────────────────────────
      db.createObjectStore('words_cache', { keyPath: 'id' });
      db.createObjectStore('settings',    { keyPath: 'key' });

      const ev = db.createObjectStore('events', {
        keyPath: 'id',
        autoIncrement: true,
      });
      ev.createIndex('by_user', 'user_id');
    },

    blocked() {
      console.warn('[localDb] upgrade blocked — close other tabs');
    },
    blocking() {
      // Another tab wants to upgrade — give it the chance
      _dbPromise = null;
    },
  }).catch((err) => {
    // IndexedDB unavailable (private mode, etc.) — reset so we retry later
    console.warn('[localDb] unavailable:', err);
    _dbPromise = null;
    throw err;
  });

  return _dbPromise;
}

// ─── Word progress CRUD ───────────────────────────────────────────────────────

export async function getWordProgress(
  userId: string,
  wordId: string,
): Promise<WordProgressRecord | undefined> {
  try {
    const db = await getDb();
    return db.get('word_progress', [userId, wordId]);
  } catch {
    return undefined;
  }
}

export async function setWordProgress(
  record: WordProgressRecord,
): Promise<void> {
  try {
    const db = await getDb();
    await db.put('word_progress', { ...record, updated_at: new Date().toISOString() });
  } catch (err) {
    console.warn('[localDb] setWordProgress failed:', err);
  }
}

export async function getAllProgress(userId: string): Promise<WordProgressRecord[]> {
  try {
    const db    = await getDb();
    // Use compound index to avoid scanning records belonging to other users
    const range = IDBKeyRange.bound([userId, ''], [userId, '\uffff']);
    return db.getAllFromIndex('word_progress', 'by_user_dueAt', range);
  } catch {
    return [];
  }
}

export async function getDueProgress(userId: string): Promise<WordProgressRecord[]> {
  const now = new Date().toISOString();
  const all = await getAllProgress(userId);
  return all.filter(
    (r) =>
      r.status !== 'mastered' &&
      (r.srs.state === 'new' || r.srs.dueAt <= now),
  );
}

// ─── Review logs ──────────────────────────────────────────────────────────────

export async function addReviewLog(log: Omit<ReviewLog, 'id'>): Promise<void> {
  try {
    const db = await getDb();
    await db.add('review_logs', log as ReviewLog & { id: number });
  } catch (err) {
    console.warn('[localDb] addReviewLog failed:', err);
  }
}

export async function getReviewLogs(
  userId: string,
  wordId?: string,
  limit = 200,
): Promise<ReviewLog[]> {
  try {
    const db = await getDb();
    let logs: (ReviewLog & { id: number })[];
    if (wordId) {
      // Fetch only logs for this specific (user, word) pair
      logs = await db.getAllFromIndex('review_logs', 'by_user_word', IDBKeyRange.only([userId, wordId]));
    } else {
      // Fetch all logs for this user via the date index (covers entire user key space)
      const range = IDBKeyRange.bound([userId, ''], [userId, '\uffff']);
      logs = await db.getAllFromIndex('review_logs', 'by_user_date', range);
    }
    return logs
      .sort((a, b) => b.rated_at.localeCompare(a.rated_at))
      .slice(0, limit);
  } catch {
    return [];
  }
}

// ─── Sync queue ───────────────────────────────────────────────────────────────

export async function enqueueSyncOp(
  op: Omit<SyncQueueRecord, 'id' | 'attempts' | 'status' | 'created_at'>,
): Promise<void> {
  try {
    const db = await getDb();
    // Dedup: check if identical idempotency key is already pending (no inflight/failed check needed)
    const pending = await db.getAllFromIndex('sync_queue', 'by_status', 'pending');
    const dup = pending.find((r) => r.idempotency_key === op.idempotency_key);
    if (dup) return;

    await db.add('sync_queue', {
      ...op,
      attempts: 0,
      status: 'pending',
      created_at: new Date().toISOString(),
    } as SyncQueueRecord);
  } catch (err) {
    console.warn('[localDb] enqueueSyncOp failed:', err);
  }
}

export async function getPendingSyncOps(): Promise<SyncQueueRecord[]> {
  try {
    const db = await getDb();
    return db.getAllFromIndex('sync_queue', 'by_status', 'pending');
  } catch {
    return [];
  }
}

export async function getFailedSyncOps(): Promise<SyncQueueRecord[]> {
  try {
    const db = await getDb();
    return db.getAllFromIndex('sync_queue', 'by_status', 'failed');
  } catch {
    return [];
  }
}

export async function updateSyncOp(
  id: number,
  patch: Partial<SyncQueueRecord>,
): Promise<void> {
  try {
    const db  = await getDb();
    const rec = await db.get('sync_queue', id);
    if (!rec) return;
    await db.put('sync_queue', { ...rec, ...patch });
  } catch {}
}

export async function deleteSyncOp(id: number): Promise<void> {
  try {
    const db = await getDb();
    await db.delete('sync_queue', id);
  } catch {}
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSetting<T>(key: string): Promise<T | undefined> {
  try {
    const db  = await getDb();
    const rec = await db.get('settings', key);
    return rec?.value as T | undefined;
  } catch {
    return undefined;
  }
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  try {
    const db = await getDb();
    await db.put('settings', { key, value, updated_at: new Date().toISOString() });
  } catch {}
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function addEvent(
  userId: string,
  eventName: string,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    const db = await getDb();
    await db.add('events', {
      user_id:    userId,
      event_name: eventName,
      payload,
      created_at: new Date().toISOString(),
      synced:     false,
    });
  } catch {}
}

export async function getUnsyncedEvents(userId: string, limit = 100) {
  try {
    const db  = await getDb();
    const all = await db.getAllFromIndex('events', 'by_user', userId);
    return all.filter((e) => !e.synced).slice(0, limit);
  } catch {
    return [];
  }
}

// ─── Availability check ───────────────────────────────────────────────────────

/** Returns true when IndexedDB is available and reachable */
export async function isLocalDbAvailable(): Promise<boolean> {
  try {
    await getDb();
    return true;
  } catch {
    return false;
  }
}

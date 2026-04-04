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

export interface GamificationRecord {
  user_id: string;
  streak_freezes: number;
  last_freeze_used_at: string | null;
  achievements: Array<{ id: string; unlockedAt: string }>;
  daily_multiplier: number;
  total_words_learned: number;
  total_reviews: number;
  updated_at: string;
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
      'by_idempotency_key': string;
      'by_status_table': [string, string];
    };
  };
  words_cache: {
    key: string;
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
      event_id: string;
      user_id: string;
      event_name: string;
      payload: Record<string, unknown>;
      created_at: string;
      synced: boolean;
    };
    indexes: {
      'by_user': string;
      'by_user_event': [string, string];
    };
  };
  gamification: {
    key: string; // user_id
    value: GamificationRecord;
  };
}

// ─── Database singleton ───────────────────────────────────────────────────────

const DB_NAME    = 'vocabdaily';
const DB_VERSION = 4;

let _dbPromise: Promise<IDBPDatabase<VocabDailyDB>> | null = null;

function getDb(): Promise<IDBPDatabase<VocabDailyDB>> {
  if (_dbPromise) return _dbPromise;

  _dbPromise = openDB<VocabDailyDB>(DB_NAME, DB_VERSION, {
    upgrade(db, _oldVersion, _newVersion, transaction) {
      // ── word_progress ────────────────────────────────────────────────────
      if (!db.objectStoreNames.contains('word_progress')) {
        const prog = db.createObjectStore('word_progress', {
          keyPath: ['user_id', 'word_id'],
        });
        prog.createIndex('by_user_dueAt', ['user_id', 'srs.dueAt']);
        prog.createIndex('by_user_status', ['user_id', 'status']);
      } else {
        const prog = transaction.objectStore('word_progress');
        if (!prog.indexNames.contains('by_user_dueAt')) {
          prog.createIndex('by_user_dueAt', ['user_id', 'srs.dueAt']);
        }
        if (!prog.indexNames.contains('by_user_status')) {
          prog.createIndex('by_user_status', ['user_id', 'status']);
        }
      }

      // ── review_logs ──────────────────────────────────────────────────────
      if (!db.objectStoreNames.contains('review_logs')) {
        const logs = db.createObjectStore('review_logs', {
          keyPath: 'id',
          autoIncrement: true,
        });
        logs.createIndex('by_user_word', ['user_id', 'word_id']);
        logs.createIndex('by_user_date', ['user_id', 'rated_at']);
      } else {
        const logs = transaction.objectStore('review_logs');
        if (!logs.indexNames.contains('by_user_word')) {
          logs.createIndex('by_user_word', ['user_id', 'word_id']);
        }
        if (!logs.indexNames.contains('by_user_date')) {
          logs.createIndex('by_user_date', ['user_id', 'rated_at']);
        }
      }

      // ── sync_queue ───────────────────────────────────────────────────────
      if (!db.objectStoreNames.contains('sync_queue')) {
        const queue = db.createObjectStore('sync_queue', {
          keyPath: 'id',
          autoIncrement: true,
        });
        queue.createIndex('by_status', 'status');
        queue.createIndex('by_idempotency_key', 'idempotency_key');
        queue.createIndex('by_status_table', ['status', 'table']);
      } else {
        const queue = transaction.objectStore('sync_queue');
        if (!queue.indexNames.contains('by_status')) {
          queue.createIndex('by_status', 'status');
        }
        if (!queue.indexNames.contains('by_idempotency_key')) {
          queue.createIndex('by_idempotency_key', 'idempotency_key');
        }
        if (!queue.indexNames.contains('by_status_table')) {
          queue.createIndex('by_status_table', ['status', 'table']);
        }
      }

      // ── words_cache ───────────────────────────────────────────────────
      if (!db.objectStoreNames.contains('words_cache')) {
        db.createObjectStore('words_cache', { keyPath: 'id' });
      }

      // ── settings / events ────────────────────────────────────────────────
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains('events')) {
        const ev = db.createObjectStore('events', {
          keyPath: 'id',
          autoIncrement: true,
        });
        ev.createIndex('by_user', 'user_id');
        ev.createIndex('by_user_event', ['user_id', 'event_id']);
      } else {
        const ev = transaction.objectStore('events');
        if (!ev.indexNames.contains('by_user')) {
          ev.createIndex('by_user', 'user_id');
        }
        if (!ev.indexNames.contains('by_user_event')) {
          ev.createIndex('by_user_event', ['user_id', 'event_id']);
        }
      }

      // ── gamification ──────────────────────────────────────────────────
      if (!db.objectStoreNames.contains('gamification')) {
        db.createObjectStore('gamification', { keyPath: 'user_id' });
      }
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
    const existing = await db.getFromIndex('sync_queue', 'by_idempotency_key', op.idempotency_key);

    if (existing?.id) {
      await db.put('sync_queue', {
        ...existing,
        ...op,
        status: 'pending',
        attempts: 0,
        last_attempt_at: undefined,
        last_error: undefined,
      } as SyncQueueRecord);
      return;
    }

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
    const rows = await db.getAllFromIndex('sync_queue', 'by_status', 'pending');
    return rows.sort((a, b) => a.created_at.localeCompare(b.created_at));
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
  } catch (err) {
    console.warn('[localDb] updateSyncOp failed:', err);
  }
}

export async function deleteSyncOp(id: number): Promise<void> {
  try {
    const db = await getDb();
    await db.delete('sync_queue', id);
  } catch (err) {
    console.warn('[localDb] deleteSyncOp failed:', err);
  }
}

export async function pruneReviewLogs(retentionDays = 180): Promise<number> {
  try {
    const db = await getDb();
    const tx = db.transaction('review_logs', 'readwrite');
    const store = tx.objectStore('review_logs');
    const cutoff = Date.now() - retentionDays * 86_400_000;
    const logs = await store.getAll();
    const stale = logs.filter((log) => new Date(log.rated_at).getTime() < cutoff);

    await Promise.all(stale.map((log) => store.delete(log.id)));
    await tx.done;
    return stale.length;
  } catch {
    return 0;
  }
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
  } catch (err) {
    console.warn('[localDb] setSetting failed:', err);
  }
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function addEvent(
  userId: string,
  eventId: string,
  eventName: string,
  payload: Record<string, unknown>,
  synced = false,
): Promise<void> {
  try {
    const db = await getDb();
    const existing = await db.getFromIndex('events', 'by_user_event', [userId, eventId]);
    if (existing?.id) {
      await db.put('events', {
        ...existing,
        event_name: eventName,
        payload,
        created_at: existing.created_at,
        synced: existing.synced || synced,
      });
      return;
    }

    await db.add('events', {
      event_id: eventId,
      user_id: userId,
      event_name: eventName,
      payload,
      created_at: new Date().toISOString(),
      synced,
    });
  } catch (err) {
    console.warn('[localDb] addEvent failed:', err);
  }
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

export async function getEventsForUser(
  userId: string,
  limit = 2000,
): Promise<Array<{
  id?: number;
  event_id: string;
  user_id: string;
  event_name: string;
  payload: Record<string, unknown>;
  created_at: string;
  synced: boolean;
}>> {
  try {
    const db = await getDb();
    const rows = await db.getAllFromIndex('events', 'by_user', userId);
    return rows
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function pruneEvents(limit = 2000): Promise<number> {
  try {
    const db = await getDb();
    const tx = db.transaction('events', 'readwrite');
    const store = tx.objectStore('events');
    const rows = await store.getAll();
    const staleRows = rows
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(limit);
    await Promise.all(staleRows.map((row) => store.delete(row.id as number)));
    await tx.done;
    return staleRows.length;
  } catch {
    return 0;
  }
}

// ─── Gamification ────────────────────────────────────────────────────────────

export async function getGamificationRecord(
  userId: string,
): Promise<GamificationRecord | undefined> {
  try {
    const db = await getDb();
    return db.get('gamification', userId);
  } catch {
    return undefined;
  }
}

export async function setGamificationRecord(
  record: GamificationRecord,
): Promise<void> {
  try {
    const db = await getDb();
    await db.put('gamification', { ...record, updated_at: new Date().toISOString() });
  } catch (err) {
    console.warn('[localDb] setGamificationRecord failed:', err);
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

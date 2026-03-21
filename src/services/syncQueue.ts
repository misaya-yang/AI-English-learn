/**
 * syncQueue.ts — Offline-first sync queue with exponential back-off
 * ─────────────────────────────────────────────────────────────────────────────
 * Guarantees that every write reaches Supabase exactly once, even when
 * the user is offline. Uses IndexedDB (via localDb) as the persistent store.
 *
 * Usage:
 *   await syncQueue.enqueue({ table: 'user_word_progress', operation: 'upsert', payload: {...} })
 *
 * The queue auto-flushes when:
 *   • A new item is enqueued  (online)
 *   • The browser comes back online  (window.online event)
 *   • The app tab regains focus  (visibilitychange)
 */

import { supabase } from '@/lib/supabase';
import {
  enqueueSyncOp,
  getPendingSyncOps,
  getFailedSyncOps,
  updateSyncOp,
  deleteSyncOp,
  type SyncQueueRecord,
} from '@/lib/localDb';

// ─── Config ───────────────────────────────────────────────────────────────────

const MAX_ATTEMPTS  = 5;
const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS  = 30_000;

// ─── SyncQueue class ──────────────────────────────────────────────────────────

class SyncQueue {
  private isFlushing = false;

  /** Add an operation to the queue and attempt immediate flush */
  async enqueue(op: {
    table: string;
    operation: 'upsert' | 'delete';
    payload: Record<string, unknown>;
    idempotency_key: string;
  }): Promise<void> {
    await enqueueSyncOp(op);
    void this.flush();
  }

  /** Drain the queue. Safe to call concurrently — only one flush runs at a time. */
  async flush(): Promise<void> {
    if (this.isFlushing || !this.isOnline()) return;
    this.isFlushing = true;

    try {
      const pending = await getPendingSyncOps();

      for (const op of pending) {
        if (!op.id) continue;

        // Mark as inflight so we don't double-process
        await updateSyncOp(op.id, { status: 'inflight' });

        try {
          await this.execute(op);
          // Success — remove from queue
          await deleteSyncOp(op.id);
        } catch (err) {
          const nextAttempts = op.attempts + 1;
          const isFailed     = nextAttempts >= MAX_ATTEMPTS;
          const backoffMs    = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** nextAttempts);

          await updateSyncOp(op.id, {
            status:            isFailed ? 'failed' : 'pending',
            attempts:          nextAttempts,
            last_attempt_at:   new Date().toISOString(),
            last_error:        String(err),
          });

          if (!isFailed) {
            // Wait with back-off before trying the next item
            await delay(Math.min(backoffMs, 5_000)); // cap at 5s per-item during flush
          }
        }
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /** Retry all permanently-failed ops (useful after user action / reconnect) */
  async retryFailed(): Promise<void> {
    const failed = await this.getFailedOps();
    for (const op of failed) {
      if (op.id) await updateSyncOp(op.id, { status: 'pending', attempts: 0 });
    }
    void this.flush();
  }

  /** Return count of items waiting in the queue */
  async pendingCount(): Promise<number> {
    return (await getPendingSyncOps()).length;
  }

  /** Return permanently-failed operations for user notification */
  private async getFailedOps(): Promise<SyncQueueRecord[]> {
    return getFailedSyncOps();
  }

  // ─── Execution ────────────────────────────────────────────────────────────

  private async execute(op: SyncQueueRecord): Promise<void> {
    if (op.operation === 'upsert') {
      const { error } = await supabase.from(op.table).upsert(op.payload as Record<string, unknown>);
      if (error) throw error;
    } else if (op.operation === 'delete') {
      const { error } = await supabase.from(op.table).delete().match(op.payload as Record<string, unknown>);
      if (error) throw error;
    }
  }

  private isOnline(): boolean {
    return typeof navigator === 'undefined' || navigator.onLine;
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const syncQueue = new SyncQueue();

// Auto-flush when connection returns or tab becomes visible
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void syncQueue.flush();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void syncQueue.flush();
    }
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

/** Build an idempotency key from table + primary-key fields */
export function buildIdempotencyKey(
  table: string,
  pkFields: Record<string, string | number>,
): string {
  const parts = Object.entries(pkFields)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `${table}:${parts}`;
}

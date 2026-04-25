/**
 * syncQueue.ts — Offline-first sync queue with batched retries and LWW updates
 * ─────────────────────────────────────────────────────────────────────────────
 * Guarantees that every write reaches Supabase eventually, even when the user
 * is offline. Uses IndexedDB (via localDb) as the persistent store.
 */

import { supabase } from '@/lib/supabase';
import { buildIdempotencyKey } from '@/lib/syncUtils';
import {
  enqueueSyncOp,
  getFailedSyncOps,
  getPendingSyncOps,
  updateSyncOp,
  deleteSyncOp,
  type SyncQueueRecord,
} from '@/lib/localDb';

const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 3_000;
const MAX_DELAY_MS = 60_000;
const BATCH_DELAY_CAP_MS = 6_000;

const UPSERT_CONFLICT_COLUMNS: Record<string, string> = {
  user_word_progress: 'user_id,word_ref',
  review_logs: 'id',
  learning_events: 'id',
  path_progress_events: 'id',
  learning_missions: 'id',
  user_learning_profiles: 'user_id',
  review_log_daily_summaries: 'user_id,summary_date',
  user_gamification: 'user_id',
  user_mistakes: 'id',
  coach_review_queue: 'id',
};

interface SyncBatch {
  table: string;
  operation: 'upsert' | 'delete';
  ops: SyncQueueRecord[];
  conflictTarget?: string;
}

class SyncQueue {
  private isFlushing = false;

  async enqueue(op: {
    table: string;
    operation: 'upsert' | 'delete';
    payload: Record<string, unknown>;
    idempotency_key: string;
  }): Promise<void> {
    await enqueueSyncOp(op);
    void this.flush();
  }

  async flush(): Promise<void> {
    if (this.isFlushing || !this.isOnline()) return;
    this.isFlushing = true;

    try {
      const pending = await getPendingSyncOps();
      const batches = this.buildBatches(pending);

      for (const batch of batches) {
        const ids = batch.ops
          .map((op) => op.id)
          .filter((id): id is number => typeof id === 'number');

        if (ids.length === 0) continue;

        await Promise.all(ids.map((id) => updateSyncOp(id, { status: 'inflight' })));

        try {
          await this.executeBatch(batch);
          await Promise.all(ids.map((id) => deleteSyncOp(id)));
        } catch (error) {
          const nextAttempts = Math.max(...batch.ops.map((op) => op.attempts + 1));
          const isFailed = nextAttempts >= MAX_ATTEMPTS;
          const errorMessage = toErrorMessage(error);

          await Promise.all(
            ids.map((id) =>
              updateSyncOp(id, {
                status: isFailed ? 'failed' : 'pending',
                attempts: nextAttempts,
                last_attempt_at: new Date().toISOString(),
                last_error: errorMessage,
              }),
            ),
          );

          if (!isFailed) {
            await delay(Math.min(computeBackoffMs(nextAttempts), BATCH_DELAY_CAP_MS));
          } else if (isConflictError(error)) {
            console.warn(`[syncQueue] leaving conflicting batch in failed state for ${batch.table}`);
          }
        }
      }
    } finally {
      this.isFlushing = false;
    }
  }

  async retryFailed(): Promise<void> {
    const failed = await this.getFailedOps();
    await Promise.all(
      failed
        .map((op) => op.id)
        .filter((id): id is number => typeof id === 'number')
        .map((id) => updateSyncOp(id, { status: 'pending', attempts: 0, last_error: undefined })),
    );
    void this.flush();
  }

  async pendingCount(): Promise<number> {
    return (await getPendingSyncOps()).length;
  }

  private async getFailedOps(): Promise<SyncQueueRecord[]> {
    return getFailedSyncOps();
  }

  private buildBatches(ops: SyncQueueRecord[]): SyncBatch[] {
    const batches: SyncBatch[] = [];
    const grouped = new Map<string, SyncBatch>();

    for (const op of ops) {
      if (op.operation === 'delete') {
        batches.push({ table: op.table, operation: 'delete', ops: [op] });
        continue;
      }

      const conflictTarget = UPSERT_CONFLICT_COLUMNS[op.table];
      if (!conflictTarget) {
        batches.push({ table: op.table, operation: 'upsert', ops: [op] });
        continue;
      }

      const key = `${op.table}:${conflictTarget}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.ops.push(op);
      } else {
        const batch: SyncBatch = {
          table: op.table,
          operation: 'upsert',
          ops: [op],
          conflictTarget,
        };
        grouped.set(key, batch);
        batches.push(batch);
      }
    }

    for (const batch of batches) {
      if (batch.operation !== 'upsert' || batch.ops.length <= 1) continue;
      const deduped = new Map<string, SyncQueueRecord>();
      for (const op of batch.ops) {
        deduped.set(op.idempotency_key, op);
      }
      batch.ops = [...deduped.values()];
    }

    return batches;
  }

  private async executeBatch(batch: SyncBatch): Promise<void> {
    if (batch.operation === 'delete') {
      const op = batch.ops[0];
      const { error } = await supabase.from(batch.table).delete().match(op.payload as Record<string, unknown>);
      if (error) throw error;
      return;
    }

    const rows = batch.ops.map((op) => op.payload as Record<string, unknown>);
    const { error } = await supabase.from(batch.table).upsert(rows, {
      onConflict: batch.conflictTarget,
    });
    if (error) throw error;
  }

  private isOnline(): boolean {
    return typeof navigator === 'undefined' || navigator.onLine;
  }
}

export const syncQueue = new SyncQueue();

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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeBackoffMs(attempts: number): number {
  const exponential = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** Math.max(0, attempts - 1));
  return Math.round(exponential * (0.8 + Math.random() * 0.4));
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return JSON.stringify(error);
}

function isConflictError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
}

export { buildIdempotencyKey };

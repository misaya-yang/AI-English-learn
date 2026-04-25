# Offline contract — learning loop data

This document defines what must remain functional when the user is offline and
how that data eventually reaches Supabase. The scope is the "learning loop"
domains we have moved to the unified IndexedDB + syncQueue model:

- **`user_mistakes`** — captured by `mistakeCollector` from Practice and the
  AI coach context.
- **`coach_review_queue`** — items routed by `coachingActionRouter` from chat
  coaching actions (`schedule_review`, `retry_with_hint`).

Both are scoped per `userId` — multi-account devices stay isolated.

## Storage model

Each domain has three tiers:

1. **IndexedDB store** (`mistakes`, `coach_reviews` in `localDb.ts`) — the
   read-path source of truth on the client. All UI reads go here.
2. **`sync_queue`** (`localDb.ts` → `syncQueue.ts`) — durable queue of pending
   upserts/deletes with idempotency keys. Survives reload.
3. **Supabase** (`user_mistakes`, `coach_review_queue` tables) — long-term
   cross-device store. Written via `syncQueue.flush()`; reads are not yet
   wired (a follow-up backfill task will populate IDB on first login).

## What must work offline

- Writing a new mistake during Practice (`addMistake`) — succeeds locally,
  queues a sync op.
- Writing a coach review from chat (`addCoachReviewItems`) — succeeds
  locally, queues a sync op.
- Marking a mistake reviewed/eliminated and a coach review completed —
  succeeds locally, queues a sync op for the updated row.
- Reading any of the above — returns whatever IDB has.

## What may degrade offline

- Cross-device freshness: a mistake created on phone A is not visible on
  phone B until A flushes its queue and B refreshes (we do not currently
  pull). Acceptable for the first iteration.
- The `MAX_ENTRIES = 500` cap on coach reviews. When trimming runs, the
  delete is also queued for sync.

## Flush behavior

- `syncQueue.flush()` runs on:
  - explicit `enqueue` calls (best-effort, fire-and-forget),
  - the `online` window event,
  - the `visibilitychange` event when the tab becomes visible.
- Failures are retried up to 5 times with exponential backoff, then the op
  moves to `failed` (visible via `syncQueue.retryFailed()`).
- All writes use idempotency keys built from the row id, so replays do not
  create duplicates server-side.

## Test posture

`src/services/learningLoopOffline.test.ts` covers the round trip: write
while `navigator.onLine = false`, observe the entry in `sync_queue`, flip
online, run `syncQueue.flush()`, and assert Supabase upsert was invoked
exactly once and the queue drained.

## Out of scope (for this iteration)

- Server → client backfill on login.
- `learningPathProgress` and `reminderService` — still localStorage-only;
  to be migrated in a follow-up using the same pattern.
- Conflict resolution beyond "last write wins" via `updated_at`.

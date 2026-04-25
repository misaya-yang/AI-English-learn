import { beforeEach, describe, expect, it } from 'vitest';
import {
  addCoachReviewItems,
  clearCoachReviewQueue,
  getCoachReviews,
  getDueCoachReviews,
  markCoachReviewCompleted,
} from './coachReviewQueue';
import type { ReviewQueueItem } from '@/features/coach/coachingPolicy';

const USER = 'test-user-coach-queue';

const item = (over: Partial<ReviewQueueItem> = {}): ReviewQueueItem => ({
  id: over.id ?? 'rq_aaaa1111',
  userInputRef: over.userInputRef,
  skill: over.skill ?? 'vocab',
  targetWord: over.targetWord ?? 'ephemeral',
  prompt: over.prompt ?? 'Revisit "ephemeral"',
  dueAt: over.dueAt ?? '2026-04-26T12:00:00.000Z',
  sourceAction: over.sourceAction ?? 'schedule_review',
});

beforeEach(async () => {
  await clearCoachReviewQueue(USER);
});

describe('coachReviewQueue', () => {
  it('persists items and reads them back', async () => {
    await addCoachReviewItems(USER, [item({ id: 'rq_a' }), item({ id: 'rq_b' })]);
    const all = await getCoachReviews(USER);
    expect(all.map((i) => i.id).sort()).toEqual(['rq_a', 'rq_b']);
  });

  it('dedupes by id when the same action is replayed', async () => {
    const repeated = item({ id: 'rq_dup' });
    await addCoachReviewItems(USER, [repeated]);
    await addCoachReviewItems(USER, [repeated]);
    expect(await getCoachReviews(USER)).toHaveLength(1);
  });

  it('updates the dueAt + prompt when an item with the same id is re-added', async () => {
    await addCoachReviewItems(USER, [item({ id: 'rq_x', dueAt: '2026-01-01T00:00:00.000Z', prompt: 'old' })]);
    await addCoachReviewItems(USER, [item({ id: 'rq_x', dueAt: '2026-05-01T00:00:00.000Z', prompt: 'new' })]);
    const all = await getCoachReviews(USER);
    expect(all).toHaveLength(1);
    expect(all[0].dueAt).toBe('2026-05-01T00:00:00.000Z');
    expect(all[0].prompt).toBe('new');
  });

  it('returns only items whose dueAt is in the past for getDueCoachReviews', async () => {
    const now = new Date('2026-04-25T12:00:00.000Z');
    await addCoachReviewItems(USER, [
      item({ id: 'rq_due', dueAt: '2026-04-25T11:00:00.000Z' }),
      item({ id: 'rq_future', dueAt: '2026-04-26T12:00:00.000Z' }),
      item({ id: 'rq_now', dueAt: '2026-04-25T12:00:00.000Z' }),
    ]);
    const due = await getDueCoachReviews(USER, { now });
    expect(due.map((i) => i.id).sort()).toEqual(['rq_due', 'rq_now']);
  });

  it('skips completed items in getCoachReviews + getDueCoachReviews unless includeCompleted is set', async () => {
    const past = '2026-04-20T00:00:00.000Z';
    await addCoachReviewItems(USER, [item({ id: 'rq_a', dueAt: past }), item({ id: 'rq_b', dueAt: past })]);
    await markCoachReviewCompleted(USER, 'rq_a');

    const open = await getCoachReviews(USER);
    expect(open.map((i) => i.id)).toEqual(['rq_b']);

    const all = await getCoachReviews(USER, { includeCompleted: true });
    expect(all.map((i) => i.id).sort()).toEqual(['rq_a', 'rq_b']);

    const due = await getDueCoachReviews(USER, { now: new Date('2026-04-25T00:00:00.000Z') });
    expect(due.map((i) => i.id)).toEqual(['rq_b']);
  });

  it('markCoachReviewCompleted is a no-op for unknown ids', async () => {
    await addCoachReviewItems(USER, [item({ id: 'rq_a' })]);
    await markCoachReviewCompleted(USER, 'rq_nonexistent');
    const all = await getCoachReviews(USER, { includeCompleted: true });
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('rq_a');
  });

  it('addCoachReviewItems is a no-op for empty input', async () => {
    await addCoachReviewItems(USER, []);
    expect(await getCoachReviews(USER)).toEqual([]);
  });

  it('caps the queue size to prevent runaway storage growth', async () => {
    const many: ReviewQueueItem[] = [];
    for (let i = 0; i < 600; i += 1) {
      many.push(item({ id: `rq_${i}`, dueAt: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString() }));
    }
    await addCoachReviewItems(USER, many);
    const all = await getCoachReviews(USER, { includeCompleted: true });
    expect(all.length).toBeGreaterThan(0);
    expect(all.length).toBeLessThanOrEqual(500);
  });

  it('uses Date.now() by default for getDueCoachReviews', async () => {
    await addCoachReviewItems(USER, [
      item({ id: 'rq_past', dueAt: '2000-01-01T00:00:00.000Z' }),
      item({ id: 'rq_future', dueAt: '2099-01-01T00:00:00.000Z' }),
    ]);
    expect((await getDueCoachReviews(USER)).map((i) => i.id)).toEqual(['rq_past']);
  });

  it('isolates entries between users', async () => {
    const userA = 'user-a';
    const userB = 'user-b';
    await clearCoachReviewQueue(userA);
    await clearCoachReviewQueue(userB);
    await addCoachReviewItems(userA, [item({ id: 'a1' })]);
    await addCoachReviewItems(userB, [item({ id: 'b1' })]);
    expect((await getCoachReviews(userA)).map((i) => i.id)).toEqual(['a1']);
    expect((await getCoachReviews(userB)).map((i) => i.id)).toEqual(['b1']);
  });
});

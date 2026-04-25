import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addCoachReviewItems,
  clearCoachReviewQueue,
  getCoachReviews,
  getDueCoachReviews,
  markCoachReviewCompleted,
} from './coachReviewQueue';
import type { ReviewQueueItem } from '@/features/coach/coachingPolicy';

const item = (over: Partial<ReviewQueueItem> = {}): ReviewQueueItem => ({
  id: over.id ?? 'rq_aaaa1111',
  userInputRef: over.userInputRef,
  skill: over.skill ?? 'vocab',
  targetWord: over.targetWord ?? 'ephemeral',
  prompt: over.prompt ?? 'Revisit "ephemeral"',
  dueAt: over.dueAt ?? '2026-04-26T12:00:00.000Z',
  sourceAction: over.sourceAction ?? 'schedule_review',
});

beforeEach(() => {
  clearCoachReviewQueue();
});

describe('coachReviewQueue', () => {
  it('persists items and reads them back', () => {
    addCoachReviewItems([item({ id: 'rq_a' }), item({ id: 'rq_b' })]);
    const all = getCoachReviews();
    expect(all.map((i) => i.id).sort()).toEqual(['rq_a', 'rq_b']);
  });

  it('dedupes by id when the same action is replayed', () => {
    const repeated = item({ id: 'rq_dup' });
    addCoachReviewItems([repeated]);
    addCoachReviewItems([repeated]);
    expect(getCoachReviews()).toHaveLength(1);
  });

  it('updates the dueAt + prompt when an item with the same id is re-added', () => {
    addCoachReviewItems([item({ id: 'rq_x', dueAt: '2026-01-01T00:00:00.000Z', prompt: 'old' })]);
    addCoachReviewItems([item({ id: 'rq_x', dueAt: '2026-05-01T00:00:00.000Z', prompt: 'new' })]);
    const all = getCoachReviews();
    expect(all).toHaveLength(1);
    expect(all[0].dueAt).toBe('2026-05-01T00:00:00.000Z');
    expect(all[0].prompt).toBe('new');
  });

  it('returns only items whose dueAt is in the past for getDueCoachReviews', () => {
    const now = new Date('2026-04-25T12:00:00.000Z');
    addCoachReviewItems([
      item({ id: 'rq_due', dueAt: '2026-04-25T11:00:00.000Z' }),
      item({ id: 'rq_future', dueAt: '2026-04-26T12:00:00.000Z' }),
      item({ id: 'rq_now', dueAt: '2026-04-25T12:00:00.000Z' }),
    ]);
    const due = getDueCoachReviews({ now });
    expect(due.map((i) => i.id).sort()).toEqual(['rq_due', 'rq_now']);
  });

  it('skips completed items in getCoachReviews + getDueCoachReviews unless includeCompleted is set', () => {
    const past = '2026-04-20T00:00:00.000Z';
    addCoachReviewItems([item({ id: 'rq_a', dueAt: past }), item({ id: 'rq_b', dueAt: past })]);
    markCoachReviewCompleted('rq_a');

    const open = getCoachReviews();
    expect(open.map((i) => i.id)).toEqual(['rq_b']);

    const all = getCoachReviews({ includeCompleted: true });
    expect(all.map((i) => i.id).sort()).toEqual(['rq_a', 'rq_b']);

    const due = getDueCoachReviews({ now: new Date('2026-04-25T00:00:00.000Z') });
    expect(due.map((i) => i.id)).toEqual(['rq_b']);
  });

  it('markCoachReviewCompleted is a no-op for unknown ids', () => {
    addCoachReviewItems([item({ id: 'rq_a' })]);
    markCoachReviewCompleted('rq_nonexistent');
    const all = getCoachReviews({ includeCompleted: true });
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('rq_a');
  });

  it('survives malformed localStorage payloads without throwing', () => {
    localStorage.setItem('vocabdaily_coach_reviews', '{"not":"an array"}');
    // Reading returns []; subsequent writes overwrite the malformed blob.
    expect(getCoachReviews()).toEqual([]);
    addCoachReviewItems([item({ id: 'rq_recover' })]);
    expect(getCoachReviews()).toHaveLength(1);
  });

  it('addCoachReviewItems is a no-op for empty input', () => {
    addCoachReviewItems([]);
    expect(getCoachReviews()).toEqual([]);
  });

  it('caps the queue size to prevent runaway storage growth', () => {
    const many: ReviewQueueItem[] = [];
    for (let i = 0; i < 800; i += 1) {
      many.push(item({ id: `rq_${i}` }));
    }
    addCoachReviewItems(many);
    // The cap exists; we don't pin the exact number, just verify it's
    // bounded at a sensible upper limit.
    const all = getCoachReviews({ includeCompleted: true });
    expect(all.length).toBeGreaterThan(0);
    expect(all.length).toBeLessThanOrEqual(500);
  });

  it('preserves insertion order for replayed runs', () => {
    addCoachReviewItems([item({ id: 'rq_1' })]);
    addCoachReviewItems([item({ id: 'rq_2' })]);
    addCoachReviewItems([item({ id: 'rq_3' })]);
    const all = getCoachReviews();
    expect(all.map((i) => i.id)).toEqual(['rq_1', 'rq_2', 'rq_3']);
  });

  it('does nothing when localStorage is unavailable (defensive guard)', () => {
    const original = (globalThis as unknown as { localStorage?: Storage }).localStorage;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('storage unavailable');
      },
    });
    try {
      // None of these throw — they degrade silently. SSR / privacy-mode safe.
      expect(() => addCoachReviewItems([item()])).not.toThrow();
      expect(getCoachReviews()).toEqual([]);
      expect(() => markCoachReviewCompleted('rq_a')).not.toThrow();
    } finally {
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: original,
      });
    }
  });

  it('uses Date.now() by default for getDueCoachReviews', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-04-25T12:00:00.000Z'));
      addCoachReviewItems([
        item({ id: 'rq_due', dueAt: '2026-04-25T10:00:00.000Z' }),
        item({ id: 'rq_future', dueAt: '2026-04-25T14:00:00.000Z' }),
      ]);
      expect(getDueCoachReviews().map((i) => i.id)).toEqual(['rq_due']);
    } finally {
      vi.useRealTimers();
    }
  });
});

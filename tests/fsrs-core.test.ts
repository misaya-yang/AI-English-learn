import test from 'node:test';
import assert from 'node:assert/strict';
import { initCard, isStubbornWord, scheduleReview } from '../src/services/fsrs.ts';
import { ensureFSRS } from '../src/services/fsrsMigration.ts';

test('FSRS schedules a new card into review on a successful first recall', () => {
  const now = new Date('2026-03-22T12:00:00.000Z');
  const next = scheduleReview(initCard(), 'good', now);

  assert.equal(next.state, 'review');
  assert.equal(next.lastReviewAt, now.toISOString());
  assert.ok(next.stability > 0);
  assert.ok(new Date(next.dueAt).getTime() > now.getTime());
});

test('FSRS moves a lapsed card into relearning and increments lapses', () => {
  const now = new Date('2026-03-22T12:00:00.000Z');
  const reviewed = scheduleReview(initCard(), 'good', new Date('2026-03-01T12:00:00.000Z'));
  const lapsed = scheduleReview(reviewed, 'again', now);

  assert.equal(lapsed.state, 'relearning');
  assert.equal(lapsed.lapses, reviewed.lapses + 1);
  assert.ok(new Date(lapsed.dueAt).getTime() >= now.getTime());
});

test('legacy SM-2 progress is migrated into a usable FSRS snapshot', () => {
  const fsrs = ensureFSRS({
    userId: 'u1',
    wordId: 'w1',
    status: 'review',
    reviewCount: 4,
    lastReviewed: '2026-03-20T08:00:00.000Z',
    nextReview: '2026-03-25',
    easeFactor: 2.2,
  });

  assert.ok(fsrs.stability >= 1);
  assert.equal(fsrs.state, 'review');
  assert.ok(fsrs.dueAt.startsWith('2026-03-25'));
});

test('stubborn cards stay on a shorter reinforcement interval after recall', () => {
  const now = new Date('2026-03-22T12:00:00.000Z');
  const baseCard = {
    ...scheduleReview(initCard(), 'good', new Date('2026-03-10T12:00:00.000Z')),
    stability: 12,
    difficulty: 5.5,
    lapses: 0,
    state: 'review' as const,
    lastReviewAt: '2026-03-15T12:00:00.000Z',
  };
  const stubbornCard = {
    ...baseCard,
    difficulty: 8.6,
    lapses: 3,
  };

  const normalNext = scheduleReview(baseCard, 'good', now);
  const stubbornNext = scheduleReview(stubbornCard, 'good', now);

  const normalDays = Math.round((new Date(normalNext.dueAt).getTime() - now.getTime()) / 86_400_000);
  const stubbornDays = Math.round((new Date(stubbornNext.dueAt).getTime() - now.getTime()) / 86_400_000);

  assert.equal(isStubbornWord(stubbornCard), true);
  assert.ok(stubbornDays < normalDays);
});

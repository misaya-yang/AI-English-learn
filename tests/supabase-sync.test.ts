import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWordProgressSyncPayload } from '../src/lib/wordProgressSync.ts';
import { buildIdempotencyKey } from '../src/lib/syncUtils.ts';

test('word progress sync payload preserves local word ids via word_ref', () => {
  const payload = buildWordProgressSyncPayload({
    userId: 'user-1',
    wordId: 'w101',
    status: 'review',
    reviewCount: 8,
    correctCount: 7,
    incorrectCount: 1,
    fsrs: {
      stability: 12,
      difficulty: 4.2,
      retrievability: 0.91,
      lapses: 1,
      state: 'review',
      dueAt: '2026-03-30T00:00:00.000Z',
      lastReviewAt: '2026-03-22T00:00:00.000Z',
    },
  });

  assert.equal(payload.word_ref, 'w101');
  assert.equal(payload.word_id, null);
  assert.equal(payload.review_count, 8);
  assert.equal(payload.interval, 8);
  assert.equal(payload.srs_state, 'review');
});

test('idempotency keys are stable regardless of field order', () => {
  const first = buildIdempotencyKey('user_word_progress', {
    word_ref: 'w101',
    user_id: 'user-1',
  });
  const second = buildIdempotencyKey('user_word_progress', {
    user_id: 'user-1',
    word_ref: 'w101',
  });

  assert.equal(first, second);
});

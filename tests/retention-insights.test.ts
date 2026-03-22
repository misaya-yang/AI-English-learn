import test from 'node:test';
import assert from 'node:assert/strict';

import { computeHighRiskWords } from '../src/services/retentionInsights.ts';
import type { UserProgress } from '../src/data/localStorage.ts';

test('retention insights rank overdue stubborn cards above stable ones', () => {
  const now = new Date('2026-03-22T12:00:00.000Z');
  const progress: UserProgress[] = [
    {
      userId: 'u1',
      wordId: 'w-stubborn',
      status: 'review',
      reviewCount: 8,
      lastReviewed: '2026-03-18T12:00:00.000Z',
      nextReview: '2026-03-20',
      easeFactor: 2,
      fsrs: {
        stability: 3,
        difficulty: 8.8,
        retrievability: 0,
        lapses: 4,
        state: 'review',
        dueAt: '2026-03-20T12:00:00.000Z',
        lastReviewAt: '2026-03-18T12:00:00.000Z',
      },
    },
    {
      userId: 'u1',
      wordId: 'w-stable',
      status: 'review',
      reviewCount: 5,
      lastReviewed: '2026-03-21T12:00:00.000Z',
      nextReview: '2026-03-28',
      easeFactor: 2.4,
      fsrs: {
        stability: 14,
        difficulty: 4.2,
        retrievability: 0,
        lapses: 0,
        state: 'review',
        dueAt: '2026-03-28T12:00:00.000Z',
        lastReviewAt: '2026-03-21T12:00:00.000Z',
      },
    },
  ];

  const riskWords = computeHighRiskWords(
    progress,
    [
      { id: 'w-stubborn', word: 'fragile', topic: 'daily' },
      { id: 'w-stable', word: 'robust', topic: 'business' },
    ],
    10,
    now,
  );

  assert.equal(riskWords[0]?.wordId, 'w-stubborn');
  assert.equal(riskWords[0]?.isStubborn, true);
  assert.ok((riskWords[0]?.riskScore || 0) > (riskWords[1]?.riskScore || 0));
});

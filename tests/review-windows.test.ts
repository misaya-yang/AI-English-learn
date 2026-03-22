import test from 'node:test';
import assert from 'node:assert/strict';

import { computeReviewWindows } from '../src/services/reviewWindows.ts';
import type { LearningEventRecord } from '../src/services/learningEvents.ts';

const makeEvent = (createdAt: string, eventName = 'practice.quiz_submitted'): LearningEventRecord => ({
  id: `${eventName}-${createdAt}`,
  userId: 'user_1',
  eventName,
  eventSource: 'web',
  payload: {},
  createdAt,
});

test('review window insight prefers the most consistent active study block', () => {
  const events: LearningEventRecord[] = [
    makeEvent('2026-03-18T19:05:00.000+08:00'),
    makeEvent('2026-03-18T19:32:00.000+08:00'),
    makeEvent('2026-03-19T20:14:00.000+08:00'),
    makeEvent('2026-03-20T19:48:00.000+08:00'),
    makeEvent('2026-03-21T20:02:00.000+08:00'),
    makeEvent('2026-03-22T14:10:00.000+08:00'),
    makeEvent('2026-03-22T14:32:00.000+08:00'),
  ];

  const insight = computeReviewWindows(events);

  assert.ok(insight);
  assert.equal(insight?.primary.id, 'evening');
  assert.equal(insight?.secondary?.id, 'afternoon');
});

test('review window insight ignores technical telemetry-only events', () => {
  const events: LearningEventRecord[] = [
    makeEvent('2026-03-18T19:05:00.000+08:00', 'chat.ttft'),
    makeEvent('2026-03-19T20:14:00.000+08:00', 'chat.fast_path_hit'),
    makeEvent('2026-03-20T19:48:00.000+08:00', 'chat.quiz_next_latency'),
    makeEvent('2026-03-20T09:15:00.000+08:00'),
    makeEvent('2026-03-21T09:25:00.000+08:00'),
    makeEvent('2026-03-22T09:35:00.000+08:00'),
    makeEvent('2026-03-22T09:55:00.000+08:00'),
    makeEvent('2026-03-23T10:05:00.000+08:00'),
    makeEvent('2026-03-23T10:25:00.000+08:00'),
  ];

  const insight = computeReviewWindows(events);

  assert.ok(insight);
  assert.equal(insight?.primary.id, 'morning');
});

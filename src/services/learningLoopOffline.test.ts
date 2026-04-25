/**
 * Offline contract: mistakes and coach reviews must persist locally while
 * offline, then drain via syncQueue once connectivity returns. The Supabase
 * call is mocked so the test verifies syncQueue intent rather than network.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const upsertMock = vi.fn(async () => ({ error: null }));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      upsert: upsertMock,
      delete: () => ({ match: async () => ({ error: null }) }),
    }),
  },
}));

import { addMistake, clearAllMistakes } from './mistakeCollector';
import {
  addCoachReviewItems,
  clearCoachReviewQueue,
} from './coachReviewQueue';
import { syncQueue } from './syncQueue';
import { getPendingSyncOps } from '@/lib/localDb';

const USER = 'offline-contract-user';

const setOnline = (value: boolean): void => {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value });
};

beforeEach(async () => {
  upsertMock.mockClear();
  setOnline(false);
  await clearAllMistakes(USER);
  await clearCoachReviewQueue(USER);
});

afterEach(() => {
  setOnline(false);
});

describe('learning-loop offline contract', () => {
  it('mistakes written offline land in the sync queue and flush after reconnect', async () => {
    await addMistake(USER, {
      source: 'practice',
      word: 'aberration',
      correctAnswer: 'aberration',
      userAnswer: 'aboration',
      category: 'Vocabulary',
      severity: 'medium',
    });

    const pendingOffline = await getPendingSyncOps();
    const mistakeOps = pendingOffline.filter((op) => op.table === 'user_mistakes');
    expect(mistakeOps.length).toBe(1);
    expect(upsertMock).not.toHaveBeenCalled();

    setOnline(true);
    await syncQueue.flush();

    expect(upsertMock).toHaveBeenCalled();
    const remaining = (await getPendingSyncOps()).filter((op) => op.table === 'user_mistakes');
    expect(remaining.length).toBe(0);
  });

  it('coach reviews written offline land in the sync queue and flush after reconnect', async () => {
    await addCoachReviewItems(USER, [
      {
        id: 'rq_offline_test',
        skill: 'vocab',
        targetWord: 'ephemeral',
        prompt: 'Revisit ephemeral',
        dueAt: '2099-01-01T00:00:00.000Z',
        sourceAction: 'schedule_review',
      },
    ]);

    const pendingOffline = await getPendingSyncOps();
    const coachOps = pendingOffline.filter((op) => op.table === 'coach_review_queue');
    expect(coachOps.length).toBe(1);
    expect(upsertMock).not.toHaveBeenCalled();

    setOnline(true);
    await syncQueue.flush();

    expect(upsertMock).toHaveBeenCalled();
    const remaining = (await getPendingSyncOps()).filter((op) => op.table === 'coach_review_queue');
    expect(remaining.length).toBe(0);
  });
});

// LEARN-02 — strict typed event model tests.
//
// Covers write (recordEvent) -> filter (getEvents) -> derive
// (derivePathProgress). The IDB layer falls back to in-memory when
// IndexedDB is unavailable in jsdom, so writes round-trip via the same
// helpers used in production.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { clearLearningEventsForUser } from '@/lib/localDb';
import {
  recordEvent,
  getEvents,
  derivePathProgress,
  type LearningEvent,
} from './learningEvents';

const USER = 'test-user-strict-events';

describe('learningEvents — strict typed contract', () => {
  beforeEach(async () => {
    await clearLearningEventsForUser(USER);
  });

  afterEach(async () => {
    await clearLearningEventsForUser(USER);
  });

  it('records an event with a generated id and ISO timestamp', async () => {
    const event = await recordEvent(USER, {
      kind: 'practice_correct',
      payload: { word: 'aberration' },
    });
    expect(event.id).toMatch(/^evt_/);
    expect(event.user_id).toBe(USER);
    expect(event.kind).toBe('practice_correct');
    expect(event.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('filters events by kind', async () => {
    await recordEvent(USER, { kind: 'practice_correct', payload: { word: 'a' } });
    await recordEvent(USER, { kind: 'practice_wrong', payload: { word: 'b' } });
    await recordEvent(USER, { kind: 'review_completed' });

    const wrongs = await getEvents(USER, { kind: 'practice_wrong' });
    expect(wrongs.map((event) => event.kind)).toEqual(['practice_wrong']);

    const corrects = await getEvents(USER, { kind: 'practice_correct' });
    expect(corrects.length).toBe(1);
  });

  it('filters events by since timestamp', async () => {
    const t0 = '2026-01-01T00:00:00.000Z';
    const t1 = '2026-04-25T12:00:00.000Z';
    await recordEvent(USER, { kind: 'session_started', createdAt: t0 });
    await recordEvent(USER, { kind: 'session_ended', createdAt: t1 });

    const recent = await getEvents(USER, { since: '2026-03-01T00:00:00.000Z' });
    expect(recent.map((event) => event.kind)).toEqual(['session_ended']);
  });

  it('derives path progress from a mixed event stream', () => {
    const events: LearningEvent[] = [
      { id: '1', user_id: USER, kind: 'practice_correct', created_at: 't' },
      { id: '2', user_id: USER, kind: 'practice_correct', created_at: 't' },
      { id: '3', user_id: USER, kind: 'practice_wrong', created_at: 't' },
      { id: '4', user_id: USER, kind: 'review_completed', created_at: 't' },
      { id: '5', user_id: USER, kind: 'mistake_resolved', created_at: 't' },
      { id: '6', user_id: USER, kind: 'session_started', created_at: 't' },
      { id: '7', user_id: USER, kind: 'session_ended', created_at: 't' },
    ];
    expect(derivePathProgress(events)).toEqual({
      reviewsCompleted: 1,
      practiceCorrect: 2,
      practiceWrong: 1,
      mistakesResolved: 1,
      sessions: 1,
    });
  });

  it('derives zero counts for an empty event stream', () => {
    expect(derivePathProgress([])).toEqual({
      reviewsCompleted: 0,
      practiceCorrect: 0,
      practiceWrong: 0,
      mistakesResolved: 0,
      sessions: 0,
    });
  });
});

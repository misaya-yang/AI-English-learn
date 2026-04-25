import { describe, expect, it } from 'vitest';

import type { LearningEventRecord } from './learningEvents';
import {
  createEvidenceEvent,
  deriveLessonCompletion,
  type EvidenceEvent,
} from './evidenceEvents';

const NOW = '2026-04-25T12:00:00.000Z';

const persistedRow = (
  eventName: string,
  payload: Record<string, unknown>,
): LearningEventRecord => ({
  id: `id-${Math.random().toString(36).slice(2, 6)}`,
  userId: 'u1',
  eventName,
  eventSource: 'web',
  payload,
  createdAt: NOW,
});

describe('createEvidenceEvent', () => {
  it('attaches createdAt when omitted', () => {
    const event = createEvidenceEvent({
      type: 'vocab.learned',
      userId: 'u1',
      wordId: 'w1',
    }) as EvidenceEvent;
    expect(event.type).toBe('vocab.learned');
    expect(event.userId).toBe('u1');
    expect(event.createdAt).toBeDefined();
    expect(new Date(event.createdAt).toString()).not.toBe('Invalid Date');
  });

  it('preserves an explicit createdAt', () => {
    const event = createEvidenceEvent({
      type: 'review.rated',
      userId: 'u1',
      wordId: 'w1',
      rating: 'good',
      createdAt: NOW,
    });
    expect(event.createdAt).toBe(NOW);
  });

  it('throws when userId is missing', () => {
    expect(() =>
      // @ts-expect-error simulate bad caller
      createEvidenceEvent({ type: 'vocab.learned', wordId: 'w1' }),
    ).toThrow();
  });
});

describe('deriveLessonCompletion', () => {
  it('returns not-completed and progress=0 for an empty requirement', () => {
    const result = deriveLessonCompletion([], { lessonId: 'l1' });
    expect(result.completed).toBe(false);
    expect(result.progress).toBe(0);
    expect(result.metBy).toEqual([]);
  });

  it('completes the lesson on manual override regardless of events', () => {
    const result = deriveLessonCompletion([], { lessonId: 'l1', manualOverride: true });
    expect(result.completed).toBe(true);
    expect(result.progress).toBe(1);
  });

  it('completes when vocabLearnedCount is reached via typed events', () => {
    const events = [
      createEvidenceEvent({ type: 'vocab.learned', userId: 'u1', wordId: 'a' }),
      createEvidenceEvent({ type: 'vocab.learned', userId: 'u1', wordId: 'b' }),
      createEvidenceEvent({ type: 'vocab.learned', userId: 'u1', wordId: 'c' }),
    ];
    const result = deriveLessonCompletion(events, { lessonId: 'l1', vocabLearnedCount: 3 });
    expect(result.completed).toBe(true);
    expect(result.progress).toBe(1);
    expect(result.metBy).toContain('vocab.learned');
  });

  it('counts distinct words for vocab.learned (no double-counting on retries)', () => {
    const events = [
      createEvidenceEvent({ type: 'vocab.learned', userId: 'u1', wordId: 'a' }),
      createEvidenceEvent({ type: 'vocab.learned', userId: 'u1', wordId: 'a' }),
      createEvidenceEvent({ type: 'vocab.learned', userId: 'u1', wordId: 'b' }),
    ];
    const result = deriveLessonCompletion(events, { lessonId: 'l1', vocabLearnedCount: 3 });
    expect(result.completed).toBe(false);
    expect(result.progress).toBe(0);
  });

  it('completes via practiceCorrectCount', () => {
    const events: EvidenceEvent[] = [
      createEvidenceEvent({ type: 'practice.correct', userId: 'u1', wordId: 'a', mode: 'quiz' }),
      createEvidenceEvent({ type: 'practice.correct', userId: 'u1', wordId: 'b', mode: 'quiz' }),
      createEvidenceEvent({ type: 'practice.incorrect', userId: 'u1', wordId: 'c', mode: 'quiz' }),
    ];
    const result = deriveLessonCompletion(events, { lessonId: 'l1', practiceCorrectCount: 2 });
    expect(result.completed).toBe(true);
    expect(result.metBy).toContain('practice.correct');
  });

  it('treats only good/easy ratings as review successes', () => {
    const events: EvidenceEvent[] = [
      createEvidenceEvent({ type: 'review.rated', userId: 'u1', wordId: 'a', rating: 'good' }),
      createEvidenceEvent({ type: 'review.rated', userId: 'u1', wordId: 'b', rating: 'easy' }),
      createEvidenceEvent({ type: 'review.rated', userId: 'u1', wordId: 'c', rating: 'again' }),
      createEvidenceEvent({ type: 'review.rated', userId: 'u1', wordId: 'd', rating: 'hard' }),
    ];
    const result = deriveLessonCompletion(events, { lessonId: 'l1', reviewSuccessCount: 2 });
    expect(result.completed).toBe(true);
    expect(result.metBy).toContain('review.rated');
  });

  it('reports partial progress when some requirements are met', () => {
    const events: EvidenceEvent[] = [
      createEvidenceEvent({ type: 'vocab.learned', userId: 'u1', wordId: 'a' }),
      createEvidenceEvent({ type: 'vocab.learned', userId: 'u1', wordId: 'b' }),
    ];
    const result = deriveLessonCompletion(events, {
      lessonId: 'l1',
      vocabLearnedCount: 2,
      practiceCorrectCount: 5,
    });
    expect(result.completed).toBe(false);
    expect(result.progress).toBe(0.5);
    expect(result.metBy).toEqual(['vocab.learned']);
  });

  it('accepts persisted LearningEventRecord rows alongside typed events', () => {
    const events = [
      persistedRow('evidence.vocab.learned', { wordId: 'a' }),
      persistedRow('evidence.vocab.learned', { wordId: 'b' }),
      createEvidenceEvent({ type: 'vocab.learned', userId: 'u1', wordId: 'c' }),
    ];
    const result = deriveLessonCompletion(events, { lessonId: 'l1', vocabLearnedCount: 3 });
    expect(result.completed).toBe(true);
  });

  it('treats an explicit lesson.completed event as a hard yes', () => {
    const events = [
      createEvidenceEvent({ type: 'lesson.completed', userId: 'u1', lessonId: 'l1' }),
    ];
    const result = deriveLessonCompletion(events, {
      lessonId: 'l1',
      vocabLearnedCount: 100,
      practiceCorrectCount: 100,
    });
    expect(result.completed).toBe(true);
    expect(result.metBy).toContain('lesson.completed');
  });

  it('ignores lesson.completed events for a different lesson', () => {
    const events = [
      createEvidenceEvent({ type: 'lesson.completed', userId: 'u1', lessonId: 'other' }),
    ];
    const result = deriveLessonCompletion(events, { lessonId: 'l1', vocabLearnedCount: 1 });
    expect(result.completed).toBe(false);
  });

  it('persisted review.rated rows respect the rating field', () => {
    const events = [
      persistedRow('evidence.review.rated', { rating: 'good' }),
      persistedRow('evidence.review.rated', { rating: 'again' }),
    ];
    const result = deriveLessonCompletion(events, { lessonId: 'l1', reviewSuccessCount: 1 });
    expect(result.completed).toBe(true);
  });
});

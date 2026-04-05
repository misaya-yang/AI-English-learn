import { describe, it, expect } from 'vitest';
import { computeReviewWindows } from './reviewWindows';
import type { LearningEventRecord } from './learningEvents';

function makeEvent(localHour: number, day: string): LearningEventRecord {
  // Create a date at the specified local hour to match getHours() behavior
  const d = new Date(`${day}T12:00:00`);
  d.setHours(localHour, 30, 0, 0);
  return {
    id: `${day}-${localHour}-${Math.random().toString(36).slice(2, 6)}`,
    userId: 'test-user',
    eventName: 'practice.quiz_submitted',
    eventSource: 'web',
    payload: {},
    createdAt: d.toISOString(),
  };
}

describe('computeReviewWindows', () => {
  it('returns null when fewer than 6 events', () => {
    const events = [
      makeEvent(9, '2026-04-01'),
      makeEvent(10, '2026-04-02'),
    ];
    expect(computeReviewWindows(events)).toBeNull();
  });

  it('returns null when no events', () => {
    expect(computeReviewWindows([])).toBeNull();
  });

  it('filters out non-learning events', () => {
    const events: LearningEventRecord[] = Array.from({ length: 10 }, (_, i) => ({
      id: `e${i}`,
      userId: 'test-user',
      eventName: 'chat.ttft',
      eventSource: 'web' as const,
      payload: {},
      createdAt: `2026-04-0${(i % 5) + 1}T09:00:00Z`,
    }));
    expect(computeReviewWindows(events)).toBeNull();
  });

  it('identifies primary review window correctly', () => {
    // 8 events in the evening, 2 in the morning
    const events = [
      ...Array.from({ length: 8 }, (_, i) => makeEvent(19, `2026-04-0${i + 1}`)),
      makeEvent(8, '2026-04-01'),
      makeEvent(9, '2026-04-02'),
    ];

    const result = computeReviewWindows(events);
    expect(result).not.toBeNull();
    expect(result!.primary.id).toBe('evening');
    expect(result!.primary.eventCount).toBe(8);
  });

  it('identifies secondary window when present', () => {
    const events = [
      ...Array.from({ length: 5 }, (_, i) => makeEvent(9, `2026-04-0${i + 1}`)),
      ...Array.from({ length: 3 }, (_, i) => makeEvent(20, `2026-04-0${i + 1}`)),
    ];

    const result = computeReviewWindows(events);
    expect(result).not.toBeNull();
    expect(result!.secondary).not.toBeNull();
  });

  it('calculates share correctly', () => {
    const events = Array.from({ length: 10 }, (_, i) => makeEvent(15, `2026-04-0${(i % 5) + 1}`));

    const result = computeReviewWindows(events);
    expect(result).not.toBeNull();
    expect(result!.primary.share).toBeCloseTo(1.0, 1);
    expect(result!.totalEvents).toBe(10);
  });

  it('counts active days correctly', () => {
    const events = [
      makeEvent(9, '2026-04-01'),
      makeEvent(10, '2026-04-01'),
      makeEvent(9, '2026-04-02'),
      makeEvent(9, '2026-04-03'),
      makeEvent(9, '2026-04-04'),
      makeEvent(9, '2026-04-05'),
    ];

    const result = computeReviewWindows(events);
    expect(result).not.toBeNull();
    expect(result!.activeDays).toBe(5);
  });

  it('classifies late night hours correctly', () => {
    const events = [
      ...Array.from({ length: 4 }, (_, i) => makeEvent(23, `2026-04-0${i + 1}`)),
      ...Array.from({ length: 3 }, (_, i) => makeEvent(2, `2026-04-0${i + 1}`)),
    ];

    const result = computeReviewWindows(events);
    expect(result).not.toBeNull();
    expect(result!.primary.id).toBe('late_night');
  });
});

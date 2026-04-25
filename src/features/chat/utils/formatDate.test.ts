import { describe, expect, it } from 'vitest';

import { formatChatDate } from '@/features/chat/utils/formatDate';

const buildDate = (year: number, month: number, day: number, hour = 12, minute = 0): Date =>
  new Date(year, month - 1, day, hour, minute, 0, 0);

describe('formatChatDate', () => {
  it('returns the wall clock time when the timestamp is from today', () => {
    const now = buildDate(2026, 4, 25, 14, 30);
    const formatted = formatChatDate(buildDate(2026, 4, 25, 9, 15).getTime(), now);
    expect(formatted).toMatch(/^\d{2}:\d{2}$/);
  });

  it('returns 昨天 when the timestamp is exactly one day earlier', () => {
    const now = buildDate(2026, 4, 25, 14, 30);
    const yesterday = buildDate(2026, 4, 24, 9, 15);
    expect(formatChatDate(yesterday.getTime(), now)).toBe('昨天');
  });

  it('returns the weekday for entries within the last week', () => {
    const now = buildDate(2026, 4, 25, 14, 30); // Saturday
    const fourDaysAgo = buildDate(2026, 4, 21, 9, 15); // Tuesday
    expect(formatChatDate(fourDaysAgo.getTime(), now)).toBe('周二');
  });

  it('returns a localised month/day for older timestamps', () => {
    const now = buildDate(2026, 4, 25, 14, 30);
    const old = buildDate(2025, 12, 31, 9, 15).getTime();
    const formatted = formatChatDate(old, now);
    expect(formatted).not.toBe('昨天');
    expect(formatted).not.toMatch(/^\d{2}:\d{2}$/);
  });
});

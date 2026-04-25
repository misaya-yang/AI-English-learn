import { describe, expect, it } from 'vitest';

import type { ReviewQueueItem } from '@/features/coach/coachingPolicy';
import {
  classifyDueness,
  formatCoachReviewDueLabel,
  partitionCoachReviews,
} from './reviewRailLogic';

const item = (overrides: Partial<ReviewQueueItem>): ReviewQueueItem => ({
  id: overrides.id ?? `id_${Math.random().toString(36).slice(2, 8)}`,
  userInputRef: overrides.userInputRef,
  skill: overrides.skill ?? 'grammar',
  targetWord: overrides.targetWord,
  prompt: overrides.prompt ?? 'Practice the past perfect',
  dueAt: overrides.dueAt ?? new Date().toISOString(),
  sourceAction: overrides.sourceAction ?? 'schedule_review',
});

const NOW = new Date('2026-04-25T12:00:00.000Z');

describe('partitionCoachReviews', () => {
  it('returns empty buckets for falsy / empty input', () => {
    expect(partitionCoachReviews(undefined)).toEqual({ due: [], upcoming: [] });
    expect(partitionCoachReviews(null)).toEqual({ due: [], upcoming: [] });
    expect(partitionCoachReviews([])).toEqual({ due: [], upcoming: [] });
  });

  it('drops entries with non-string or non-finite dueAt', () => {
    const result = partitionCoachReviews(
      [
        item({ id: 'good', dueAt: '2026-04-25T11:30:00.000Z' }),
        // @ts-expect-error simulate corrupted entry
        item({ id: 'bad-shape', dueAt: 12345 }),
        item({ id: 'bad-string', dueAt: 'not-a-date' }),
      ],
      { now: NOW },
    );
    expect(result.due.map((entry) => entry.id)).toEqual(['good']);
    expect(result.upcoming).toEqual([]);
  });

  it('separates due from upcoming and sorts each ascending', () => {
    const result = partitionCoachReviews(
      [
        item({ id: 'newest-due', dueAt: '2026-04-25T11:55:00.000Z' }),
        item({ id: 'overdue-1d', dueAt: '2026-04-24T12:00:00.000Z' }),
        item({ id: 'tomorrow', dueAt: '2026-04-26T12:00:00.000Z' }),
        item({ id: 'next-week', dueAt: '2026-05-01T12:00:00.000Z' }),
        item({ id: 'on-cutoff', dueAt: NOW.toISOString() }),
      ],
      { now: NOW },
    );
    expect(result.due.map((entry) => entry.id)).toEqual(['overdue-1d', 'newest-due', 'on-cutoff']);
    expect(result.upcoming.map((entry) => entry.id)).toEqual(['tomorrow', 'next-week']);
  });

  it('caps the upcoming list to upcomingLimit', () => {
    const items = Array.from({ length: 8 }, (_, i) =>
      item({
        id: `item-${i}`,
        dueAt: new Date(NOW.getTime() + (i + 1) * 3_600_000).toISOString(),
      }),
    );
    const result = partitionCoachReviews(items, { now: NOW, upcomingLimit: 3 });
    expect(result.upcoming.map((entry) => entry.id)).toEqual(['item-0', 'item-1', 'item-2']);
  });
});

describe('classifyDueness', () => {
  it('buckets within ±30 minutes as "now"', () => {
    expect(classifyDueness(new Date(NOW.getTime() - 10 * 60_000).toISOString(), { now: NOW })).toBe('now');
    expect(classifyDueness(new Date(NOW.getTime() + 25 * 60_000).toISOString(), { now: NOW })).toBe('now');
  });
  it('returns "overdue" for >30 min past', () => {
    expect(classifyDueness(new Date(NOW.getTime() - 60 * 60_000).toISOString(), { now: NOW })).toBe('overdue');
  });
  it('returns "soon" within 24h, "later" beyond', () => {
    expect(classifyDueness(new Date(NOW.getTime() + 5 * 3_600_000).toISOString(), { now: NOW })).toBe('soon');
    expect(classifyDueness(new Date(NOW.getTime() + 48 * 3_600_000).toISOString(), { now: NOW })).toBe('later');
  });
  it('falls back to "later" for invalid dueAt', () => {
    expect(classifyDueness('garbage', { now: NOW })).toBe('later');
  });
});

describe('formatCoachReviewDueLabel', () => {
  it('returns Due now near the cutoff', () => {
    expect(
      formatCoachReviewDueLabel(new Date(NOW.getTime() + 10 * 60_000).toISOString(), { now: NOW }),
    ).toBe('Due now');
    expect(
      formatCoachReviewDueLabel(new Date(NOW.getTime() + 10 * 60_000).toISOString(), { now: NOW, language: 'zh-CN' }),
    ).toBe('即将到期');
  });

  it('formats overdue minutes / hours / days', () => {
    expect(
      formatCoachReviewDueLabel(new Date(NOW.getTime() - 45 * 60_000).toISOString(), { now: NOW }),
    ).toBe('Overdue 45 min');
    expect(
      formatCoachReviewDueLabel(new Date(NOW.getTime() - 5 * 3_600_000).toISOString(), { now: NOW }),
    ).toBe('Overdue 5h');
    expect(
      formatCoachReviewDueLabel(new Date(NOW.getTime() - 3 * 86_400_000).toISOString(), { now: NOW }),
    ).toBe('Overdue 3d');
  });

  it('formats due-in-the-future hours / days, falls back to date for >7 days', () => {
    expect(
      formatCoachReviewDueLabel(new Date(NOW.getTime() + 5 * 3_600_000).toISOString(), { now: NOW }),
    ).toBe('Due in 5h');
    expect(
      formatCoachReviewDueLabel(new Date(NOW.getTime() + 3 * 86_400_000).toISOString(), { now: NOW }),
    ).toBe('Due in 3d');
    const farFuture = new Date('2026-06-12T09:00:00.000Z');
    const label = formatCoachReviewDueLabel(farFuture.toISOString(), { now: NOW });
    // local-date formatting on the host machine — assert the date components.
    expect(label).toMatch(/Jun\s+12|6月12日/);
  });

  it('returns empty string for invalid input', () => {
    expect(formatCoachReviewDueLabel('not-a-date', { now: NOW })).toBe('');
  });

  it('uses Chinese phrasing when language is zh-*', () => {
    expect(
      formatCoachReviewDueLabel(new Date(NOW.getTime() - 5 * 3_600_000).toISOString(), { now: NOW, language: 'zh-CN' }),
    ).toBe('已过期 5 小时');
    expect(
      formatCoachReviewDueLabel(new Date(NOW.getTime() + 3 * 86_400_000).toISOString(), { now: NOW, language: 'zh-CN' }),
    ).toBe('3 天后到期');
  });
});

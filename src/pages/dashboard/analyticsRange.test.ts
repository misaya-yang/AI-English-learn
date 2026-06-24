import { describe, expect, it } from 'vitest';

import { filterStudySessionsByRange, getAnalyticsEventWindowDays } from './analyticsRange';

describe('analyticsRange', () => {
  it('does not cap the all-time analytics window to 365 days', () => {
    expect(getAnalyticsEventWindowDays('all')).toBeNull();
  });

  it('keeps study sessions that fall exactly on the yearly cutoff date', () => {
    const now = new Date('2026-04-28T10:00:00+08:00');

    const sessions = [
      {
        id: 'boundary',
        userId: 'user-1',
        date: '2025-04-28',
        wordsStudied: 5,
        wordsLearned: 2,
        xpEarned: 20,
        duration: 10,
      },
      {
        id: 'older',
        userId: 'user-1',
        date: '2025-04-27',
        wordsStudied: 3,
        wordsLearned: 1,
        xpEarned: 10,
        duration: 5,
      },
    ];

    expect(filterStudySessionsByRange(sessions, 'year', now).map((session) => session.id)).toEqual(['boundary']);
  });
});

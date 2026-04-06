import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getStudyPlan,
  saveStudyPlan,
  getMonthData,
  isStudyGoalMet,
  getStreakFromCalendar,
  requestNotificationPermission,
  scheduleReminder,
} from './reminderService';
import type { StudyDay, StudyPlan } from '@/features/calendar/types';

// ─── localStorage mock ────────────────────────────────────────────────────────

const storage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(storage).forEach((k) => delete storage[k]);
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => storage[k] ?? null,
    setItem: (k: string, v: string) => { storage[k] = v; },
    removeItem: (k: string) => { delete storage[k]; },
    clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─── getStudyPlan / saveStudyPlan ─────────────────────────────────────────────

describe('getStudyPlan', () => {
  it('returns default plan when nothing is stored', () => {
    const plan = getStudyPlan();
    expect(plan.dailyGoalMinutes).toBe(15);
    expect(plan.reminderEnabled).toBe(false);
    expect(plan.daysOfWeek).toHaveLength(7);
  });

  it('returns the saved plan after saveStudyPlan', () => {
    const plan: StudyPlan = {
      userId: 'u1',
      dailyGoalMinutes: 30,
      preferredTime: '20:00',
      daysOfWeek: [1, 3, 5],
      reminderEnabled: true,
    };
    saveStudyPlan(plan);
    expect(getStudyPlan()).toEqual(plan);
  });
});

// ─── getMonthData ─────────────────────────────────────────────────────────────

describe('getMonthData', () => {
  it('returns empty days array when no sessions exist', () => {
    const data = getMonthData(2026, 4);
    expect(data.year).toBe(2026);
    expect(data.month).toBe(4);
    expect(data.days).toHaveLength(0);
  });

  it('aggregates sessions within the requested month', () => {
    const sessions = [
      { date: '2026-04-01', minutesStudied: 10, wordsLearned: 5, wordsReviewed: 3, activitiesCompleted: ['review'] },
      { date: '2026-04-01', minutesStudied: 5, wordsLearned: 2, wordsReviewed: 0, activitiesCompleted: ['quiz'] },
      { date: '2026-04-02', minutesStudied: 8, wordsLearned: 4, wordsReviewed: 2, activitiesCompleted: ['listen'] },
      { date: '2026-03-31', minutesStudied: 20, wordsLearned: 10, wordsReviewed: 5, activitiesCompleted: [] },
    ];
    storage['vocabdaily_study_sessions'] = JSON.stringify(sessions);

    const data = getMonthData(2026, 4);
    expect(data.days).toHaveLength(2);

    const day1 = data.days.find((d) => d.date === '2026-04-01')!;
    expect(day1.minutesStudied).toBe(15);
    expect(day1.wordsLearned).toBe(7);
    expect(day1.activitiesCompleted).toContain('quiz');
  });
});

// ─── isStudyGoalMet ───────────────────────────────────────────────────────────

describe('isStudyGoalMet', () => {
  const plan: StudyPlan = {
    userId: 'u1',
    dailyGoalMinutes: 20,
    preferredTime: '08:00',
    daysOfWeek: [1, 2, 3, 4, 5],
    reminderEnabled: false,
  };

  it('returns true when minutes studied meets the goal', () => {
    const day: StudyDay = { date: '2026-04-06', minutesStudied: 20, wordsLearned: 0, wordsReviewed: 0, activitiesCompleted: [] };
    expect(isStudyGoalMet(day, plan)).toBe(true);
  });

  it('returns true when words were learned/reviewed even if time is short', () => {
    const day: StudyDay = { date: '2026-04-06', minutesStudied: 5, wordsLearned: 3, wordsReviewed: 0, activitiesCompleted: [] };
    expect(isStudyGoalMet(day, plan)).toBe(true);
  });

  it('returns false when no activity and minutes below goal', () => {
    const day: StudyDay = { date: '2026-04-06', minutesStudied: 0, wordsLearned: 0, wordsReviewed: 0, activitiesCompleted: [] };
    expect(isStudyGoalMet(day, plan)).toBe(false);
  });
});

// ─── getStreakFromCalendar ────────────────────────────────────────────────────

describe('getStreakFromCalendar', () => {
  it('returns 0 for empty days array', () => {
    expect(getStreakFromCalendar([])).toBe(0);
  });

  it('counts consecutive days correctly', () => {
    // Simulate today = 2026-04-06 by using dates in the past
    const today = new Date();
    const toLocal = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const makeDay = (daysAgo: number): StudyDay => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return {
        date: toLocal(d),
        minutesStudied: 10,
        wordsLearned: 5,
        wordsReviewed: 3,
        activitiesCompleted: ['review'],
      };
    };

    // 3 consecutive days ending today
    const days = [makeDay(2), makeDay(1), makeDay(0)];
    expect(getStreakFromCalendar(days)).toBe(3);
  });

  it('stops streak at a gap', () => {
    const today = new Date();
    const toLocal = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const makeDay = (daysAgo: number): StudyDay => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return { date: toLocal(d), minutesStudied: 10, wordsLearned: 5, wordsReviewed: 3, activitiesCompleted: [] };
    };
    // Gap at daysAgo=1 — only today counts
    const days = [makeDay(3), makeDay(0)];
    expect(getStreakFromCalendar(days)).toBe(1);
  });
});

// ─── requestNotificationPermission ───────────────────────────────────────────

describe('requestNotificationPermission', () => {
  it('returns "denied" when Notification API is unavailable', async () => {
    vi.stubGlobal('Notification', undefined);
    const result = await requestNotificationPermission();
    expect(result).toBe('denied');
  });

  it('returns "granted" when permission is already granted', async () => {
    vi.stubGlobal('Notification', { permission: 'granted', requestPermission: vi.fn() });
    const result = await requestNotificationPermission();
    expect(result).toBe('granted');
  });
});

// ─── scheduleReminder ────────────────────────────────────────────────────────

describe('scheduleReminder', () => {
  it('does not throw when Notification is undefined', () => {
    vi.stubGlobal('Notification', undefined);
    expect(() => scheduleReminder('Study time!', 'Review your words')).not.toThrow();
  });

  it('fires a Notification immediately when permission is granted and delayMs=0', () => {
    const mockNotification = vi.fn();
    vi.stubGlobal('Notification', Object.assign(mockNotification, { permission: 'granted' }));
    scheduleReminder('Study time!', 'Review your words', 0);
    expect(mockNotification).toHaveBeenCalledWith('Study time!', expect.objectContaining({ body: 'Review your words' }));
  });
});

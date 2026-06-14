import { describe, expect, it } from 'vitest';

import {
  buildLifecycleNotification,
  getNextReminderDelayMs,
  isInQuietHours,
  type LifecycleNotificationInput,
} from './lifecycleNotifications';

const baseInput = (overrides: Partial<LifecycleNotificationInput> = {}): LifecycleNotificationInput => ({
  notificationsEnabled: true,
  lifecycleEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  now: new Date('2026-06-13T18:00:00'),
  todayCompleted: false,
  dueWordsCount: 0,
  reviewDebtSignals: 0,
  currentStreak: 0,
  hasActivityToday: false,
  examWeekBoost: false,
  examTargetActive: false,
  weeklyRecapReady: false,
  weeklyRecapViewed: false,
  ...overrides,
});

describe('lifecycleNotifications', () => {
  it('suppresses reminders when disabled, quiet, or already completed', () => {
    expect(buildLifecycleNotification(baseInput({ lifecycleEnabled: false, dueWordsCount: 20 }))).toBeNull();
    expect(buildLifecycleNotification(baseInput({
      now: new Date('2026-06-13T23:00:00'),
      dueWordsCount: 20,
    }))).toBeNull();
    expect(buildLifecycleNotification(baseInput({ todayCompleted: true, dueWordsCount: 20 }))).toBeNull();
  });

  it('prioritizes rising review debt and routes to Review', () => {
    const notification = buildLifecycleNotification(baseInput({
      dueWordsCount: 6,
      reviewDebtSignals: 4,
      examTargetActive: true,
    }));

    expect(notification).toMatchObject({
      kind: 'review_debt',
      href: '/dashboard/review',
      priority: 'high',
    });
    expect(notification?.bodyZh).toContain('10 个复习信号');
  });

  it('surfaces exam-week plan nudges when review debt is not urgent', () => {
    const notification = buildLifecycleNotification(baseInput({
      dueWordsCount: 2,
      examWeekBoost: true,
    }));

    expect(notification).toMatchObject({
      kind: 'exam_week',
      href: '/dashboard/today?focus=exam-week',
    });
  });

  it('surfaces streak risk only late in the day when no activity happened', () => {
    expect(buildLifecycleNotification(baseInput({
      now: new Date('2026-06-13T11:00:00'),
      currentStreak: 4,
      hasActivityToday: false,
    }))).toBeNull();

    expect(buildLifecycleNotification(baseInput({
      now: new Date('2026-06-13T18:00:00'),
      currentStreak: 4,
      hasActivityToday: false,
    }))).toMatchObject({
      kind: 'streak_risk',
      href: '/dashboard/today',
    });
  });

  it('uses weekly recap as a low-priority nudge', () => {
    const notification = buildLifecycleNotification(baseInput({ weeklyRecapReady: true }));

    expect(notification).toMatchObject({
      kind: 'weekly_recap',
      href: '/dashboard/analytics',
      priority: 'low',
    });
  });

  it('handles quiet hours that cross midnight', () => {
    expect(isInQuietHours(new Date('2026-06-13T23:30:00'), '22:00', '07:00')).toBe(true);
    expect(isInQuietHours(new Date('2026-06-13T06:30:00'), '22:00', '07:00')).toBe(true);
    expect(isInQuietHours(new Date('2026-06-13T12:00:00'), '22:00', '07:00')).toBe(false);
  });

  it('computes the next one-shot reminder delay', () => {
    expect(getNextReminderDelayMs(new Date('2026-06-13T18:30:00'), 20)).toBe(90 * 60 * 1000);
    expect(getNextReminderDelayMs(new Date('2026-06-13T21:00:00'), 20)).toBe(23 * 60 * 60 * 1000);
  });
});

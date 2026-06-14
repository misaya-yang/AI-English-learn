export type LifecycleNotificationKind =
  | 'review_debt'
  | 'streak_risk'
  | 'exam_week'
  | 'weekly_recap';

export interface LifecycleNotification {
  kind: LifecycleNotificationKind;
  title: string;
  titleZh: string;
  body: string;
  bodyZh: string;
  href: string;
  priority: 'high' | 'medium' | 'low';
}

export interface LifecycleNotificationInput {
  notificationsEnabled: boolean;
  lifecycleEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  now: Date;
  todayCompleted: boolean;
  dueWordsCount: number;
  reviewDebtSignals?: number;
  currentStreak: number;
  hasActivityToday: boolean;
  examWeekBoost: boolean;
  examTargetActive: boolean;
  weeklyRecapReady: boolean;
  weeklyRecapViewed?: boolean;
}

const MINUTES_PER_DAY = 24 * 60;

const toMinutes = (value: string): number | null => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

export function isInQuietHours(now: Date, quietHoursStart: string, quietHoursEnd: string): boolean {
  const start = toMinutes(quietHoursStart);
  const end = toMinutes(quietHoursEnd);
  if (start === null || end === null || start === end) return false;

  const minutes = now.getHours() * 60 + now.getMinutes();
  if (start < end) {
    return minutes >= start && minutes < end;
  }

  return minutes >= start || minutes < end;
}

export function buildLifecycleNotification(input: LifecycleNotificationInput): LifecycleNotification | null {
  if (!input.notificationsEnabled || !input.lifecycleEnabled) return null;
  if (isInQuietHours(input.now, input.quietHoursStart, input.quietHoursEnd)) return null;
  if (input.todayCompleted) return null;

  const debtSignals = input.dueWordsCount + (input.reviewDebtSignals ?? 0);
  if (debtSignals >= 8) {
    return {
      kind: 'review_debt',
      title: 'Review debt is rising',
      titleZh: '复习债正在上升',
      body: `${debtSignals} review signals need attention. Clear reviews before adding new words.`,
      bodyZh: `有 ${debtSignals} 个复习信号需要处理。先清复习，再加新词。`,
      href: '/dashboard/review',
      priority: 'high',
    };
  }

  if (input.examWeekBoost || input.examTargetActive) {
    return {
      kind: 'exam_week',
      title: 'Exam plan checkpoint',
      titleZh: '考试计划检查点',
      body: 'Keep today focused: one scored drill, one review block, then stop.',
      bodyZh: '今天聚焦：一次评分练习、一组复习，然后收住。',
      href: '/dashboard/today?focus=exam-week',
      priority: 'medium',
    };
  }

  if (input.currentStreak > 0 && !input.hasActivityToday && input.now.getHours() >= 17) {
    return {
      kind: 'streak_risk',
      title: 'Protect your streak gently',
      titleZh: '轻量保住连续学习',
      body: 'A five-minute Today task is enough to keep your streak alive.',
      bodyZh: '做一个 5 分钟 Today 任务，就够保住连续学习。',
      href: '/dashboard/today',
      priority: 'medium',
    };
  }

  if (input.weeklyRecapReady && !input.weeklyRecapViewed) {
    return {
      kind: 'weekly_recap',
      title: 'Weekly recap is ready',
      titleZh: '本周总结已准备好',
      body: 'Review what improved, what is still noisy, and what to do next.',
      bodyZh: '看看本周哪里进步、哪里还不稳，以及下一步做什么。',
      href: '/dashboard/analytics',
      priority: 'low',
    };
  }

  return null;
}

export function getNextReminderDelayMs(now: Date, hour: number): number {
  const next = new Date(now);
  next.setHours(hour, 0, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return Math.max(0, Math.min(next.getTime() - now.getTime(), MINUTES_PER_DAY * 60 * 1000));
}

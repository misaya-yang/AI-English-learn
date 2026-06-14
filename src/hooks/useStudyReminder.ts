/**
 * Study reminder hook
 * – Requests browser notification permission
 * – Stores a preferred reminder hour in localStorage
 * – Schedules a one-shot Notification for the next occurrence of that hour
 */
import { useState, useEffect, useCallback } from 'react';
import { getNextReminderDelayMs } from '@/features/learning/lifecycleNotifications';

const STORAGE_KEY = 'vocabdaily-reminder-hour';

export interface StudyReminderNotification {
  title: string;
  body: string;
  tag?: string;
  href?: string;
}

interface UseStudyReminderOptions {
  schedule?: boolean;
}

const DEFAULT_REMINDER: StudyReminderNotification = {
  title: 'VocabDaily — 该复习了！',
  body: '今天的词汇任务等着你，保持连续学习势头！',
  tag: 'vocabdaily-reminder',
  href: '/dashboard/today',
};

export type ReminderPermission = 'granted' | 'denied' | 'default' | 'unsupported';

export function useStudyReminder(
  reminder: StudyReminderNotification | null | undefined = DEFAULT_REMINDER,
  options: UseStudyReminderOptions = {},
) {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
  const shouldSchedule = options.schedule ?? true;
  const [permission, setPermission] = useState<ReminderPermission>(
    isSupported ? (Notification.permission as ReminderPermission) : 'unsupported',
  );
  const [reminderHour, setReminderHour] = useState<number | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw !== null ? Number(raw) : null;
  });

  const requestPermission = useCallback(async (): Promise<ReminderPermission> => {
    if (!isSupported) return 'unsupported';
    const result = await Notification.requestPermission();
    setPermission(result as ReminderPermission);
    return result as ReminderPermission;
  }, [isSupported]);

  const saveReminderHour = useCallback((hour: number | null) => {
    if (hour === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, String(hour));
    }
    setReminderHour(hour);
  }, []);

  // Schedule the next notification whenever hour or permission changes
  useEffect(() => {
    if (!shouldSchedule || !isSupported || permission !== 'granted' || reminderHour === null || reminder === null) return;

    const notification = reminder ?? DEFAULT_REMINDER;
    const delay = getNextReminderDelayMs(new Date(), reminderHour);
    const timerId = window.setTimeout(() => {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.svg',
        tag: notification.tag ?? 'vocabdaily-reminder',
        data: notification.href ? { href: notification.href } : undefined,
      });
    }, delay);

    return () => window.clearTimeout(timerId);
  }, [isSupported, permission, reminder, reminderHour, shouldSchedule]);

  return {
    isSupported,
    permission,
    reminderHour,
    requestPermission,
    saveReminderHour,
  };
}

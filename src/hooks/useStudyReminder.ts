/**
 * Study reminder hook
 * – Requests browser notification permission
 * – Stores a preferred reminder hour in localStorage
 * – Schedules a one-shot Notification for the next occurrence of that hour
 */
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'vocabdaily-reminder-hour';

function getNextOccurrence(hour: number): number {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, 0, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

export type ReminderPermission = 'granted' | 'denied' | 'default' | 'unsupported';

export function useStudyReminder() {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
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
    if (!isSupported || permission !== 'granted' || reminderHour === null) return;

    const delay = getNextOccurrence(reminderHour);
    const timerId = window.setTimeout(() => {
      new Notification('VocabDaily — 该复习了！🔥', {
        body: '今天的词汇任务等着你，保持连续学习势头！',
        icon: '/favicon.svg',
        tag: 'vocabdaily-reminder',
      });
    }, delay);

    return () => window.clearTimeout(timerId);
  }, [isSupported, permission, reminderHour]);

  return {
    isSupported,
    permission,
    reminderHour,
    requestPermission,
    saveReminderHour,
  };
}

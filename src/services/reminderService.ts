/**
 * S23 – Study Calendar & Reminders
 *
 * Manages study plans, calendar data derived from localStorage sessions,
 * streak calculation, and Web Push / Notification API wrappers.
 */

import type { StudyDay, StudyPlan, MonthData } from '@/features/calendar/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const STUDY_PLAN_KEY = 'vocabdaily_study_plan';
const SESSIONS_KEY = 'vocabdaily_study_sessions';

// ─── Study Plan ───────────────────────────────────────────────────────────────

/** Returns the stored study plan or sensible defaults. */
export function getStudyPlan(): StudyPlan {
  try {
    const raw = localStorage.getItem(STUDY_PLAN_KEY);
    if (raw) return JSON.parse(raw) as StudyPlan;
  } catch {
    // ignore parse errors
  }
  return {
    userId: '',
    dailyGoalMinutes: 15,
    preferredTime: '08:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    reminderEnabled: false,
  };
}

/** Persists a study plan to localStorage. */
export function saveStudyPlan(plan: StudyPlan): void {
  localStorage.setItem(STUDY_PLAN_KEY, JSON.stringify(plan));
}

// ─── Session Storage Helpers ──────────────────────────────────────────────────

export interface StudySession {
  date: string; // ISO date "YYYY-MM-DD"
  minutesStudied: number;
  wordsLearned: number;
  wordsReviewed: number;
  activitiesCompleted: string[];
}

function getSessions(): StudySession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) return JSON.parse(raw) as StudySession[];
  } catch {
    // ignore
  }
  return [];
}

// ─── Month Data ───────────────────────────────────────────────────────────────

/**
 * Aggregates stored study sessions into a MonthData structure.
 * Days without any session are omitted from the `days` array.
 */
export function getMonthData(year: number, month: number): MonthData {
  const sessions = getSessions();
  const prefix = `${year}-${String(month).padStart(2, '0')}`;

  // Aggregate by date (there may be multiple sessions per day)
  const map = new Map<string, StudyDay>();
  for (const s of sessions) {
    if (!s.date.startsWith(prefix)) continue;
    const existing = map.get(s.date);
    if (existing) {
      existing.minutesStudied += s.minutesStudied;
      existing.wordsLearned += s.wordsLearned;
      existing.wordsReviewed += s.wordsReviewed;
      existing.activitiesCompleted.push(...s.activitiesCompleted);
    } else {
      map.set(s.date, {
        date: s.date,
        minutesStudied: s.minutesStudied,
        wordsLearned: s.wordsLearned,
        wordsReviewed: s.wordsReviewed,
        activitiesCompleted: [...s.activitiesCompleted],
      });
    }
  }

  return { year, month, days: Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date)) };
}

// ─── Goal Check ───────────────────────────────────────────────────────────────

/**
 * Returns true when the given StudyDay meets or exceeds the plan's daily goal.
 * A day is considered "met" when either the minute goal is reached OR at
 * least one word was learned/reviewed (for very short sessions).
 */
export function isStudyGoalMet(day: StudyDay, plan: StudyPlan): boolean {
  return (
    day.minutesStudied >= plan.dailyGoalMinutes ||
    day.wordsLearned + day.wordsReviewed > 0
  );
}

// ─── Streak ───────────────────────────────────────────────────────────────────

/**
 * Counts consecutive days (ending today or yesterday) that have any activity,
 * using the days array from a MonthData or a flat list of StudyDay objects.
 *
 * @param days - Sorted ascending array of StudyDay objects (may span months).
 */
export function getStreakFromCalendar(days: StudyDay[]): number {
  if (days.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeDates = new Set(days.filter((d) => d.wordsLearned + d.wordsReviewed + d.minutesStudied > 0).map((d) => d.date));

  let streak = 0;
  const cursor = new Date(today);

  // If today has no activity yet, allow the streak to start from yesterday
  if (!activeDates.has(toISODate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    // If yesterday also has no activity, the streak is 0
    if (!activeDates.has(toISODate(cursor))) return 0;
  }

  while (activeDates.has(toISODate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─── Notifications ────────────────────────────────────────────────────────────

/**
 * Requests permission to show browser notifications.
 * Returns the resulting permission state, or 'denied' in environments where
 * the Notification API is unavailable.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}

/**
 * Schedules a one-shot reminder notification.
 * In production you would use a Service Worker + Push API; here we use a
 * simple `setTimeout` + `Notification` as a lightweight approximation.
 *
 * @param title   - Notification title
 * @param body    - Notification body text
 * @param delayMs - Milliseconds from now (default: 0 = immediate)
 */
export function scheduleReminder(title: string, body: string, delayMs = 0): void {
  if (typeof Notification === 'undefined') return;

  const fire = () => {
    if (Notification.permission === 'granted') {
      // eslint-disable-next-line no-new
      new Notification(title, { body, icon: '/pwa-192x192.png' });
    }
  };

  if (delayMs <= 0) {
    fire();
  } else {
    setTimeout(fire, delayMs);
  }
}

import type { StudySession } from '@/data/localStorage';

export type AnalyticsTimeRange = 'week' | 'month' | 'year' | 'all';

const toLocalIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getAnalyticsEventWindowDays = (timeRange: AnalyticsTimeRange): number | null => {
  if (timeRange === 'all') return null;
  if (timeRange === 'year') return 365;
  if (timeRange === 'month') return 30;
  return 7;
};

export const getAnalyticsCutoffDate = (
  timeRange: AnalyticsTimeRange,
  now: Date = new Date(),
): Date | null => {
  const days = getAnalyticsEventWindowDays(timeRange);
  if (days === null) return null;

  const cutoff = new Date(now);
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
};

export const filterStudySessionsByRange = (
  sessions: StudySession[],
  timeRange: AnalyticsTimeRange,
  now: Date = new Date(),
): StudySession[] => {
  const cutoff = getAnalyticsCutoffDate(timeRange, now);
  if (!cutoff) return sessions;

  const cutoffIso = toLocalIsoDate(cutoff);
  return sessions.filter((session) => session.date >= cutoffIso);
};

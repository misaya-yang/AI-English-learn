import type { LearningEventRecord } from '@/services/learningEvents';

export interface ReviewWindowScore {
  id: 'morning' | 'midday' | 'afternoon' | 'evening' | 'late_night';
  label: string;
  labelZh: string;
  hours: string;
  eventCount: number;
  activeDays: number;
  share: number;
  score: number;
}

export interface ReviewWindowInsight {
  primary: ReviewWindowScore;
  secondary: ReviewWindowScore | null;
  totalEvents: number;
  activeDays: number;
}

const WINDOW_DEFS: Array<{
  id: ReviewWindowScore['id'];
  label: string;
  labelZh: string;
  hours: string;
  matcher: (hour: number) => boolean;
}> = [
  { id: 'morning', label: 'Morning review', labelZh: '上午复习', hours: '06:00-10:59', matcher: (hour) => hour >= 6 && hour <= 10 },
  { id: 'midday', label: 'Midday reset', labelZh: '中午回顾', hours: '11:00-13:59', matcher: (hour) => hour >= 11 && hour <= 13 },
  { id: 'afternoon', label: 'Afternoon block', labelZh: '下午专注段', hours: '14:00-17:59', matcher: (hour) => hour >= 14 && hour <= 17 },
  { id: 'evening', label: 'Evening focus', labelZh: '晚间高效段', hours: '18:00-21:59', matcher: (hour) => hour >= 18 && hour <= 21 },
  { id: 'late_night', label: 'Late-night catch-up', labelZh: '夜间补课段', hours: '22:00-05:59', matcher: (hour) => hour >= 22 || hour <= 5 },
];

const NON_LEARNING_EVENTS = new Set([
  'chat.ttft',
  'chat.quiz_next_latency',
  'chat.fast_path_hit',
]);

const resolveWindow = (hour: number) =>
  WINDOW_DEFS.find((windowDef) => windowDef.matcher(hour)) || WINDOW_DEFS[0];

export const computeReviewWindows = (
  events: LearningEventRecord[],
): ReviewWindowInsight | null => {
  const relevantEvents = events.filter((event) => !NON_LEARNING_EVENTS.has(event.eventName));
  if (relevantEvents.length < 6) return null;

  const activeDays = new Set(relevantEvents.map((event) => event.createdAt.slice(0, 10)));
  const windowMap = new Map(
    WINDOW_DEFS.map((windowDef) => [
      windowDef.id,
      {
        ...windowDef,
        eventCount: 0,
        activeDaySet: new Set<string>(),
      },
    ]),
  );

  relevantEvents.forEach((event) => {
    const date = new Date(event.createdAt);
    const windowDef = resolveWindow(date.getHours());
    const bucket = windowMap.get(windowDef.id);
    if (!bucket) return;
    bucket.eventCount += 1;
    bucket.activeDaySet.add(event.createdAt.slice(0, 10));
  });

  const totalEvents = relevantEvents.length;
  const ranked = Array.from(windowMap.values())
    .map<ReviewWindowScore>((bucket) => {
      const days = bucket.activeDaySet.size;
      const share = totalEvents > 0 ? bucket.eventCount / totalEvents : 0;
      return {
        id: bucket.id,
        label: bucket.label,
        labelZh: bucket.labelZh,
        hours: bucket.hours,
        eventCount: bucket.eventCount,
        activeDays: days,
        share,
        score: bucket.eventCount * 1.2 + days * 2 + share * 10,
      };
    })
    .filter((bucket) => bucket.eventCount > 0)
    .sort((left, right) => right.score - left.score);

  if (ranked.length === 0) return null;

  return {
    primary: ranked[0],
    secondary: ranked[1] || null,
    totalEvents,
    activeDays: activeDays.size,
  };
};

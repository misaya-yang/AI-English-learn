import { supabase } from '@/lib/supabase';
import { getStudySessions } from '@/data/localStorage';
import type { LearningEventName } from '@/types/examContent';

export interface LearningEventRecord {
  id: string;
  userId: string;
  eventName: LearningEventName | string;
  eventSource: 'web' | 'mobile' | 'edge' | 'local';
  sessionId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface WeeklyActivityPoint {
  day: string;
  date: string;
  words: number;
  xp: number;
  minutes: number;
  events: number;
}

const LOCAL_EVENTS_KEY = 'vocabdaily_learning_events_local';
const MAX_LOCAL_EVENTS = 2000;

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

const labelForDay = (date: Date): string =>
  date.toLocaleDateString('en-US', { weekday: 'short' });

const getLocalEvents = (): LearningEventRecord[] => {
  try {
    const raw = localStorage.getItem(LOCAL_EVENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LearningEventRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const setLocalEvents = (events: LearningEventRecord[]): void => {
  localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events.slice(0, MAX_LOCAL_EVENTS)));
};

const dedupeEvents = (events: LearningEventRecord[]): LearningEventRecord[] => {
  const seen = new Set<string>();
  const unique: LearningEventRecord[] = [];

  events
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .forEach((event) => {
      const key = `${event.id}:${event.eventName}:${event.createdAt}`;
      if (seen.has(key)) return;
      seen.add(key);
      unique.push(event);
    });

  return unique;
};

const toStandardEventName = (eventName: string): LearningEventName | string => {
  const mapping: Record<string, LearningEventName> = {
    chat_message_sent: 'chat.message_sent',
    chat_reply_received: 'chat.reply_received',
    quiz_attempt_submitted: 'chat.quiz_attempted',
    chat_ttft: 'chat.ttft',
    chat_quiz_next_latency: 'chat.quiz_next_latency',
    chat_fast_path_hit: 'chat.fast_path_hit',
  };

  return mapping[eventName] || eventName;
};

export const recordLearningEvent = async (args: {
  userId: string;
  eventName: LearningEventName | string;
  payload?: Record<string, unknown>;
  sessionId?: string;
  eventSource?: 'web' | 'mobile' | 'edge' | 'local';
}): Promise<void> => {
  const event: LearningEventRecord = {
    id: crypto.randomUUID(),
    userId: args.userId,
    eventName: toStandardEventName(args.eventName),
    eventSource: args.eventSource || 'web',
    sessionId: args.sessionId,
    payload: args.payload || {},
    createdAt: new Date().toISOString(),
  };

  const local = dedupeEvents([event, ...getLocalEvents()]);
  setLocalEvents(local);

  try {
    await supabase.from('learning_events').insert({
      id: event.id,
      user_id: event.userId,
      event_name: event.eventName,
      event_source: event.eventSource,
      session_id: event.sessionId || null,
      payload: event.payload,
      created_at: event.createdAt,
    });
  } catch {
    // Keep local cache only.
  }
};

export const completeMissionTaskEvent = async (args: {
  userId: string;
  missionId: string;
  taskId: string;
  taskType: string;
}): Promise<void> => {
  await recordLearningEvent({
    userId: args.userId,
    eventName: 'mission.task_completed',
    payload: {
      missionId: args.missionId,
      taskId: args.taskId,
      taskType: args.taskType,
    },
  });
};

export const getLearningEvents = async (userId: string, days = 30): Promise<LearningEventRecord[]> => {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const local = getLocalEvents().filter(
    (event) => event.userId === userId && new Date(event.createdAt).getTime() >= cutoff,
  );

  try {
    const fromIso = new Date(cutoff).toISOString();
    const { data, error } = await supabase
      .from('learning_events')
      .select('id,user_id,event_name,event_source,session_id,payload,created_at')
      .eq('user_id', userId)
      .gte('created_at', fromIso)
      .order('created_at', { ascending: false })
      .limit(1500);

    if (error) {
      return dedupeEvents(local);
    }

    const remote: LearningEventRecord[] = (data || []).map((rawRow) => {
      const row = rawRow as {
        id?: string;
        user_id?: string;
        event_name?: string;
        event_source?: string;
        session_id?: string | null;
        payload?: Record<string, unknown>;
        created_at?: string;
      };

      return {
        id: String(row.id || crypto.randomUUID()),
        userId: String(row.user_id || userId),
        eventName: String(row.event_name || 'chat.message_sent'),
        eventSource: (row.event_source || 'web') as LearningEventRecord['eventSource'],
        sessionId: row.session_id ? String(row.session_id) : undefined,
        payload: (row.payload || {}) as Record<string, unknown>,
        createdAt: String(row.created_at || new Date().toISOString()),
      };
    });

    const merged = dedupeEvents([...remote, ...local]);
    setLocalEvents(dedupeEvents([...merged, ...getLocalEvents()]));
    return merged;
  } catch {
    return dedupeEvents(local);
  }
};

export const getWeeklyActivity = async (userId: string): Promise<WeeklyActivityPoint[]> => {
  const sessions = getStudySessions(userId);
  const events = await getLearningEvents(userId, 14);

  const result: WeeklyActivityPoint[] = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    const iso = toIsoDate(date);

    const sessionRows = sessions.filter((session) => session.date === iso);
    const eventRows = events.filter((event) => event.createdAt.slice(0, 10) === iso);

    result.push({
      day: labelForDay(date),
      date: iso,
      words: sessionRows.reduce((sum, row) => sum + row.wordsLearned, 0),
      xp: sessionRows.reduce((sum, row) => sum + row.xpEarned, 0),
      minutes: sessionRows.reduce((sum, row) => sum + row.duration, 0),
      events: eventRows.length,
    });
  }

  return result;
};

export const getHeatmapData = async (
  userId: string,
): Promise<Array<{ week: number; day: number; value: number }>> => {
  const events = await getLearningEvents(userId, 365);
  const sessions = getStudySessions(userId);
  const mergedMap = new Map<string, number>();

  events.forEach((event) => {
    const key = event.createdAt.slice(0, 10);
    mergedMap.set(key, (mergedMap.get(key) || 0) + 1);
  });

  sessions.forEach((session) => {
    const key = session.date;
    mergedMap.set(key, (mergedMap.get(key) || 0) + Math.max(1, session.wordsStudied));
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result: Array<{ week: number; day: number; value: number }> = [];

  for (let week = 0; week < 52; week += 1) {
    for (let day = 0; day < 7; day += 1) {
      const d = new Date(today);
      const offset = week * 7 + (6 - day);
      d.setDate(today.getDate() - offset);
      const iso = toIsoDate(d);
      const raw = mergedMap.get(iso) || 0;
      const intensity = raw === 0 ? 0 : raw < 3 ? 1 : raw < 6 ? 2 : raw < 10 ? 3 : 4;
      result.push({ week: 51 - week, day, value: intensity });
    }
  }

  return result;
};

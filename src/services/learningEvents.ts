import { supabase } from '@/lib/supabase';
import { getStudySessions } from '@/data/localStorage';
import {
  addEvent as addEventToLocalDb,
  getEventsForUser,
  pruneEvents,
  putLearningEvent,
  getLearningEventsForUser,
  type LearningEventRecord as StrictLearningEventRecord,
} from '@/lib/localDb';
import type { LearningEventName } from '@/types/examContent';
import { buildIdempotencyKey, syncQueue } from '@/services/syncQueue';
import { isLocalAuthUserId } from '@/lib/localAuthIdentity';

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

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

const labelForDay = (date: Date): string =>
  date.toLocaleDateString('en-US', { weekday: 'short' });

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

  await addEventToLocalDb(
    event.userId,
    event.id,
    event.eventName,
    {
      eventSource: event.eventSource,
      sessionId: event.sessionId,
      ...event.payload,
    },
  );
  void pruneEvents();

  if (isLocalAuthUserId(event.userId)) {
    return;
  }

  try {
    const payload = {
      id: event.id,
      user_id: event.userId,
      event_name: event.eventName,
      event_source: event.eventSource,
      session_id: event.sessionId || null,
      payload: event.payload,
      created_at: event.createdAt,
    };

    const { error } = await supabase.from('learning_events').upsert(payload, { onConflict: 'id' });
    if (error) throw error;

    await addEventToLocalDb(
      event.userId,
      event.id,
      event.eventName,
      {
        eventSource: event.eventSource,
        sessionId: event.sessionId,
        ...event.payload,
      },
      true,
    );
  } catch {
    await syncQueue.enqueue({
      table: 'learning_events',
      operation: 'upsert',
      payload: {
        id: event.id,
        user_id: event.userId,
        event_name: event.eventName,
        event_source: event.eventSource,
        session_id: event.sessionId || null,
        payload: event.payload,
        created_at: event.createdAt,
      },
      idempotency_key: buildIdempotencyKey('learning_events', { id: event.id }),
    });
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
  const localRows = await getEventsForUser(userId, 2500);
  const local = localRows
    .map((row) => ({
      id: row.event_id,
      userId: row.user_id,
      eventName: row.event_name,
      eventSource: (typeof row.payload.eventSource === 'string' ? row.payload.eventSource : 'web') as LearningEventRecord['eventSource'],
      sessionId: typeof row.payload.sessionId === 'string' ? row.payload.sessionId : undefined,
      payload: Object.fromEntries(
        Object.entries(row.payload).filter(([key]) => key !== 'eventSource' && key !== 'sessionId'),
      ),
      createdAt: row.created_at,
    }))
    .filter((event) => new Date(event.createdAt).getTime() >= cutoff);

  if (isLocalAuthUserId(userId)) {
    return dedupeEvents(local);
  }

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

// ── LEARN-02 strict typed event model ───────────────────────────────────────
//
// The freeform `recordLearningEvent` above is the analytics layer (free
// `event_name` strings, used by chat/quiz/etc telemetry). The model below
// is the strict, narrow contract that LearningPath / Today / mission
// surfaces depend on. Pure consumer of the IDB `learning_events` store
// added in DB v6 — sync target is the `path_progress_events` table so we
// don't collide with the analytics writers above.

export type LearningEventKind = StrictLearningEventRecord['kind'];

export interface LearningEvent {
  id: string;
  user_id: string;
  kind: LearningEventKind;
  payload?: Record<string, unknown>;
  created_at: string;
}

const newEventId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `evt_${crypto.randomUUID()}`;
  }
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

export interface RecordEventInput {
  kind: LearningEventKind;
  payload?: Record<string, unknown>;
  /** Override `created_at` — used by tests. Defaults to now(). */
  createdAt?: string;
}

export async function recordEvent(
  userId: string,
  input: RecordEventInput,
): Promise<LearningEvent> {
  const event: LearningEvent = {
    id: newEventId(),
    user_id: userId,
    kind: input.kind,
    payload: input.payload || {},
    created_at: input.createdAt || new Date().toISOString(),
  };

  await putLearningEvent(event as StrictLearningEventRecord);

  try {
    await syncQueue.enqueue({
      table: 'path_progress_events',
      operation: 'upsert',
      payload: {
        id: event.id,
        user_id: event.user_id,
        kind: event.kind,
        payload: event.payload,
        created_at: event.created_at,
      },
      idempotency_key: buildIdempotencyKey('path_progress_events', { id: event.id }),
    });
  } catch (err) {
    // Sync queue failure should never block the local write.
    console.warn('[learningEvents] enqueue failed:', err);
  }

  return event;
}

export async function getEvents(
  userId: string,
  filter?: { kind?: LearningEventKind; since?: string },
): Promise<LearningEvent[]> {
  const rows = await getLearningEventsForUser(userId, filter);
  return rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    kind: row.kind,
    payload: row.payload,
    created_at: row.created_at,
  }));
}

export interface PathProgressDerived {
  reviewsCompleted: number;
  practiceCorrect: number;
  practiceWrong: number;
  mistakesResolved: number;
  sessions: number;
}

export function derivePathProgress(events: readonly LearningEvent[]): PathProgressDerived {
  const result: PathProgressDerived = {
    reviewsCompleted: 0,
    practiceCorrect: 0,
    practiceWrong: 0,
    mistakesResolved: 0,
    sessions: 0,
  };

  for (const event of events) {
    switch (event.kind) {
      case 'review_completed':
        result.reviewsCompleted += 1;
        break;
      case 'practice_correct':
        result.practiceCorrect += 1;
        break;
      case 'practice_wrong':
        result.practiceWrong += 1;
        break;
      case 'mistake_resolved':
        result.mistakesResolved += 1;
        break;
      case 'session_ended':
        result.sessions += 1;
        break;
      default:
        break;
    }
  }

  return result;
}

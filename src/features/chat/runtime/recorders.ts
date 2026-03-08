import { supabase } from '@/lib/supabase';
import { recordLearningEvent } from '@/services/learningEvents';

const CHAT_EXPERIMENT_EVENTS_STORAGE_KEY = 'vocabdaily-chat-experiment-events';

const normalizeExperimentEventName = (eventName: string): string =>
  eventName
    .replace(/_/g, '.')
    .replace('quiz.attempt.submitted', 'chat.quiz_attempted')
    .replace('chat.message.sent', 'chat.message_sent')
    .replace('chat.reply.received', 'chat.reply_received');

export function appendExperimentEventLocal(eventName: string, payload: Record<string, unknown>): void {
  try {
    const raw = localStorage.getItem(CHAT_EXPERIMENT_EVENTS_STORAGE_KEY);
    const base = raw ? (JSON.parse(raw) as Array<Record<string, unknown>>) : [];
    const next = [
      {
        id: crypto.randomUUID(),
        eventName,
        payload,
        createdAt: new Date().toISOString(),
      },
      ...base,
    ].slice(0, 500);
    localStorage.setItem(CHAT_EXPERIMENT_EVENTS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore local event cache failures.
  }
}

export async function trackChatExperimentAndLearningEvent(args: {
  userId: string;
  eventName: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const normalizedEventName = normalizeExperimentEventName(args.eventName);
  appendExperimentEventLocal(args.eventName, args.payload);

  try {
    await supabase.from('chat_experiment_events').insert({
      user_id: args.userId,
      event_name: normalizedEventName,
      event_payload_json: args.payload,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Optional table may not exist yet. Keep local events only.
  }

  await recordLearningEvent({
    userId: args.userId,
    eventName: normalizedEventName,
    payload: args.payload,
  });
}

import type { ChatArtifact } from '@/types/chatAgent';
import type { CoachingAction } from '@/features/coach/coachingPolicy';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  artifacts?: ChatArtifact[];
  // Ephemeral, not persisted to Supabase. Used to render the post-reply
  // "Next step" chips so the learner can act on the coach's suggested
  // retry/micro_task/reflection. schedule_review entries are already
  // persisted into the coach review queue at message-append time, but we
  // keep them here so the chip panel can show the "X reviews scheduled"
  // badge for the current turn.
  coachingActions?: CoachingAction[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatSyncState {
  source: 'remote' | 'local' | 'merged';
  pendingSyncCount: number;
}

export interface ChatRequestError {
  status: number;
  code?: string;
  message: string;
  requestId?: string;
}

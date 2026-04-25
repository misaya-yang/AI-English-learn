import type { ComponentType } from 'react';
import type { ChatArtifact, ChatMode } from '@/types/chatAgent';
import type { CoachingAction } from '@/features/coach/coachingPolicy';

export interface QuickPromptOption {
  icon: ComponentType<{ className?: string }>;
  text: string;
  textZh: string;
}

export interface ChatModeOption {
  id: ChatMode;
  label: string;
  labelZh: string;
  icon: ComponentType<{ className?: string }>;
}

export interface ChatMessageView {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  artifacts?: ChatArtifact[];
  coachingActions?: CoachingAction[];
}

export interface AttemptedQuizMapEntry {
  selected: string;
}

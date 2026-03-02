export type MemoryKind = 'profile' | 'preference' | 'weakness_tag' | 'goal' | 'error_trace' | 'tool_fact';

export interface MemoryItemView {
  id: string;
  userId: string;
  sessionId?: string;
  kind: MemoryKind;
  content: string;
  tags: string[];
  confidence: number;
  salience: number;
  isPinned: boolean;
  visibility: 'private' | 'session' | 'public';
  recallCount: number;
  dedupeKey: string;
  expiresAt?: string;
  updatedAt?: string;
}

export interface MemoryUsageTrace {
  id: string;
  kind: string;
  contentPreview: string;
  confidence: number;
  score: number;
  isPinned: boolean;
}

export interface MemoryPrivacySetting {
  writeMode: 'stable_only' | 'balanced';
  allowSensitiveStore: boolean;
}

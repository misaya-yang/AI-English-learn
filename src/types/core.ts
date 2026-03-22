/**
 * core.ts — Single source of truth for all domain types.
 *
 * Replace the scattered interfaces across localStorage.ts, wordBooks.ts, etc.
 * Old types remain in their original files for backward-compat during the
 * migration; this file is the authoritative version going forward.
 */

// ─── Enums / literals ────────────────────────────────────────────────────────

export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type Skill = 'reading' | 'writing' | 'listening' | 'speaking' | 'vocabulary';
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
export type WordStatus = 'new' | 'learning' | 'review' | 'mastered' | 'suspended';
export type SRSState = 'new' | 'learning' | 'review' | 'relearning';
export type SyncStatus = 'local' | 'synced' | 'conflict';
export type PlanTier = 'free' | 'pro' | 'team';
export type Rating = 'again' | 'hard' | 'good' | 'easy';
export type ThemePreference = 'dark' | 'light' | 'system';
export type FontSize = 'small' | 'medium' | 'large';

// ─── FSRS-5 card state ────────────────────────────────────────────────────────

/**
 * FSRS-5 state stored per word per user.
 * Replaces the old SM-2 fields (easeFactor + interval).
 */
export interface FSRSState {
  /** S: number of days until retrievability drops to REQUESTED_RETENTION (90%) */
  stability: number;
  /** D: difficulty on a 1–10 scale */
  difficulty: number;
  /** R: current recall probability 0–1 (computed, not stored in DB) */
  retrievability: number;
  /** How many times the user has forgotten this card */
  lapses: number;
  /** Current learning phase */
  state: SRSState;
  /** ISO timestamp: when the card is next due */
  dueAt: string;
  /** ISO timestamp: when this card was last reviewed (null = never) */
  lastReviewAt: string | null;
}

// ─── Word / vocabulary ────────────────────────────────────────────────────────

/**
 * Canonical word record (v2, replacing WordData from words.ts).
 * The "part_of_speech" convention uses snake_case to match the DB column.
 * Frontend code can alias as needed.
 */
export interface Word {
  id: string;
  word: string;
  phonetic: string;
  phonetic_us?: string;
  part_of_speech: string;
  definition: string;
  definition_zh: string;
  level: CEFR;
  topic: string;
  /** COCA / BNC corpus rank — lower = more frequent */
  frequency_rank?: number;
  examples: Array<{ en: string; zh: string; source?: string }>;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  etymology?: string;
  memory_tip?: string;
  /** Supabase Storage public URL */
  audio_url?: string;
  image_url?: string;
  /** True when imported by the user rather than from the built-in corpus */
  is_custom?: boolean;
  source_book_id?: string;
}

// ─── User word progress ───────────────────────────────────────────────────────

/**
 * Per-user per-word learning state (v2, replaces UserProgress).
 * Embeds the FSRS-5 card state alongside convenience counters.
 */
export interface WordProgress {
  user_id: string;
  word_id: string;
  status: WordStatus;
  /** Full FSRS-5 state block */
  srs: FSRSState;
  correct_count: number;
  incorrect_count: number;
  first_seen_at: string;
  mastered_at: string | null;
  sync_status: SyncStatus;
  updated_at: string;
}

// ─── Review log (per-review event) ───────────────────────────────────────────

/** One entry per review action, used for detailed analytics and FSRS training. */
export interface ReviewLog {
  id?: string;
  /** Stable event id used for remote sync de-duplication */
  event_id?: string;
  user_id: string;
  word_id: string;
  rated_at: string;
  rating: Rating;
  /** Wall-clock time spent on the card in ms */
  duration_ms?: number;
  /** FSRS stability before this review */
  pre_stability: number;
  /** FSRS stability after this review */
  post_stability: number;
  pre_difficulty: number;
  post_difficulty: number;
  /** How many days until next scheduled review */
  scheduled_days: number;
  session_id?: string;
}

// ─── User / profile ───────────────────────────────────────────────────────────

export interface UserProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  cefr_level: CEFR;
  daily_goal: number;
  preferred_topics: string[];
  learning_style: LearningStyle;
  native_language: string;
  plan_tier: PlanTier;
  timezone: string;
  created_at: string;
  updated_at: string;
}

// ─── Learning plan ────────────────────────────────────────────────────────────

export interface LearningPlan {
  user_id: string;
  target_level: CEFR;
  target_date: string;
  daily_words: number;
  focus_skills: Skill[];
  reminder_time: string | null;
  reminder_enabled: boolean;
}

export interface UserSettings {
  theme: ThemePreference;
  notifications: boolean;
  emailReminders: boolean;
  reminderTime: string;
  soundEnabled: boolean;
  ttsEnabled: boolean;
  ttsVoice: string;
  autoPlayAudio: boolean;
  showPinyin: boolean;
  fontSize: FontSize;
}

// ─── Study session ────────────────────────────────────────────────────────────

export interface StudySession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  words_studied: number;
  words_learned: number;
  xp_earned: number;
  duration_seconds: number;
  skill: Skill;
}

// ─── Sync queue entry ─────────────────────────────────────────────────────────

export interface SyncQueueEntry {
  id: string;
  table: string;
  operation: 'upsert' | 'delete';
  payload: Record<string, unknown>;
  idempotency_key: string;
  created_at: string;
  attempts: number;
  last_error?: string;
}

// ─── Learner model ────────────────────────────────────────────────────────────

export type LearningMode =
  | 'intensive'      // >90% retention, aggressive scheduling
  | 'standard'       // default FSRS cadence
  | 'maintenance'    // already at target level, slow review
  | 'recovery'       // many lapses, slow down new cards
  | 'exam_sprint';   // exam approaching, focus on weakest cards

export interface LearnerModel {
  user_id: string;
  computed_at: string;
  mode: LearningMode;
  avg_retrievability: number;
  weak_topics: string[];
  strong_topics: string[];
  recommended_daily_new: number;
  recommended_daily_review: number;
}

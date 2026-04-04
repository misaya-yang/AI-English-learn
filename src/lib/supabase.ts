import { createClient } from '@supabase/supabase-js';
import type { FSRSState, Rating } from '@/types/core';
import { buildWordProgressSyncPayload, normalizeWordUuid } from '@/lib/wordProgressSync';

// Supabase configuration
const DEFAULT_SUPABASE_URL = 'https://zjkbktdmwencnouwfrij.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_0_pU0AO93wz-7Bmt6xROJg_stLwrT0h';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ============================================
// TYPES
// ============================================

export interface User {
  id: string;
  email?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  native_language: string;
  english_level: string;
  daily_goal: number;
  created_at: string;
  updated_at: string;
}

export interface Word {
  id: string;
  word: string;
  phonetic?: string;
  part_of_speech?: string;
  definition: string;
  definition_zh: string;
  level: string;
  topic?: string;
  examples: Array<{ en: string; zh: string }>;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  etymology?: string;
  memory_tip?: string;
  image_url?: string;
  audio_url?: string;
}

export interface UserWordProgress {
  id: string;
  user_id: string;
  word_id?: string | null;
  word_ref: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
  review_count: number;
  correct_count: number;
  incorrect_count: number;
  ease_factor: number;
  interval: number;
  next_review_at?: string;
  last_reviewed_at?: string;
  first_learned_at?: string;
  mastered_at?: string;
  stability?: number | null;
  difficulty?: number | null;
  retrievability?: number | null;
  lapses?: number | null;
  srs_state?: FSRSState['state'] | null;
  due_at?: string | null;
  word?: Word;
}

export interface ReviewLogRow {
  id: string;
  user_id: string;
  word_ref: string;
  word_id?: string | null;
  rated_at: string;
  rating: Rating;
  duration_ms?: number | null;
  pre_stability: number;
  post_stability: number;
  pre_difficulty: number;
  post_difficulty: number;
  scheduled_days: number;
  session_id?: string | null;
  created_at?: string;
}

export interface BookmarkedWord {
  id: string;
  user_id: string;
  word_id: string;
  note?: string;
  tags: string[];
  word?: Word;
}

export interface StudySession {
  id: string;
  user_id: string;
  date: string;
  duration_seconds: number;
  words_studied: number;
  words_learned: number;
  words_reviewed: number;
  xp_earned: number;
  streak_day: number;
}

export interface LearningPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_level?: string;
  daily_words: number;
  focus_areas: string[];
  topics: string[];
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

export interface ChatSessionRow {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRow {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

// ============================================
// USER FUNCTIONS
// ============================================

// Get or create anonymous user ID
export function getAnonymousUserId(): string {
  // Prefer authenticated user id when available.
  const authUserRaw = localStorage.getItem('supabase_user');
  if (authUserRaw) {
    try {
      const authUser = JSON.parse(authUserRaw) as { id?: string };
      if (authUser.id) {
        return authUser.id;
      }
    } catch {
      // Ignore invalid user payload and fall back to generated id.
    }
  }

  const storageKey = 'vocabdaily-user-id';
  let userId = localStorage.getItem(storageKey);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(storageKey, userId);
  }
  return userId;
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const userId = getAnonymousUserId();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) return null;
  return data;
}

// Create or update user
export async function upsertUser(userData: Partial<User>): Promise<User | null> {
  const userId = getAnonymousUserId();
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      ...userData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error upserting user:', error);
    return null;
  }
  return data;
}

// Update user settings
export async function updateUserSettings(settings: {
  daily_goal?: number;
  english_level?: string;
  native_language?: string;
  display_name?: string;
}): Promise<boolean> {
  const userId = getAnonymousUserId();
  const { error } = await supabase
    .from('users')
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating user settings:', error);
    return false;
  }
  return true;
}

// ============================================
// WORD FUNCTIONS
// ============================================

// Get words with pagination
export async function getWords(options: {
  level?: string;
  topic?: string;
  limit?: number;
  offset?: number;
  search?: string;
} = {}): Promise<Word[]> {
  let query = supabase.from('words').select('*');
  
  if (options.level) {
    query = query.eq('level', options.level);
  }
  if (options.topic) {
    query = query.eq('topic', options.topic);
  }
  if (options.search) {
    query = query.ilike('word', `%${options.search}%`);
  }
  
  const { data, error } = await query
    .order('word')
    .limit(options.limit || 100)
    .range(options.offset || 0, (options.offset || 0) + (options.limit || 100) - 1);
  
  if (error) {
    console.error('Error getting words:', error);
    return [];
  }
  return data || [];
}

// Get word by ID
export async function getWordById(wordId: string): Promise<Word | null> {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('id', wordId)
    .single();
  
  if (error) return null;
  return data;
}

// Get random words for daily learning
export async function getDailyWords(count: number = 10, level?: string): Promise<Word[]> {
  let query = supabase.from('words').select('*');
  
  if (level) {
    query = query.eq('level', level);
  }
  
  const { data, error } = await query;
  
  if (error || !data) {
    console.error('Error getting daily words:', error);
    return [];
  }
  
  // Shuffle and take count
  const shuffled = data.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// ============================================
// USER WORD PROGRESS FUNCTIONS
// ============================================

// Get user's word progress
export async function getUserWordProgress(userId: string): Promise<UserWordProgress[]> {
  const { data, error } = await supabase
    .from('user_word_progress')
    .select('*, word:words(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error getting user word progress:', error);
    return [];
  }
  return data || [];
}

// Get due words for review
export async function getDueWords(userId: string): Promise<UserWordProgress[]> {
  const { data, error } = await supabase
    .rpc('get_due_words', { p_user_id: userId });
  
  if (error) {
    console.error('Error getting due words:', error);
    return [];
  }
  return data || [];
}

// Update word progress
export async function updateWordProgress(
  userId: string,
  wordId: string,
  update: Partial<UserWordProgress>
): Promise<boolean> {
  const nextPayload = {
    user_id: userId,
    word_id: normalizeWordUuid(wordId),
    word_ref: wordId,
    ...update,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('user_word_progress')
    .upsert(nextPayload, {
      onConflict: 'user_id,word_ref',
    });
  
  if (error) {
    console.error('Error updating word progress:', error);
    return false;
  }
  return true;
}

// Mark word as learned
export async function markWordAsLearned(userId: string, wordId: string): Promise<boolean> {
  return updateWordProgress(
    userId,
    wordId,
    buildWordProgressSyncPayload({
      userId,
      wordId,
      status: 'learning',
      firstLearnedAt: new Date().toISOString(),
    }),
  );
}

// Mark word as mastered
export async function markWordAsMastered(userId: string, wordId: string): Promise<boolean> {
  return updateWordProgress(
    userId,
    wordId,
    buildWordProgressSyncPayload({
      userId,
      wordId,
      status: 'mastered',
      masteredAt: new Date().toISOString(),
    }),
  );
}

// Legacy fallback: keep API shape but stop recalculating a separate SM-2 schedule.
export async function reviewWord(
  userId: string,
  wordId: string,
  rating: Rating
): Promise<boolean> {
  return updateWordProgress(userId, wordId, {
    status: rating === 'again' ? 'learning' : 'review',
    review_count: 1,
    last_reviewed_at: new Date().toISOString(),
  });
}

export async function insertReviewLog(log: ReviewLogRow): Promise<boolean> {
  const { error } = await supabase.from('review_logs').upsert(
    {
      ...log,
      word_id: log.word_id ?? normalizeWordUuid(log.word_ref),
      created_at: log.created_at ?? log.rated_at,
    },
    { onConflict: 'id' },
  );

  if (error) {
    console.error('Error inserting review log:', error);
    return false;
  }
  return true;
}

// ============================================
// BOOKMARKED WORDS FUNCTIONS
// ============================================

// Get bookmarked words
export async function getBookmarkedWords(userId: string): Promise<BookmarkedWord[]> {
  const { data, error } = await supabase
    .from('bookmarked_words')
    .select('*, word:words(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error getting bookmarked words:', error);
    return [];
  }
  return data || [];
}

// Toggle bookmark
export async function toggleBookmark(
  userId: string,
  wordId: string,
  note?: string
): Promise<boolean> {
  // Check if already bookmarked
  const { data: existing } = await supabase
    .from('bookmarked_words')
    .select('id')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .single();
  
  if (existing) {
    // Remove bookmark
    const { error } = await supabase
      .from('bookmarked_words')
      .delete()
      .eq('id', existing.id);
    return !error;
  } else {
    // Add bookmark
    const { error } = await supabase
      .from('bookmarked_words')
      .insert({
        user_id: userId,
        word_id: wordId,
        note,
      });
    return !error;
  }
}

// ============================================
// STUDY SESSIONS FUNCTIONS
// ============================================

// Get study sessions
export async function getStudySessions(userId: string, limit: number = 30): Promise<StudySession[]> {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error getting study sessions:', error);
    return [];
  }
  return data || [];
}

// Get today's study session
export async function getTodayStudySession(userId: string): Promise<StudySession | null> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();
  
  if (error) return null;
  return data;
}

// Record study activity
export async function recordStudyActivity(
  userId: string,
  activity: {
    duration_seconds?: number;
    words_studied?: number;
    words_learned?: number;
    words_reviewed?: number;
    xp_earned?: number;
  }
): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  
  // Get current session
  const { data: existing } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();
  
  if (existing) {
    // Update existing session
    const { error } = await supabase
      .from('study_sessions')
      .update({
        duration_seconds: existing.duration_seconds + (activity.duration_seconds || 0),
        words_studied: existing.words_studied + (activity.words_studied || 0),
        words_learned: existing.words_learned + (activity.words_learned || 0),
        words_reviewed: existing.words_reviewed + (activity.words_reviewed || 0),
        xp_earned: existing.xp_earned + (activity.xp_earned || 0),
      })
      .eq('id', existing.id);
    
    return !error;
  } else {
    // Create new session
    const { error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        date: today,
        ...activity,
      });
    
    return !error;
  }
}

// ============================================
// USER STATS FUNCTIONS
// ============================================

// Get user statistics
export async function getUserStats(userId: string): Promise<{
  total_words: number;
  mastered_words: number;
  learning_words: number;
  review_words: number;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  today_xp: number;
} | null> {
  const { data, error } = await supabase
    .rpc('get_user_stats', { p_user_id: userId });
  
  if (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
  return data?.[0] || null;
}

// ============================================
// LEARNING PLAN FUNCTIONS
// ============================================

// Get learning plans
export async function getLearningPlans(userId: string): Promise<LearningPlan[]> {
  const { data, error } = await supabase
    .from('learning_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error getting learning plans:', error);
    return [];
  }
  return data || [];
}

// Create learning plan
export async function createLearningPlan(
  userId: string,
  plan: Omit<LearningPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<LearningPlan | null> {
  const { data, error } = await supabase
    .from('learning_plans')
    .insert({
      user_id: userId,
      ...plan,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating learning plan:', error);
    return null;
  }
  return data;
}

// Update learning plan
export async function updateLearningPlan(
  planId: string,
  updates: Partial<LearningPlan>
): Promise<boolean> {
  const { error } = await supabase
    .from('learning_plans')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', planId);
  
  return !error;
}

// Delete learning plan
export async function deleteLearningPlan(planId: string): Promise<boolean> {
  const { error } = await supabase
    .from('learning_plans')
    .delete()
    .eq('id', planId);
  
  return !error;
}

// ============================================
// DATABASE INITIALIZATION
// ============================================

// Check if tables exist using pg_catalog
export async function checkTablesExist(): Promise<{
  users: boolean;
  words: boolean;
  user_word_progress: boolean;
  chat_sessions: boolean;
  chat_messages: boolean;
}> {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('Error checking tables:', error);
      // Fallback: assume tables exist to avoid blocking the user
      return {
        users: true,
        words: true,
        user_word_progress: true,
        chat_sessions: true,
        chat_messages: true,
      };
    }
    
    const existingTables = new Set(data?.map(t => t.table_name) || []);
    
    return {
      users: existingTables.has('users'),
      words: existingTables.has('words'),
      user_word_progress: existingTables.has('user_word_progress'),
      chat_sessions: existingTables.has('chat_sessions'),
      chat_messages: existingTables.has('chat_messages'),
    };
  } catch (e) {
    console.error('Exception checking tables:', e);
    // Fallback: assume tables exist
    return {
      users: true,
      words: true,
      user_word_progress: true,
      chat_sessions: true,
      chat_messages: true,
    };
  }
}

// SQL for initializing all tables
export const INIT_ALL_SQL = `
-- Run this SQL in Supabase SQL Editor to create all tables

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  native_language TEXT DEFAULT 'zh-CN',
  english_level TEXT DEFAULT 'intermediate',
  daily_goal INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- 2. Words table
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  phonetic TEXT,
  part_of_speech TEXT,
  definition TEXT NOT NULL,
  definition_zh TEXT NOT NULL,
  level TEXT DEFAULT 'intermediate',
  topic TEXT,
  examples JSONB DEFAULT '[]',
  synonyms TEXT[] DEFAULT '{}',
  antonyms TEXT[] DEFAULT '{}',
  collocations TEXT[] DEFAULT '{}',
  etymology TEXT,
  memory_tip TEXT,
  image_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User word progress table
CREATE TABLE IF NOT EXISTS user_word_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'new',
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  ease_factor DECIMAL(3,2) DEFAULT 2.50,
  interval INTEGER DEFAULT 0,
  next_review_at TIMESTAMP WITH TIME ZONE,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  first_learned_at TIMESTAMP WITH TIME ZONE,
  mastered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- 4. Bookmarked words table
CREATE TABLE IF NOT EXISTS bookmarked_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  note TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- 5. Learning plans table
CREATE TABLE IF NOT EXISTS learning_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_level TEXT,
  daily_words INTEGER DEFAULT 10,
  focus_areas TEXT[] DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Study sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_seconds INTEGER DEFAULT 0,
  words_studied INTEGER DEFAULT 0,
  words_learned INTEGER DEFAULT 0,
  words_reviewed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  streak_day INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 7. Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Chat quiz items table
CREATE TABLE IF NOT EXISTS chat_quiz_items (
  id TEXT PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Quick Quiz',
  stem TEXT NOT NULL,
  options JSONB NOT NULL,
  answer_key_hash TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  skills JSONB NOT NULL DEFAULT '[]',
  question_type TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank')),
  estimated_seconds INTEGER NOT NULL DEFAULT 45,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Chat quiz attempts table
CREATE TABLE IF NOT EXISTS chat_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id TEXT NOT NULL REFERENCES chat_quiz_items(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  selected_option TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  source_mode TEXT NOT NULL DEFAULT 'study' CHECK (source_mode IN ('chat', 'study', 'quiz', 'canvas')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Chat experiment events table
CREATE TABLE IF NOT EXISTS chat_experiment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_name TEXT NOT NULL,
  event_payload_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Agent memory items table
CREATE TABLE IF NOT EXISTS agent_memory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID,
  kind TEXT NOT NULL CHECK (kind IN ('profile', 'preference', 'weakness_tag', 'goal', 'error_trace', 'tool_fact')),
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  confidence DECIMAL(4,3) NOT NULL DEFAULT 0.700,
  source_ref JSONB NOT NULL DEFAULT '{}',
  dedupe_key TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, dedupe_key)
);

-- 13. Agent context snapshots table
CREATE TABLE IF NOT EXISTS agent_context_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID NOT NULL,
  summary TEXT NOT NULL,
  compacted_from_count INTEGER NOT NULL DEFAULT 0,
  source_pointers JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Agent tool runs table
CREATE TABLE IF NOT EXISTS agent_tool_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID,
  tool TEXT NOT NULL,
  run_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'skipped', 'rate_limited')),
  latency_ms INTEGER NOT NULL DEFAULT 0,
  error_code TEXT,
  request_payload JSONB NOT NULL DEFAULT '{}',
  response_payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Agent web sources table
CREATE TABLE IF NOT EXISTS agent_web_sources (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID,
  tool_run_id UUID REFERENCES agent_tool_runs(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  domain TEXT,
  title TEXT,
  snippet TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confidence DECIMAL(4,3) NOT NULL DEFAULT 0.600,
  raw JSONB NOT NULL DEFAULT '{}'
);

-- 16. Agent search quotas table
CREATE TABLE IF NOT EXISTS agent_search_quotas (
  user_id UUID PRIMARY KEY,
  window_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT date_trunc('minute', NOW()),
  requests_in_window INTEGER NOT NULL DEFAULT 0,
  max_per_minute INTEGER NOT NULL DEFAULT 8,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarked_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_quiz_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_experiment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_context_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tool_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_web_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_search_quotas ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_words_level ON words(level);
CREATE INDEX IF NOT EXISTS idx_words_topic ON words(topic);
CREATE INDEX IF NOT EXISTS idx_user_word_progress_user_id ON user_word_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_word_progress_status ON user_word_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_word_progress_next_review ON user_word_progress(next_review_at);
CREATE INDEX IF NOT EXISTS idx_bookmarked_words_user_id ON bookmarked_words(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(date);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_quiz_items_user_created ON chat_quiz_items(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_quiz_attempts_user_created ON chat_quiz_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_experiment_events_user_created ON chat_experiment_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_memory_user_updated ON agent_memory_items(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_context_snapshots_user_created ON agent_context_snapshots(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_tool_runs_user_created ON agent_tool_runs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_web_sources_user_retrieved ON agent_web_sources(user_id, retrieved_at DESC);

-- Create RLS policies (simplified for anonymous users)
CREATE POLICY "Allow all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON words FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON user_word_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON bookmarked_words FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON learning_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON study_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON chat_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON chat_quiz_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON chat_quiz_attempts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON chat_experiment_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON agent_memory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON agent_context_snapshots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON agent_tool_runs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON agent_web_sources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON agent_search_quotas FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- TRIGGER: Auto-create user when auth user is created
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table
  INSERT INTO users (id, email, username, display_name, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    split_part(NEW.email, '@', 1),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  -- Insert into profiles table
  INSERT INTO profiles (user_id, cefr_level, daily_goal, preferred_topics, learning_style, native_language)
  VALUES (NEW.id, 'B1', 10, ARRAY['general'], 'visual', 'zh-CN')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_auth_user();

-- ============================================
-- PROFILES TABLE (needed for trigger)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cefr_level TEXT DEFAULT 'B1',
  daily_goal INTEGER DEFAULT 10,
  preferred_topics TEXT[] DEFAULT '{"general"}',
  learning_style TEXT DEFAULT 'visual',
  native_language TEXT DEFAULT 'zh-CN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON profiles FOR ALL USING (true) WITH CHECK (true);
`;

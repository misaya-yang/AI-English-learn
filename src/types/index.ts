// User & Authentication Types
export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  cefr_level: CEFRLevel;
  native_language: string;
  daily_word_goal: number;
  weekly_goal: number;
  preferred_topics: Topic[];
  learning_style: LearningStyle;
  timezone: string;
  created_at: string;
  updated_at: string;
  xp_points: number;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  level: UserLevel;
  is_pro: boolean;
  openai_api_key: string | null;
}

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type UserLevel = 'Novice' | 'Apprentice' | 'Journeyman' | 'Expert' | 'Word Wizard' | 'Language Master';
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading';

export type Topic = 
  | 'Business' 
  | 'Academic' 
  | 'Travel' 
  | 'Food' 
  | 'Technology' 
  | 'Daily Life' 
  | 'Entertainment' 
  | 'Science' 
  | 'Health' 
  | 'Sports'
  | 'Arts'
  | 'Nature';

// Word Types
export interface Word {
  id: string;
  word: string;
  part_of_speech: string;
  ipa_pronunciation: string;
  definitions: Definition[];
  example_sentences: ExampleSentence[];
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  etymology: string | null;
  usage_notes: string | null;
  common_mistakes: string | null;
  difficulty: CEFRLevel;
  topics: Topic[];
  image_url: string | null;
  audio_url: string | null;
  created_at: string;
  created_by: string | null;
}

export interface Definition {
  id: string;
  word_id: string;
  definition_en: string;
  definition_zh: string;
  is_simple: boolean;
  order_index: number;
}

export interface ExampleSentence {
  id: string;
  word_id: string;
  sentence_en: string;
  sentence_zh: string;
  order_index: number;
}

// User Progress Types
export interface UserWordProgress {
  id: string;
  user_id: string;
  word_id: string;
  word: Word;
  status: WordStatus;
  interval: number;
  ease_factor: number;
  due_date: string;
  review_count: number;
  last_review: string | null;
  created_at: string;
  updated_at: string;
}

export type WordStatus = 'new' | 'learning' | 'review' | 'mastered' | 'hard';

export interface DailyWordSet {
  id: string;
  user_id: string;
  date: string;
  words: Word[];
  created_at: string;
  completed_at: string | null;
}

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  name_zh: string;
  description: string;
  description_zh: string;
  icon: string;
  requirement: string;
  xp_reward: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  badge: Badge;
  earned_at: string;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  weekly_activity: boolean[];
}

export interface XpData {
  total_xp: number;
  today_xp: number;
  weekly_xp: number;
  level: UserLevel;
  progress_to_next: number;
}

// Practice Types
export interface QuizQuestion {
  id: string;
  word_id: string;
  word: Word;
  question_type: 'multiple_choice' | 'fill_blank' | 'matching' | 'listening';
  question_en: string;
  question_zh: string;
  options: string[];
  correct_answer: string;
  user_answer?: string;
  is_correct?: boolean;
}

export interface WritingFeedback {
  score: number;
  grammar_issues: string[];
  naturalness_score: number;
  suggestions: string;
  corrected_sentence: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  content_zh?: string;
  created_at: string;
  word_references?: string[];
}

// Settings Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  email_reminders: boolean;
  reminder_time: string;
  tts_enabled: boolean;
  tts_voice: string;
  auto_play_audio: boolean;
  show_pinyin: boolean;
  font_size: 'small' | 'medium' | 'large';
}

// Analytics Types
export interface LearningAnalytics {
  words_learned_total: number;
  words_learned_this_week: number;
  words_learned_this_month: number;
  accuracy_rate: number;
  retention_rate: number;
  study_time_total: number;
  study_time_this_week: number;
  weekly_data: {
    date: string;
    words_learned: number;
    xp_earned: number;
    study_minutes: number;
  }[];
  topic_breakdown: {
    topic: Topic;
    count: number;
    percentage: number;
  }[];
  activity_heatmap: {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
  }[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

export interface ProfileFormData {
  display_name: string;
  cefr_level: CEFRLevel;
  daily_word_goal: number;
  preferred_topics: Topic[];
  learning_style: LearningStyle;
}

// Subscription Types
export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  plan: 'free' | 'pro';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

// Word of the Day
export interface WordOfTheDay {
  id: string;
  word_id: string;
  word: Word;
  date: string;
  featured: boolean;
}

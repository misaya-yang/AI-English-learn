-- ============================================
-- VocabDaily AI - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. USERS TABLE (用户表)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
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

-- ============================================
-- 2. PROFILES TABLE (用户配置表)
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

-- ============================================
-- 3. WORDS TABLE (单词表)
-- ============================================
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

-- ============================================
-- 4. USER WORD PROGRESS (用户单词学习进度)
-- ============================================
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

-- ============================================
-- 5. BOOKMARKED WORDS (收藏单词)
-- ============================================
CREATE TABLE IF NOT EXISTS bookmarked_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  note TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- ============================================
-- 6. LEARNING PLANS (学习计划)
-- ============================================
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

-- ============================================
-- 7. STUDY SESSIONS (学习会话/每日统计)
-- ============================================
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

-- ============================================
-- 8. CHAT SESSIONS (AI对话会话)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '新对话',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. CHAT MESSAGES (AI对话消息)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. USER ACHIEVEMENTS (用户成就)
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  icon_url TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- 11. PRACTICE RESULTS (练习结果)
-- ============================================
CREATE TABLE IF NOT EXISTS practice_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE SET NULL,
  practice_type TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  user_answer TEXT,
  correct_answer TEXT,
  time_spent_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarked_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_results ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Users: Users can only access their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Words: Public read access
CREATE POLICY "Words are publicly readable" ON words
  FOR SELECT TO PUBLIC USING (TRUE);

-- User word progress
CREATE POLICY "Users can view own progress" ON user_word_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_word_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_word_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON user_word_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Bookmarked words
CREATE POLICY "Users can view own bookmarks" ON bookmarked_words
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON bookmarked_words
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON bookmarked_words
  FOR DELETE USING (auth.uid() = user_id);

-- Learning plans
CREATE POLICY "Users can view own plans" ON learning_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own plans" ON learning_plans
  FOR ALL USING (auth.uid() = user_id);

-- Study sessions
CREATE POLICY "Users can view own sessions" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Chat sessions
CREATE POLICY "Users can view own chat sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Chat messages
CREATE POLICY "Users can view own messages" ON chat_messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own messages" ON chat_messages
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own messages" ON chat_messages
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()
  ));

-- User achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Practice results
CREATE POLICY "Users can view own results" ON practice_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results" ON practice_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Auto-create public users/profiles rows on auth signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
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

  INSERT INTO profiles (user_id, cefr_level, daily_goal, preferred_topics, learning_style, native_language)
  VALUES (NEW.id, 'B1', 10, ARRAY['general'], 'visual', 'zh-CN')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_auth_user();

-- ============================================
-- INDEXES (索引优化)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_words_level ON words(level);
CREATE INDEX IF NOT EXISTS idx_words_topic ON words(topic);
CREATE INDEX IF NOT EXISTS idx_user_word_progress_user_id ON user_word_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_word_progress_status ON user_word_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_word_progress_next_review ON user_word_progress(next_review_at);
CREATE INDEX IF NOT EXISTS idx_bookmarked_words_user_id ON bookmarked_words(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_plans_user_id ON learning_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(date);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_practice_results_user_id ON practice_results(user_id);

-- ============================================
-- FUNCTIONS (数据库函数)
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_words_updated_at ON words;
CREATE TRIGGER update_words_updated_at
  BEFORE UPDATE ON words
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_word_progress_updated_at ON user_word_progress;
CREATE TRIGGER update_user_word_progress_updated_at
  BEFORE UPDATE ON user_word_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_plans_updated_at ON learning_plans;
CREATE TRIGGER update_learning_plans_updated_at
  BEFORE UPDATE ON learning_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Get due words for review (SRS algorithm)
CREATE OR REPLACE FUNCTION get_due_words(p_user_id UUID)
RETURNS TABLE (
  word_id UUID,
  word TEXT,
  phonetic TEXT,
  definition TEXT,
  definition_zh TEXT,
  status TEXT,
  review_count INTEGER,
  ease_factor DECIMAL,
  next_review_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id as word_id,
    w.word,
    w.phonetic,
    w.definition,
    w.definition_zh,
    uwp.status,
    uwp.review_count,
    uwp.ease_factor,
    uwp.next_review_at
  FROM user_word_progress uwp
  JOIN words w ON w.id = uwp.word_id
  WHERE uwp.user_id = p_user_id
    AND uwp.status IN ('learning', 'review')
    AND (uwp.next_review_at IS NULL OR uwp.next_review_at <= NOW())
  ORDER BY uwp.next_review_at ASC NULLS FIRST;
END;
$$ LANGUAGE plpgsql;

-- Get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_words INTEGER,
  mastered_words INTEGER,
  learning_words INTEGER,
  review_words INTEGER,
  current_streak INTEGER,
  longest_streak INTEGER,
  total_xp INTEGER,
  today_xp INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_words,
    COUNT(*) FILTER (WHERE status = 'mastered')::INTEGER as mastered_words,
    COUNT(*) FILTER (WHERE status = 'learning')::INTEGER as learning_words,
    COUNT(*) FILTER (WHERE status = 'review')::INTEGER as review_words,
    COALESCE((SELECT MAX(streak_day) FROM study_sessions WHERE user_id = p_user_id AND date = CURRENT_DATE), 0) as current_streak,
    COALESCE((SELECT MAX(streak_day) FROM study_sessions WHERE user_id = p_user_id), 0) as longest_streak,
    COALESCE((SELECT SUM(xp_earned) FROM study_sessions WHERE user_id = p_user_id), 0) as total_xp,
    COALESCE((SELECT xp_earned FROM study_sessions WHERE user_id = p_user_id AND date = CURRENT_DATE), 0) as today_xp
  FROM user_word_progress
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Create user record when auth user is created
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
-- SEED DATA (初始数据)
-- ============================================

-- Insert sample words (if table is empty)
INSERT INTO words (word, phonetic, part_of_speech, definition, definition_zh, level, topic, examples, synonyms, antonyms, collocations, memory_tip)
SELECT * FROM (VALUES
  ('abandon', '/əˈbændən/', 'verb', 'To leave behind, desert, or give up completely', '抛弃，放弃', 'intermediate', 'general', 
    '[{"en": "The captain refused to abandon the sinking ship.", "zh": "船长拒绝抛弃正在下沉的船。"}, {"en": "Don''t abandon hope yet.", "zh": "不要放弃希望。"}]'::jsonb,
    ARRAY['desert', 'forsake', 'leave'], ARRAY['keep', 'retain', 'maintain'], ARRAY['abandon ship', 'abandon hope', 'abandon the idea'],
    'a-ban-don = 一个(a) 班(ban) 都(don) 放弃了'
  ),
  ('serendipity', '/ˌserənˈdɪpəti/', 'noun', 'The occurrence of events by chance in a happy or beneficial way', '意外发现珍奇事物的运气，机缘凑巧', 'advanced', 'general',
    '[{"en": "Finding that rare book was pure serendipity.", "zh": "找到那本珍贵的书纯粹是意外之喜。"}]'::jsonb,
    ARRAY['chance', 'fate', 'fortune'], ARRAY[]::TEXT[], ARRAY['a moment of serendipity', 'serendipity struck'],
    'seren-dip-ity: serene(宁静的) + dip(蘸) + ity，像意外发现宝藏一样宁静而惊喜'
  ),
  ('resilient', '/rɪˈzɪliənt/', 'adjective', 'Able to withstand or recover quickly from difficult conditions', '有弹性的，能复原的，适应力强的', 'intermediate', 'general',
    '[{"en": "Children are often more resilient than adults think.", "zh": "孩子往往比大人想象的更有适应力。"}]'::jsonb,
    ARRAY['flexible', 'adaptable', 'tough'], ARRAY['fragile', 'vulnerable', 'weak'], ARRAY['resilient spirit', 'resilient economy'],
    're-sil-ient: 重新(re) 丝绸(silk) 一样有弹性'
  )
) AS v(word, phonetic, part_of_speech, definition, definition_zh, level, topic, examples, synonyms, antonyms, collocations, memory_tip)
WHERE NOT EXISTS (SELECT 1 FROM words LIMIT 1);

-- User Gamification Table
-- =======================
-- Persists achievement and streak data to Supabase for cross-device durability.

CREATE TABLE IF NOT EXISTS user_gamification (
  user_id UUID PRIMARY KEY,
  streak_freezes INTEGER NOT NULL DEFAULT 1,
  last_freeze_used_at DATE,
  achievements JSONB NOT NULL DEFAULT '[]',
  daily_multiplier DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  total_words_learned INTEGER NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gamification" ON user_gamification
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own gamification" ON user_gamification
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_user_gamification_updated_at ON user_gamification;
CREATE TRIGGER update_user_gamification_updated_at
  BEFORE UPDATE ON user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

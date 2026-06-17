-- Auth profile bootstrap RLS repair
-- =================================
-- Production evidence on 2026-06-17 showed that new accounts can authenticate,
-- but public.users upsert is rejected by RLS and public.profiles then fails its
-- users(id) foreign key. This migration restores the intended auth.users ->
-- public.users/public.profiles bootstrap and the client policies required for
-- a signed-in user to maintain their own profile row.

ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can view own users row" ON public.users;
CREATE POLICY "Authenticated users can view own users row" ON public.users
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Authenticated users can insert own users row" ON public.users;
CREATE POLICY "Authenticated users can insert own users row" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Authenticated users can update own users row" ON public.users;
CREATE POLICY "Authenticated users can update own users row" ON public.users
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
CREATE POLICY "Service role can manage users" ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view own profile row" ON public.profiles;
CREATE POLICY "Authenticated users can view own profile row" ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert own profile row" ON public.profiles;
CREATE POLICY "Authenticated users can insert own profile row" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Authenticated users can update own profile row" ON public.profiles;
CREATE POLICY "Authenticated users can update own profile row" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
CREATE POLICY "Service role can manage profiles" ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  safe_username TEXT;
BEGIN
  base_username := COALESCE(NULLIF(split_part(NEW.email, '@', 1), ''), 'learner');
  safe_username := base_username || '-' || substring(NEW.id::TEXT from 1 for 8);

  INSERT INTO public.users (id, email, username, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    safe_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', base_username),
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

  INSERT INTO public.profiles (user_id, cefr_level, daily_goal, preferred_topics, learning_style, native_language)
  VALUES (NEW.id, 'B1', 10, ARRAY['general'], 'visual', 'zh-CN')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

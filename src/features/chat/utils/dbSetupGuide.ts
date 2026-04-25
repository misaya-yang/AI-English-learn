/**
 * Build the locale-aware Supabase setup guide that the chat surface offers
 * to the user when database tables are missing.
 *
 * The wording matches the legacy inline strings byte-for-byte so existing
 * onboarding screenshots stay accurate.
 */
export const buildDbSetupGuide = (language: string): string =>
  language.startsWith('zh')
    ? [
        '请不要再复制页面里的旧初始化 SQL。',
        '请在项目根目录执行：',
        '1. supabase link --project-ref zjkbktdmwencnouwfrij',
        '2. supabase db push --linked',
        '3. supabase functions deploy ai-chat',
        '4. supabase functions deploy memory-list memory-remember memory-delete memory-pin memory-clear-expired',
        '如需核对 migration，请查看：supabase/migrations/',
      ].join('\n')
    : [
        'Do not copy the legacy bootstrap SQL from the UI.',
        'From the project root run:',
        '1. supabase link --project-ref zjkbktdmwencnouwfrij',
        '2. supabase db push --linked',
        '3. supabase functions deploy ai-chat',
        '4. supabase functions deploy memory-list memory-remember memory-delete memory-pin memory-clear-expired',
        'Review migrations in: supabase/migrations/',
      ].join('\n');

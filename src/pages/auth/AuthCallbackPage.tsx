import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthShell } from '@/features/marketing/AuthShell';

export default function AuthCallbackPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session) {
          // Check if user has a profile
          const { error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // No profile found, create one
            const profilePayload = {
              id: session.user.id,
              email: session.user.email!,
              display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
              avatar_url: session.user.user_metadata?.avatar_url,
              cefr_level: 'B1',
              native_language: 'zh-CN',
              daily_word_goal: 10,
              weekly_goal: 70,
              preferred_topics: ['Daily Life', 'Business'],
              learning_style: 'visual',
              timezone: 'Asia/Taipei',
            };
            const { error: createError } = await supabase.from('profiles').insert(profilePayload);

            if (createError) {
              console.error('Error creating profile:', createError);
            }

            setIsNewUser(true);
          }

          setIsSuccess(true);
          toast.success('Successfully signed in!');
        } else {
          // No session found, redirect to login
          setIsSuccess(false);
        }
      } catch (error: unknown) {
        console.error('Auth callback error:', error);
        toast.error(error instanceof Error ? error.message : 'Authentication failed');
        setIsSuccess(false);
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, []);

  if (isProcessing) {
    return (
      <AuthShell title="Completing sign in" titleZh="正在完成登录">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-emerald-500" aria-hidden="true" />
          <p className="text-sm text-slate-700 dark:text-white/80">
            Almost there — verifying your session.
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-white/50" lang="zh-CN">
            正在验证你的登录信息……
          </p>
        </div>
      </AuthShell>
    );
  }

  if (isSuccess) {
    if (isNewUser) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Auth failed
  return <Navigate to="/login" replace />;
}

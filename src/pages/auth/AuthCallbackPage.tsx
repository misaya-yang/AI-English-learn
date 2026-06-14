import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthShell } from '@/features/marketing/AuthShell';
import { useTranslation } from 'react-i18next';

export default function AuthCallbackPage() {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const copy = isZh
    ? {
        title: '正在完成登录',
        verifying: '快好了，正在验证你的登录信息。',
        signedIn: '登录成功！',
        failed: '认证失败',
      }
    : {
        title: 'Completing sign in',
        verifying: 'Almost there. Verifying your session.',
        signedIn: 'Successfully signed in!',
        failed: 'Authentication failed',
      };

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
          toast.success(copy.signedIn);
        } else {
          // No session found, redirect to login
          setIsSuccess(false);
        }
      } catch (error: unknown) {
        console.error('Auth callback error:', error);
        toast.error(error instanceof Error ? error.message : copy.failed);
        setIsSuccess(false);
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [copy.failed, copy.signedIn]);

  if (isProcessing) {
    return (
      <AuthShell title="Completing sign in" titleZh="正在完成登录">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Loader2 className="mb-4 h-9 w-9 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm text-foreground">
            {copy.verifying}
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

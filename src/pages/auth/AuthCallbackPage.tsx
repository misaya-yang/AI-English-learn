import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
            const { error: createError } = await supabase.from('profiles').insert({
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
            } as any);

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
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast.error(error.message || 'Authentication failed');
        setIsSuccess(false);
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, []);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mb-4" />
        <h1 className="text-xl font-semibold">Completing sign in...</h1>
        <p className="text-muted-foreground">正在完成登入...</p>
      </div>
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

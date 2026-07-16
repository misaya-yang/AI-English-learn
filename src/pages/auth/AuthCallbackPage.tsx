import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { AuthShell } from '@/features/marketing/AuthShell';
import { resolveAuthRedirect } from '@/lib/authRedirect';
import { supabase } from '@/lib/supabase';

const AUTH_CALLBACK_TIMEOUT_MS = 12_000;

type CallbackStatus = 'verifying' | 'success' | 'error';
type CallbackErrorCode = 'timeout' | 'missing_session' | 'profile' | 'unknown';

interface CallbackResult {
  isNewUser: boolean;
}

class CallbackFlowError extends Error {
  readonly code: CallbackErrorCode;

  constructor(code: CallbackErrorCode, message?: string) {
    super(message);
    this.name = 'CallbackFlowError';
    this.code = code;
  }
}

const withTimeout = async <T,>(request: Promise<T>): Promise<T> => {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new CallbackFlowError('timeout'));
    }, AUTH_CALLBACK_TIMEOUT_MS);
  });

  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
};

const completeAuthCallback = async (): Promise<CallbackResult> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }
  if (!session) {
    throw new CallbackFlowError('missing_session');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', session.user.id)
    .maybeSingle();

  if (profileError) {
    throw new CallbackFlowError('profile', profileError.message);
  }
  if (profile) {
    return { isNewUser: false };
  }

  const email = session.user.email;
  if (!email) {
    throw new CallbackFlowError('profile');
  }

  const browserLanguage = navigator.language || 'en-US';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const profilePayload = {
    id: session.user.id,
    email,
    display_name: session.user.user_metadata?.display_name || email.split('@')[0],
    avatar_url: session.user.user_metadata?.avatar_url,
    cefr_level: 'B1',
    native_language: browserLanguage,
    daily_word_goal: 10,
    weekly_goal: 70,
    preferred_topics: ['Daily Life', 'Business'],
    learning_style: 'visual',
    timezone,
  };
  const { error: createError } = await supabase.from('profiles').insert(profilePayload);

  if (createError) {
    throw new CallbackFlowError('profile', createError.message);
  }

  return { isNewUser: true };
};

export default function AuthCallbackPage() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');
  const [status, setStatus] = useState<CallbackStatus>('verifying');
  const [errorCode, setErrorCode] = useState<CallbackErrorCode | null>(null);
  const [destination, setDestination] = useState('/dashboard/today');
  const [attempt, setAttempt] = useState(0);
  const requestRef = useRef<Promise<CallbackResult> | null>(null);
  const redirectTarget = resolveAuthRedirect(location.search, '/dashboard/today');

  const copy = isZh
    ? {
        verifyingTitle: '正在完成登录',
        verifying: '快好了，正在验证你的登录信息。',
        successTitle: '登录已完成',
        successBody: '登录信息已经验证，可以继续进入学习页面。',
        continue: '继续',
        failedTitle: '无法完成登录',
        failed: '登录链接无法验证，请重新发送链接或改用密码登录。',
        timeout: '验证超时，请检查网络后重试。',
        missingSession: '这个登录链接无效、已过期，或已经被使用。',
        profile: '登录已验证，但暂时无法准备学习档案，请重试。',
        retry: '重试验证',
        backToLogin: '返回登录',
      }
    : {
        verifyingTitle: 'Completing sign in',
        verifying: 'Almost there. Verifying your session.',
        successTitle: 'Sign-in complete',
        successBody: 'Your sign-in has been verified. You can continue to the learning workspace.',
        continue: 'Continue',
        failedTitle: 'Unable to complete sign in',
        failed: 'We could not verify this sign-in link. Send a new link or use password sign in.',
        timeout: 'Verification timed out. Check your connection and try again.',
        missingSession: 'This sign-in link is invalid, expired, or has already been used.',
        profile: 'Sign-in succeeded, but we could not prepare your learning profile. Please retry.',
        retry: 'Retry verification',
        backToLogin: 'Back to sign in',
      };

  useEffect(() => {
    const title = status === 'success'
      ? copy.successTitle
      : status === 'error'
        ? copy.failedTitle
        : copy.verifyingTitle;
    document.title = `${title} · VocabDaily`;
  }, [copy.failedTitle, copy.successTitle, copy.verifyingTitle, status]);

  useEffect(() => {
    let active = true;
    const request = requestRef.current ?? withTimeout(completeAuthCallback());
    requestRef.current = request;

    void request
      .then((result) => {
        if (!active) return;
        setDestination(
          result.isNewUser
            ? `/onboarding?redirect=${encodeURIComponent(redirectTarget)}`
            : redirectTarget,
        );
        setErrorCode(null);
        setStatus('success');
      })
      .catch((error: unknown) => {
        if (!active) return;
        setErrorCode(error instanceof CallbackFlowError ? error.code : 'unknown');
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [attempt, redirectTarget]);

  const retry = () => {
    requestRef.current = null;
    setErrorCode(null);
    setStatus('verifying');
    setAttempt((value) => value + 1);
  };

  if (status === 'verifying') {
    return (
      <AuthShell title="Completing sign in" titleZh="正在完成登录">
        <div
          className="flex flex-col items-center justify-center py-6 text-center"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="mb-4 h-9 w-9 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm text-foreground">{copy.verifying}</p>
        </div>
      </AuthShell>
    );
  }

  if (status === 'success') {
    return (
      <AuthShell title="Sign-in complete" titleZh="登录已完成">
        <div
          className="flex flex-col items-center justify-center py-5 text-center"
          role="status"
          aria-live="polite"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-sm leading-6 text-foreground">{copy.successBody}</p>
          <Button asChild className="mt-6 h-11 w-full rounded-md">
            <Link to={destination}>{copy.continue}</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  const errorMessage =
    errorCode === 'timeout'
      ? copy.timeout
      : errorCode === 'missing_session'
        ? copy.missingSession
        : errorCode === 'profile'
          ? copy.profile
          : copy.failed;

  return (
    <AuthShell title="Unable to complete sign in" titleZh="无法完成登录">
      <div
        className="flex flex-col items-center justify-center py-5 text-center"
        role="alert"
        aria-live="assertive"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="text-sm leading-6 text-foreground">{errorMessage}</p>
        <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
          <Button type="button" onClick={retry} className="h-11 rounded-md">
            <RotateCcw className="h-4 w-4" />
            {copy.retry}
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-md">
            <Link to={`/login${location.search}`}>{copy.backToLogin}</Link>
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}

import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { AuthShell } from '@/features/marketing/AuthShell';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { resolveAuthRedirect } from '@/lib/authRedirect';

const MAGIC_LINK_TIMEOUT_MS = 12_000;

const sendWithTimeout = async <T,>(request: Promise<T>): Promise<T> => {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error('magic_link_timeout'));
    }, MAGIC_LINK_TIMEOUT_MS);
  });

  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
};

export default function MagicLinkPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const redirectTarget = resolveAuthRedirect(location.search, '/dashboard/today');
  const copy = isZh
    ? {
        sentTitle: '请查收邮件',
        sentSubtitle: '安全登录链接已发送到你的邮箱。',
        notReceived: '没有收到？',
        resend: '重新发送',
        sentBodyBefore: '登录链接已发送至',
        sentBodyAfter: '，点击链接即可登录。',
        backToLogin: '返回登录',
        title: '邮箱链接登录',
        subtitle: '无需密码，我们会发送安全登录链接到你的邮箱。',
        preferPassword: '更喜欢密码登录？',
        passwordLogin: '密码登录',
        email: '邮箱',
        sending: '发送中...',
        sendLink: '发送登录链接',
        sendFailed: '暂时无法发送登录链接，请检查网络或改用密码登录。',
        sendTimeout: '发送请求超时，请检查网络后重试。',
      }
    : {
        sentTitle: 'Check your email',
        sentSubtitle: 'A secure sign-in link has been sent to your inbox.',
        notReceived: "Didn't get it?",
        resend: 'Send again',
        sentBodyBefore: 'We sent a sign-in link to',
        sentBodyAfter: '. Open it to finish signing in.',
        backToLogin: 'Back to sign in',
        title: 'Sign in with email link',
        subtitle: "No password needed. We'll send a secure sign-in link to your email.",
        preferPassword: 'Prefer using a password?',
        passwordLogin: 'Password sign in',
        email: 'Email',
        sending: 'Sending...',
        sendLink: 'Send login link',
        sendFailed: 'We could not send a sign-in link. Check your connection or use password sign in.',
        sendTimeout: 'The request timed out. Check your connection and try again.',
      };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      callbackUrl.searchParams.set('redirect', redirectTarget);
      const { error } = await sendWithTimeout(
        supabase.auth.signInWithOtp({
          email: normalizedEmail,
          options: {
            emailRedirectTo: callbackUrl.toString(),
            shouldCreateUser: false,
          },
        }),
      );

      if (error) {
        throw error;
      }

      setEmail(normalizedEmail);
      setIsSent(true);
    } catch (error) {
      console.error('Magic link request failed:', error);
      setErrorMessage(
        error instanceof Error && error.message === 'magic_link_timeout'
          ? copy.sendTimeout
          : copy.sendFailed,
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <AuthShell
        title="Check your email"
        titleZh="请查收邮件"
        subtitle="A secure sign-in link has been sent to your inbox."
        subtitleZh="安全登录链接已发送到你的邮箱。"
        footer={
          <>
            <span className="opacity-80">{copy.notReceived}</span>{' '}
            <button
              type="button"
              onClick={() => {
                setIsSent(false);
                setEmail('');
              }}
              className="font-medium text-primary transition-colors hover:text-primary/80"
            >
              {copy.resend}
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center" role="status" aria-live="polite">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="text-sm text-foreground">
            {copy.sentBodyBefore}{' '}
            <strong className="break-all font-semibold text-foreground">{email}</strong>
            {copy.sentBodyAfter}
          </p>

          <div className="mt-6 w-full">
            <Button asChild variant="outline" className="h-11 w-full rounded-md">
              <Link to={`/login${location.search}`}>
                {copy.backToLogin}
              </Link>
            </Button>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Sign in with email link"
      titleZh="邮箱链接登录"
      subtitle="No password needed. We'll send a secure sign-in link to your email."
      subtitleZh="无需密码，我们会发送安全登录链接到你的邮箱。"
      footer={
        <>
          <span className="opacity-80">{copy.preferPassword}</span>{' '}
          <Link
            to={`/login${location.search}`}
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            {copy.passwordLogin}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-muted-foreground"
          >
            {copy.email}
          </Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              disabled={isLoading}
              required
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? 'magic-link-error' : undefined}
              className="h-11 rounded-md pl-11"
            />
          </div>
          {errorMessage && (
            <p id="magic-link-error" className="text-sm leading-6 text-destructive" role="alert">
              {errorMessage}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-11 w-full rounded-md text-sm font-medium shadow-none transition-colors disabled:opacity-60"
          disabled={isLoading || !email.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {copy.sending}
            </>
          ) : (
            <>{copy.sendLink}</>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

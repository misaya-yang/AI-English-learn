import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { AuthShell } from '@/features/marketing/AuthShell';
import { useTranslation } from 'react-i18next';

export default function MagicLinkPage() {
  const { isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const copy = isZh
    ? {
        sentTitle: '请查收邮件',
        sentSubtitle: '安全登录链接已发送到你的邮箱。',
        notReceived: '没有收到？',
        resend: '重新发送',
        sentBodyBefore: '登录链接已发送至',
        sentBodyAfter: '，点击链接即可登录。',
        backToLogin: '返回登录',
        title: '使用魔法链接登录',
        subtitle: '无需密码，我们会发送安全登录链接到你的邮箱。',
        preferPassword: '更喜欢密码登录？',
        passwordLogin: '密码登录',
        email: '邮箱',
        sending: '发送中...',
        sendLink: '发送登录链接',
      }
    : {
        sentTitle: 'Check your email',
        sentSubtitle: 'A secure sign-in link has been sent to your inbox.',
        notReceived: "Didn't get it?",
        resend: 'Send again',
        sentBodyBefore: 'We sent a sign-in link to',
        sentBodyAfter: '. Open it to finish signing in.',
        backToLogin: 'Back to sign in',
        title: 'Sign in with magic link',
        subtitle: "No password needed. We'll send a secure sign-in link to your email.",
        preferPassword: 'Prefer using a password?',
        passwordLogin: 'Password sign in',
        email: 'Email',
        sending: 'Sending...',
        sendLink: 'Send login link',
      };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate sending magic link (not supported in local storage mode)
    setTimeout(() => {
      setIsSent(true);
      setIsLoading(false);
    }, 1500);
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
              className="font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              {copy.resend}
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center">
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
              <Link to="/login">
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
      title="Sign in with magic link"
      titleZh="使用魔法链接登录"
      subtitle="No password needed. We'll send a secure sign-in link to your email."
      subtitleZh="无需密码，我们会发送安全登录链接到你的邮箱。"
      footer={
        <>
          <span className="opacity-80">{copy.preferPassword}</span>{' '}
          <Link
            to="/login"
            className="font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
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
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="h-11 rounded-md pl-11"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="h-11 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
          disabled={isLoading || !email}
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

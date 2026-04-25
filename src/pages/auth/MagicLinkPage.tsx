import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { AuthShell } from '@/features/marketing/AuthShell';

export default function MagicLinkPage() {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

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
        subtitle="We've sent a secure sign-in link to your inbox."
        subtitleZh="安全登录链接已发送到你的邮箱。"
        footer={
          <>
            <span className="opacity-80">Didn't receive it?</span>{' '}
            <button
              type="button"
              onClick={() => {
                setIsSent(false);
                setEmail('');
              }}
              className="font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Try again · <span lang="zh-CN">重新发送</span>
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="text-sm text-slate-700 dark:text-white/80">
            We sent a one-tap sign-in link to{' '}
            <strong className="break-all font-semibold text-slate-900 dark:text-white">{email}</strong>
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-white/50" lang="zh-CN">
            点击邮件中的链接即可立即登录。
          </p>

          <div className="mt-6 w-full">
            <Link to="/login">
              <Button
                variant="outline"
                className="h-12 w-full rounded-2xl border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.08]"
              >
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Sign in with a magic link"
      titleZh="使用魔法链接登录"
      subtitle="No password needed — we'll email you a secure link."
      subtitleZh="无需密码，我们会发送安全登录链接到你的邮箱。"
      footer={
        <>
          <span className="opacity-80">Prefer a password?</span>{' '}
          <Link
            to="/login"
            className="font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Sign in with password
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-slate-700 dark:text-white/70"
          >
            Email <span className="ml-1.5 text-xs text-slate-500 dark:text-white/40" lang="zh-CN">电子邮箱</span>
          </Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/40"
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
              className="h-12 rounded-2xl border-slate-200 bg-white pl-11 text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/25"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-2xl bg-emerald-600 text-sm font-semibold text-white shadow-glow-emerald transition-all hover:bg-emerald-500 hover:shadow-glow-emerald-lg disabled:opacity-60 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400"
          disabled={isLoading || !email}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send magic link <span className="ml-2 opacity-70" lang="zh-CN">发送登录链接</span>
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Loader2, Sparkles, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { resolveAuthRedirect } from '@/lib/authRedirect';
import { resetPassword } from '@/lib/supabase-auth';
import { AuthShell } from '@/features/marketing/AuthShell';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const redirectTarget = resolveAuthRedirect(location.search, '/dashboard/today');

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to={redirectTarget} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('请输入电子邮箱和密码');
      return;
    }

    setIsLoading(true);

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      toast.error('登录超时，请检查网络连接后重试');
    }, 15000); // 15 second timeout

    try {
      const { success, error } = await login(email, password);
      clearTimeout(timeoutId);

      if (success) {
        toast.success('登录成功！');
        navigate(redirectTarget, { replace: true });
      } else {
        console.error('Login failed:', error);
        toast.error(error || '电子邮箱或密码错误');
      }
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      console.error('Login exception:', error);
      toast.error(error instanceof TypeError
        ? '网络连接失败，请检查网络后重试'
        : '登录失败，请稍后重试');
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  // Demo login — try login, if no account create one and retry (max 2 API calls)
  const handleDemoLogin = async () => {
    setIsLoading(true);
    const demoEmail = (import.meta.env.VITE_DEMO_EMAIL as string | undefined) || 'demo@example.com';
    const demoPassword = (import.meta.env.VITE_DEMO_PASSWORD as string | undefined) || 'Demo@123456';

    try {
      // Step 1: try login
      const first = await login(demoEmail, demoPassword);
      if (first.success) {
        toast.success('欢迎使用演示账号！');
        navigate(redirectTarget, { replace: true });
        return;
      }

      // Step 2: create account then login
      await register(demoEmail, demoPassword, 'Demo User');
      const retry = await login(demoEmail, demoPassword);
      if (retry.success) {
        toast.success('欢迎使用演示账号！');
        navigate(redirectTarget, { replace: true });
        return;
      }

      toast.error('演示账号暂时不可用，请尝试注册新账号');
    } catch (err) {
      toast.error(err instanceof TypeError
        ? '网络连接失败，请检查网络后重试'
        : '演示账号暂时不可用，请尝试注册新账号');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('请输入电子邮箱');
      return;
    }
    setIsResetting(true);
    try {
      const { success, error } = await resetPassword(resetEmail);
      if (success) {
        toast.success('重置密码邮件已发送，请检查您的邮箱');
        setShowForgotPassword(false);
      } else {
        toast.error(error || '发送失败，请稍后重试');
      }
    } catch {
      toast.error('网络错误，请稍后重试');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <AuthShell
        title="Welcome back"
        titleZh="欢迎回来"
        subtitle="Sign in to continue your daily learning."
        subtitleZh="登录后继续你今天的学习节奏。"
        footer={
          <>
            <span className="opacity-80">Don't have an account yet?</span>{' '}
            <Link
              to={`/register${location.search}`}
              className="font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Create one
            </Link>
            <span className="mx-1.5 text-slate-400 dark:text-white/30">·</span>
            <Link
              to={`/register${location.search}`}
              className="font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
              lang="zh-CN"
            >
              注册新账号
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
              <span>Email</span>
              <span className="ml-1.5 text-xs text-slate-500 dark:text-white/40" lang="zh-CN">
                电子邮箱
              </span>
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="h-12 rounded-2xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/25"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-slate-700 dark:text-white/70"
              >
                <span>Password</span>
                <span className="ml-1.5 text-xs text-slate-500 dark:text-white/40" lang="zh-CN">
                  密码
                </span>
              </Label>
              <button
                type="button"
                onClick={() => { setResetEmail(email); setShowForgotPassword(true); }}
                className="text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Forgot password? <span lang="zh-CN">忘记密码？</span>
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="h-12 rounded-2xl border-slate-200 bg-white pr-12 text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/25"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-white/40 dark:hover:bg-white/[0.06] dark:hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-2xl bg-emerald-600 text-sm font-semibold text-white shadow-glow-emerald transition-all hover:bg-emerald-500 hover:shadow-glow-emerald-lg disabled:opacity-60 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in <span className="ml-2 opacity-70" lang="zh-CN">登录</span>
              </>
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="bg-slate-200 dark:bg-white/[0.08]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 dark:bg-transparent dark:text-white/30">
              or <span lang="zh-CN">或</span>
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-2xl border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.08] dark:hover:text-white"
          onClick={handleDemoLogin}
          disabled={isLoading}
        >
          <Sparkles className="mr-2 h-4 w-4 text-emerald-500" />
          <span>Try the demo</span>
          <span className="ml-2 text-slate-500 dark:text-white/50" lang="zh-CN">
            体验演示账号
          </span>
        </Button>
      </AuthShell>

      {/* Forgot Password Overlay — kept lightweight; reuses same focus model. */}
      {showForgotPassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm dark:bg-black/70"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-password-title"
        >
          <div className="w-full max-w-[400px] rounded-3xl border border-slate-200/60 bg-white p-8 shadow-2xl dark:border-white/[0.08] dark:bg-[#0a0a0a]">
            <h3
              id="reset-password-title"
              className="text-center text-xl font-semibold tracking-tight text-slate-900 dark:text-white"
            >
              Reset password
            </h3>
            <p className="mt-1 text-center text-sm text-emerald-600 dark:text-emerald-400" lang="zh-CN">
              重置密码
            </p>
            <p className="mt-3 text-center text-sm text-slate-600 dark:text-white/50">
              We'll email you a secure reset link.
              <br />
              <span lang="zh-CN" className="text-xs text-slate-500 dark:text-white/40">
                我们会向你的邮箱发送重置链接。
              </span>
            </p>
            <form onSubmit={handleResetPassword} className="mt-6 space-y-4" noValidate>
              <div className="space-y-2">
                <Label
                  htmlFor="reset-email"
                  className="text-sm font-medium text-slate-700 dark:text-white/70"
                >
                  Email <span className="ml-1.5 text-xs text-slate-500 dark:text-white/40" lang="zh-CN">电子邮箱</span>
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={isResetting}
                  required
                  autoFocus
                  className="h-12 rounded-2xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/25"
                />
              </div>
              <Button
                type="submit"
                className="h-12 w-full rounded-2xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400"
                disabled={isResetting}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send reset link
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-full rounded-2xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-white/50 dark:hover:bg-white/[0.06] dark:hover:text-white"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to sign in
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

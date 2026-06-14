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
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, startDemoSession, isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const redirectTarget = resolveAuthRedirect(location.search, '/dashboard/today');
  const copy = isZh
    ? {
        title: '欢迎回来',
        subtitle: '登录后继续你今天的学习节奏。',
        noAccount: '还没有账号？',
        register: '注册',
        email: '邮箱',
        password: '密码',
        forgotPassword: '忘记密码？',
        showPassword: '显示密码',
        hidePassword: '隐藏密码',
        signingIn: '登录中...',
        signIn: '登录',
        divider: '或',
        demo: '体验本地演示',
        demoHint: '不会创建真实账号，演示数据仅保存在当前浏览器。',
        resetTitle: '重置密码',
        resetBody: '我们会向你的邮箱发送重置链接。',
        sending: '发送中...',
        sendReset: '发送重置链接',
        backToLogin: '返回登录',
        missingCredentials: '请输入电子邮箱和密码',
        loginTimeout: '登录超时，请检查网络连接后重试',
        loginSuccess: '登录成功！',
        invalidCredentials: '电子邮箱或密码错误',
        networkError: '网络连接失败，请检查网络后重试',
        loginFailed: '登录失败，请稍后重试',
        demoSuccess: '演示学习空间已准备好',
        demoUnavailable: '演示账号暂时不可用，请尝试注册新账号',
        missingEmail: '请输入电子邮箱',
        resetSuccess: '重置密码邮件已发送，请检查您的邮箱',
        sendFailed: '发送失败，请稍后重试',
        genericNetworkError: '网络错误，请稍后重试',
      }
    : {
        title: 'Welcome back',
        subtitle: 'Sign in to continue your learning rhythm for today.',
        noAccount: "Don't have an account?",
        register: 'Create account',
        email: 'Email',
        password: 'Password',
        forgotPassword: 'Forgot password?',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        signingIn: 'Signing in...',
        signIn: 'Sign in',
        divider: 'or',
        demo: 'Try local demo',
        demoHint: 'No real account will be created. Demo data stays in this browser.',
        resetTitle: 'Reset password',
        resetBody: "We'll send a reset link to your email.",
        sending: 'Sending...',
        sendReset: 'Send reset link',
        backToLogin: 'Back to sign in',
        missingCredentials: 'Enter your email and password',
        loginTimeout: 'Sign-in timed out. Check your connection and try again.',
        loginSuccess: 'Signed in successfully!',
        invalidCredentials: 'Incorrect email or password',
        networkError: 'Network connection failed. Check your connection and try again.',
        loginFailed: 'Sign-in failed. Please try again later.',
        demoSuccess: 'Demo workspace ready!',
        demoUnavailable: 'Demo mode is unavailable. Try creating a new account.',
        missingEmail: 'Enter your email',
        resetSuccess: 'Password reset email sent. Check your inbox.',
        sendFailed: 'Could not send the email. Please try again later.',
        genericNetworkError: 'Network error. Please try again later.',
      };

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to={redirectTarget} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(copy.missingCredentials);
      return;
    }

    setIsLoading(true);

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      toast.error(copy.loginTimeout);
    }, 15000); // 15 second timeout

    try {
      const { success, error } = await login(email, password);
      clearTimeout(timeoutId);

      if (success) {
        toast.success(copy.loginSuccess);
        navigate(redirectTarget, { replace: true });
      } else {
        console.error('Login failed:', error);
        toast.error(error || copy.invalidCredentials);
      }
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      console.error('Login exception:', error);
      toast.error(error instanceof TypeError
        ? copy.networkError
        : copy.loginFailed);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);

    try {
      const result = await startDemoSession();
      if (result.success) {
        toast.success(copy.demoSuccess);
        navigate(redirectTarget, { replace: true });
        return;
      }

      toast.error(result.error || copy.demoUnavailable);
    } catch (err) {
      toast.error(err instanceof TypeError ? copy.networkError : copy.demoUnavailable);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error(copy.missingEmail);
      return;
    }
    setIsResetting(true);
    try {
      const { success, error } = await resetPassword(resetEmail);
      if (success) {
        toast.success(copy.resetSuccess);
        setShowForgotPassword(false);
      } else {
        toast.error(error || copy.sendFailed);
      }
    } catch {
      toast.error(copy.genericNetworkError);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <AuthShell
        title="Welcome back"
        titleZh="欢迎回来"
        subtitle="Sign in to continue your learning rhythm for today."
        subtitleZh="登录后继续你今天的学习节奏。"
        footer={
          <>
            <span className="opacity-80">{copy.noAccount}</span>{' '}
            <Link
              to={`/register${location.search}`}
              className="font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              {copy.register}
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
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="h-11 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-muted-foreground"
              >
                {copy.password}
              </Label>
              <button
                type="button"
                onClick={() => { setResetEmail(email); setShowForgotPassword(true); }}
                className="text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                {copy.forgotPassword}
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
                className="h-11 rounded-md pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {copy.signingIn}
              </>
            ) : (
              <>{copy.signIn}</>
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground">{copy.divider}</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-md"
          onClick={handleDemoLogin}
          disabled={isLoading}
        >
          <Sparkles className="mr-2 h-4 w-4 text-primary" />
          {copy.demo}
        </Button>
        <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">
          {copy.demoHint}
        </p>
      </AuthShell>

      {/* Forgot Password Overlay — kept lightweight; reuses same focus model. */}
      {showForgotPassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-password-title"
        >
          <div className="w-full max-w-[400px] rounded-xl border border-border bg-card p-7 shadow-lg">
            <h3
              id="reset-password-title"
              className="text-center text-lg font-semibold tracking-tight text-foreground"
            >
              {copy.resetTitle}
            </h3>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              {copy.resetBody}
            </p>
            <form onSubmit={handleResetPassword} className="mt-6 space-y-4" noValidate>
              <div className="space-y-2">
                <Label
                  htmlFor="reset-email"
                  className="text-sm font-medium text-muted-foreground"
                >
                  {copy.email}
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
                  className="h-11 rounded-md"
                />
              </div>
              <Button
                type="submit"
                className="h-11 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
                disabled={isResetting}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {copy.sending}
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    {copy.sendReset}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-full rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setShowForgotPassword(false)}
              >
                {copy.backToLogin}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

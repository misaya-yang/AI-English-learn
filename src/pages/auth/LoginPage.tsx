import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Eye, EyeOff, Loader2, Mail, MonitorPlay } from 'lucide-react';
import { toast } from 'sonner';
import { resolveAuthRedirect } from '@/lib/authRedirect';
import { resetPassword } from '@/lib/supabase-auth';
import { AuthShell } from '@/features/marketing/AuthShell';
import { useTranslation } from 'react-i18next';

const LOGIN_TIMEOUT_MS = 15_000;

class LoginTimeoutError extends Error {
  constructor() {
    super('login_timeout');
    this.name = 'LoginTimeoutError';
  }
}

const withLoginTimeout = async <T,>(request: Promise<T>): Promise<T> => {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new LoginTimeoutError()), LOGIN_TIMEOUT_MS);
  });

  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
};

interface InlineMessage {
  tone: 'error' | 'status';
  text: string;
}

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
  const [formMessage, setFormMessage] = useState<InlineMessage | null>(null);
  const [resetMessage, setResetMessage] = useState<InlineMessage | null>(null);

  const redirectTarget = resolveAuthRedirect(location.search, '/dashboard/today');
  const copy = isZh
    ? {
        title: '欢迎回来',
        subtitle: '登录后进入今日页。',
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
        demo: '进入本地演示',
        demoHint: '直接打开浏览器内的演示学习空间，不会创建或登录真实账号。',
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
        demoSuccess: '演示已准备好',
        demoUnavailable: '演示账号暂时不可用，请尝试注册新账号',
        missingEmail: '请输入电子邮箱',
        resetSuccess: '重置密码邮件已发送，请检查您的邮箱',
        sendFailed: '发送失败，请稍后重试',
        genericNetworkError: '网络错误，请稍后重试',
      }
    : {
        title: 'Welcome back',
        subtitle: 'Sign in to open Today.',
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
        demo: 'Open local demo',
        demoHint: 'Open a browser-only learning workspace without creating or signing in to a real account.',
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
        demoSuccess: 'Demo is ready.',
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

    if (!email.trim() || !password) {
      setFormMessage({ tone: 'error', text: copy.missingCredentials });
      toast.error(copy.missingCredentials);
      return;
    }

    setIsLoading(true);
    setFormMessage(null);

    try {
      const { success, error } = await withLoginTimeout(login(email.trim(), password));

      if (success) {
        setFormMessage({ tone: 'status', text: copy.loginSuccess });
        toast.success(copy.loginSuccess);
        navigate(redirectTarget, { replace: true });
      } else {
        console.error('Login failed:', error);
        const message = error || copy.invalidCredentials;
        setFormMessage({ tone: 'error', text: message });
        toast.error(message);
      }
    } catch (error: unknown) {
      console.error('Login exception:', error);
      const message = error instanceof LoginTimeoutError
        ? copy.loginTimeout
        : error instanceof TypeError
          ? copy.networkError
          : copy.loginFailed;
      setFormMessage({ tone: 'error', text: message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setFormMessage(null);

    try {
      const result = await startDemoSession();
      if (result.success) {
        setFormMessage({ tone: 'status', text: copy.demoSuccess });
        toast.success(copy.demoSuccess);
        navigate(redirectTarget, { replace: true });
        return;
      }

      const message = result.error || copy.demoUnavailable;
      setFormMessage({ tone: 'error', text: message });
      toast.error(message);
    } catch (err) {
      const message = err instanceof TypeError ? copy.networkError : copy.demoUnavailable;
      setFormMessage({ tone: 'error', text: message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetMessage({ tone: 'error', text: copy.missingEmail });
      toast.error(copy.missingEmail);
      return;
    }
    setIsResetting(true);
    setResetMessage(null);
    try {
      const { success, error } = await resetPassword(resetEmail.trim());
      if (success) {
        setResetMessage({ tone: 'status', text: copy.resetSuccess });
        toast.success(copy.resetSuccess);
        setShowForgotPassword(false);
      } else {
        const message = error || copy.sendFailed;
        setResetMessage({ tone: 'error', text: message });
        toast.error(message);
      }
    } catch {
      setResetMessage({ tone: 'error', text: copy.genericNetworkError });
      toast.error(copy.genericNetworkError);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Dialog
      open={showForgotPassword}
      onOpenChange={(open) => {
        setShowForgotPassword(open);
        if (!open) setResetMessage(null);
      }}
    >
      <AuthShell
        title="Welcome back"
        titleZh="欢迎回来"
        subtitle="Sign in to open Today."
        subtitleZh="登录后进入今日页。"
        footer={
          <>
            <span className="opacity-80">{copy.noAccount}</span>{' '}
            <Link
              to={`/register${location.search}`}
              className="font-medium text-primary transition-colors hover:text-primary/80"
            >
              {copy.register}
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-busy={isLoading}>
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (formMessage) setFormMessage(null);
              }}
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
              <DialogTrigger asChild>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setResetEmail(email);
                    setResetMessage(null);
                  }}
                  className="text-xs font-medium text-primary transition-colors hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copy.forgotPassword}
                </button>
              </DialogTrigger>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formMessage) setFormMessage(null);
                }}
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
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>

          {formMessage && (
            <p
              className={formMessage.tone === 'error' ? 'text-sm text-destructive' : 'text-sm text-primary'}
              role={formMessage.tone === 'error' ? 'alert' : 'status'}
              aria-live={formMessage.tone === 'error' ? 'assertive' : 'polite'}
            >
              {formMessage.text}
            </p>
          )}
          {isLoading && (
            <p className="sr-only" role="status" aria-live="polite">
              {copy.signingIn}
            </p>
          )}

          <Button
            type="submit"
            className="h-11 w-full rounded-md text-sm font-medium shadow-none transition-colors disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                {copy.signingIn}
              </>
            ) : (
              <>{copy.signIn}</>
            )}
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs">
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
          <MonitorPlay data-testid="local-demo-icon" className="mr-2 h-4 w-4 text-primary" aria-hidden="true" />
          {copy.demo}
        </Button>
        <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">
          {copy.demoHint}
        </p>
      </AuthShell>

      <DialogContent className="max-w-[400px] gap-5 p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle>{copy.resetTitle}</DialogTitle>
          <DialogDescription>{copy.resetBody}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleResetPassword} className="space-y-4" noValidate aria-busy={isResetting}>
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
              onChange={(e) => {
                setResetEmail(e.target.value);
                if (resetMessage) setResetMessage(null);
              }}
              disabled={isResetting}
              required
              autoFocus
              aria-invalid={resetMessage?.tone === 'error'}
              aria-describedby={resetMessage ? 'reset-password-message' : undefined}
              className="h-11 rounded-md"
            />
          </div>

          {resetMessage && (
            <p
              id="reset-password-message"
              className={resetMessage.tone === 'error' ? 'text-sm text-destructive' : 'text-sm text-primary'}
              role={resetMessage.tone === 'error' ? 'alert' : 'status'}
              aria-live={resetMessage.tone === 'error' ? 'assertive' : 'polite'}
            >
              {resetMessage.text}
            </p>
          )}
          {isResetting && (
            <p className="sr-only" role="status" aria-live="polite">
              {copy.sending}
            </p>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-md"
                disabled={isResetting}
              >
                {copy.backToLogin}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="h-11 rounded-md text-sm font-medium"
              disabled={isResetting || !resetEmail.trim()}
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  {copy.sending}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                  {copy.sendReset}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

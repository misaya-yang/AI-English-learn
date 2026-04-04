import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Eye, EyeOff, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { resolveAuthRedirect } from '@/lib/authRedirect';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      toast.error(error instanceof Error ? error.message : '登录失败，请稍后重试');
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  // Demo login for quick testing
  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const demoEmail = (import.meta.env.VITE_DEMO_EMAIL as string | undefined) || 'demo@example.com';
      const demoPassword = (import.meta.env.VITE_DEMO_PASSWORD as string | undefined) || 'Demo@123456';

      const { success, error } = await login(demoEmail, demoPassword);
      if (success) {
        toast.success('欢迎使用演示账号！');
        navigate(redirectTarget, { replace: true });
      } else {
        const normalized = (error || '').toLowerCase();
        const shouldTryCreate =
          normalized.includes('invalid login') ||
          normalized.includes('invalid credentials') ||
          normalized.includes('not found') ||
          normalized.includes('电子邮箱或密码错误');

        if (!shouldTryCreate) {
          toast.error(error || '演示账号登录失败');
          return;
        }

        const created = await register(demoEmail, demoPassword, 'Demo User');
        if (!created.success && !(created.error || '').toLowerCase().includes('already')) {
          toast.error(created.error || '演示账号创建失败');
          return;
        }

        const retry = await login(demoEmail, demoPassword);
        if (retry.success) {
          toast.success('欢迎使用演示账号！');
          navigate(redirectTarget, { replace: true });
          return;
        }

        const fallbackEmail = `demo.${Date.now()}@vocabdaily.app`;
        const fallbackPassword = 'Demo@123456';
        const fallbackRegister = await register(fallbackEmail, fallbackPassword, 'Demo User');
        if (!fallbackRegister.success) {
          toast.error(fallbackRegister.error || '演示账号登录失败');
          return;
        }
        toast.success('已创建临时演示账号');
        navigate(redirectTarget, { replace: true });
      }
    } catch {
      toast.error('登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#020303] p-4 overflow-hidden">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-emerald-500/[0.07] blur-[140px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.04] blur-[120px]" />
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--grid-line-color))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--grid-line-color))_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative w-full max-w-[420px]">
        {/* Logo */}
        <Link to="/" className="group flex items-center justify-center gap-3 mb-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 transition-all group-hover:bg-emerald-500/20 group-hover:shadow-glow-emerald">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">VocabDaily AI</h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500">Learning Cockpit</p>
          </div>
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-glass backdrop-blur-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-white">登录</h2>
            <p className="mt-2 text-sm text-white/50">欢迎回来！请输入您的账号信息</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white/70">电子邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-white/70">密码</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/20 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-2xl bg-emerald-500 text-sm font-semibold text-black transition-all hover:bg-emerald-400 hover:shadow-glow-emerald"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="bg-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-3 text-white/30">或</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            <Sparkles className="mr-2 h-4 w-4 text-emerald-400" />
            使用演示账号
          </Button>

          <p className="mt-6 text-sm text-center text-white/40">
            还没有账号？{' '}
            <Link to={`/register${location.search}`} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              立即注册
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center mt-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

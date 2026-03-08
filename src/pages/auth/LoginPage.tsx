import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react';
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
      console.log('Login form submitted for:', email);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="font-bold text-xl">VocabDaily AI</h1>
            <p className="text-xs text-muted-foreground">智能单词学习平台</p>
          </div>
        </Link>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">登录</CardTitle>
            <CardDescription className="text-center">
              欢迎回来！请输入您的账号信息
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">电子邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white"
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  或
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              使用演示账号
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              还没有账号？{' '}
              <Link to={`/register${location.search}`} className="text-emerald-600 hover:text-emerald-700 font-medium">
                立即注册
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { resolveAuthRedirect } from '@/lib/authRedirect';
import { AuthShell } from '@/features/marketing/AuthShell';
import { cn } from '@/lib/utils';

const specialCharacterRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

interface PasswordCheck {
  label: string;
  labelZh: string;
  passes: boolean;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, validatePassword } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const redirectTarget = resolveAuthRedirect(location.search, '/dashboard/today');

  // Redirect if already logged in
  if (isAuthenticated && !justRegistered) {
    return <Navigate to={redirectTarget} replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const passwordValidation = validatePassword(formData.password);
  const allChecksPass = passwordValidation.isValid;
  const passwordsMatch = formData.password === formData.confirmPassword;

  const passwordChecks: PasswordCheck[] = [
    { label: 'At least 8 characters', labelZh: '至少 8 个字符', passes: formData.password.length >= 8 },
    { label: 'One uppercase letter', labelZh: '包含大写字母', passes: /[A-Z]/.test(formData.password) },
    { label: 'One lowercase letter', labelZh: '包含小写字母', passes: /[a-z]/.test(formData.password) },
    { label: 'One number', labelZh: '包含数字', passes: /[0-9]/.test(formData.password) },
    { label: 'One special character', labelZh: '包含特殊字符', passes: specialCharacterRegex.test(formData.password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.displayName || !formData.email || !formData.password) {
      toast.error('请填写所有字段');
      return;
    }

    if (!passwordsMatch) {
      toast.error('密码不一致');
      return;
    }

    if (!allChecksPass) {
      toast.error('密码不符合要求');
      return;
    }

    if (!agreeTerms) {
      toast.error('请同意服务条款');
      return;
    }

    setIsLoading(true);

    try {
      const { success, error } = await register(formData.email, formData.password, formData.displayName);
      if (success) {
        setJustRegistered(true);
        toast.success('注册成功！请检查邮箱验证链接');
        navigate(`/onboarding${location.search}`);
      } else {
        toast.error(error || '注册失败');
      }
    } catch {
      toast.error('注册失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      titleZh="创建账号"
      subtitle="Free to start. Build a daily English habit in minutes."
      subtitleZh="免费开始，几分钟就能养成每天学英语的习惯。"
      footer={
        <>
          <span className="opacity-80">Already have an account?</span>{' '}
          <Link
            to={`/login${location.search}`}
            className="font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Sign in
          </Link>
          <span className="mx-1.5 text-slate-400 dark:text-white/30">·</span>
          <Link
            to={`/login${location.search}`}
            className="font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
            lang="zh-CN"
          >
            立即登录
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label
            htmlFor="displayName"
            className="text-sm font-medium text-slate-700 dark:text-white/70"
          >
            Display name <span className="ml-1.5 text-xs text-slate-500 dark:text-white/40" lang="zh-CN">显示名称</span>
          </Label>
          <Input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            placeholder="What should we call you?"
            value={formData.displayName}
            onChange={handleChange}
            disabled={isLoading}
            required
            className="h-11 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-slate-700 dark:text-white/70"
          >
            Email <span className="ml-1.5 text-xs text-slate-500 dark:text-white/40" lang="zh-CN">电子邮箱</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            required
            className="h-11 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-slate-700 dark:text-white/70"
          >
            Password <span className="ml-1.5 text-xs text-slate-500 dark:text-white/40" lang="zh-CN">密码</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
              className="h-11 rounded-md pr-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          <ul className="mt-2 space-y-1.5">
            {passwordChecks.map((check) => (
              <li
                key={check.label}
                className={cn(
                  'flex items-center gap-2 text-xs transition-colors',
                  check.passes
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-white/40',
                )}
              >
                <Check
                  className={cn(
                    'h-3 w-3 flex-shrink-0 transition-colors',
                    check.passes ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-300 dark:text-white/20',
                  )}
                />
                <span>{check.label}</span>
                <span className="text-slate-400 dark:text-white/30" aria-hidden="true">·</span>
                <span lang="zh-CN">{check.labelZh}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-slate-700 dark:text-white/70"
          >
            Confirm password <span className="ml-1.5 text-xs text-slate-500 dark:text-white/40" lang="zh-CN">确认密码</span>
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            required
            className="h-11 rounded-md"
          />
          {formData.confirmPassword && !passwordsMatch && (
            <p className="text-xs text-rose-500" role="alert">
              Passwords don't match · <span lang="zh-CN">两次输入的密码不一致</span>
            </p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={agreeTerms}
            onCheckedChange={(checked) => setAgreeTerms(checked === true)}
            className="mt-0.5"
          />
          <Label
            htmlFor="terms"
            className="text-xs leading-relaxed font-normal text-slate-600 dark:text-white/60"
          >
            I agree to the{' '}
            <Link
              to="#"
              className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to="#"
              className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-400 dark:text-white/30"> · </span>
            <span lang="zh-CN">同意服务条款与隐私政策</span>
          </Label>
        </div>

        <Button
          type="submit"
          className="h-11 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
          disabled={isLoading || !allChecksPass || !agreeTerms || !passwordsMatch}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account <span className="ml-2 opacity-70" lang="zh-CN">创建账号</span>
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

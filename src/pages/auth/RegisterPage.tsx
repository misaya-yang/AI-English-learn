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
import { useTranslation } from 'react-i18next';

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
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');
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
  const copy = isZh
    ? {
        title: '创建账号',
        subtitle: '创建后进入今日页。',
        hasAccount: '已有账号？',
        signIn: '立即登录',
        displayName: '昵称',
        displayNamePlaceholder: '你的昵称',
        email: '邮箱',
        password: '密码',
        confirmPassword: '确认密码',
        showPassword: '显示密码',
        hidePassword: '隐藏密码',
        passwordMismatch: '两次输入的密码不一致',
        agreePrefix: '同意',
        terms: '服务条款',
        and: '与',
        privacy: '隐私政策',
        creating: '创建中...',
        createAccount: '创建账号',
        missingFields: '请填写所有字段',
        passwordsDoNotMatch: '密码不一致',
        weakPassword: '密码不符合要求',
        termsRequired: '请同意服务条款',
        success: '注册成功！请检查邮箱验证链接',
        failed: '注册失败',
        retry: '注册失败，请稍后重试',
      }
    : {
        title: 'Create account',
        subtitle: 'Create an account and open Today.',
        hasAccount: 'Already have an account?',
        signIn: 'Sign in',
        displayName: 'Display name',
        displayNamePlaceholder: 'Your name',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm password',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        passwordMismatch: 'Passwords do not match',
        agreePrefix: 'I agree to the',
        terms: 'Terms of Service',
        and: 'and',
        privacy: 'Privacy Policy',
        creating: 'Creating...',
        createAccount: 'Create account',
        missingFields: 'Fill in all fields',
        passwordsDoNotMatch: 'Passwords do not match',
        weakPassword: 'Password does not meet the requirements',
        termsRequired: 'Please agree to the Terms of Service',
        success: 'Account created. Check your email for the verification link.',
        failed: 'Registration failed',
        retry: 'Registration failed. Please try again later.',
      };

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
    { label: 'One letter', labelZh: '包含大写字母', passes: /[A-Z]/.test(formData.password) },
    { label: 'One lowercase letter', labelZh: '包含小写字母', passes: /[a-z]/.test(formData.password) },
    { label: 'One number', labelZh: '包含数字', passes: /[0-9]/.test(formData.password) },
    { label: 'One special character', labelZh: '包含特殊字符', passes: specialCharacterRegex.test(formData.password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.displayName || !formData.email || !formData.password) {
      toast.error(copy.missingFields);
      return;
    }

    if (!passwordsMatch) {
      toast.error(copy.passwordsDoNotMatch);
      return;
    }

    if (!allChecksPass) {
      toast.error(copy.weakPassword);
      return;
    }

    if (!agreeTerms) {
      toast.error(copy.termsRequired);
      return;
    }

    setIsLoading(true);
    setJustRegistered(true);

    try {
      const { success, error } = await register(formData.email, formData.password, formData.displayName);
      if (success) {
        toast.success(copy.success);
        navigate(`/onboarding${location.search}`);
      } else {
        setJustRegistered(false);
        toast.error(error || copy.failed);
      }
    } catch {
      setJustRegistered(false);
      toast.error(copy.retry);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      titleZh="创建账号"
      subtitle="Create an account and open Today."
      subtitleZh="创建后进入今日页。"
      footer={
        <>
          <span className="opacity-80">{copy.hasAccount}</span>{' '}
          <Link
            to={`/login${location.search}`}
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            {copy.signIn}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label
            htmlFor="displayName"
            className="text-sm font-medium text-muted-foreground"
          >
            {copy.displayName}
          </Label>
          <Input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            placeholder={copy.displayNamePlaceholder}
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
            className="text-sm font-medium text-muted-foreground"
          >
            {copy.email}
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
            className="text-sm font-medium text-muted-foreground"
          >
            {copy.password}
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
              aria-label={showPassword ? copy.hidePassword : copy.showPassword}
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
                    ? 'text-[hsl(var(--success))]'
                    : 'text-muted-foreground',
                )}
              >
                <Check
                  className={cn(
                    'h-3 w-3 flex-shrink-0 transition-colors',
                    check.passes ? 'text-[hsl(var(--success))]' : 'text-muted-foreground/40',
                  )}
                />
                <span>{isZh ? check.labelZh : check.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-muted-foreground"
          >
            {copy.confirmPassword}
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
              {copy.passwordMismatch}
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
            className="text-xs leading-relaxed font-normal text-muted-foreground"
          >
            {copy.agreePrefix}{' '}
            <Link
              to="/terms"
              className="font-medium text-primary hover:text-primary/80"
            >
              {copy.terms}
            </Link>{' '}
            {copy.and}{' '}
            <Link
              to="/privacy"
              className="font-medium text-primary hover:text-primary/80"
            >
              {copy.privacy}
            </Link>
          </Label>
        </div>

        <Button
          type="submit"
          className="h-11 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-none transition-colors hover:bg-primary/90 disabled:opacity-60"
          disabled={isLoading || !allChecksPass || !agreeTerms || !passwordsMatch}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {copy.creating}
            </>
          ) : (
            <>{copy.createAccount}</>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

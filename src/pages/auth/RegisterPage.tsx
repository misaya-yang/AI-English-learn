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

interface PasswordCheck {
  label: string;
  labelZh: string;
  validatorError: string;
  passes: boolean;
}

const passwordRuleCopy = [
  {
    label: 'At least 8 characters',
    labelZh: '至少 8 个字符',
    validatorError: '密码至少需要8个字符',
  },
  {
    label: 'One uppercase letter',
    labelZh: '包含大写字母',
    validatorError: '密码需要包含至少一个大写字母',
  },
  {
    label: 'One lowercase letter',
    labelZh: '包含小写字母',
    validatorError: '密码需要包含至少一个小写字母',
  },
  {
    label: 'One number',
    labelZh: '包含数字',
    validatorError: '密码需要包含至少一个数字',
  },
  {
    label: 'One special character',
    labelZh: '包含特殊字符',
    validatorError: '密码需要包含至少一个特殊字符 (!@#$%^&*等)',
  },
] as const;

interface InlineMessage {
  tone: 'error' | 'status';
  text: string;
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
  const [formMessage, setFormMessage] = useState<InlineMessage | null>(null);
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
        passwordRequirements: '密码要求',
        requirementMet: '已满足',
        requirementPending: '未满足',
        allRequirementsMet: '所有密码要求均已满足',
        remainingRequirements: '项密码要求尚未满足',
        additionalRequirement: '还有一项由安全校验器返回的密码要求尚未满足',
        success: '账号已创建，继续完成学习设置。',
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
        passwordRequirements: 'Password requirements',
        requirementMet: 'Met',
        requirementPending: 'Not met',
        allRequirementsMet: 'All password requirements are met.',
        remainingRequirements: 'password requirements remaining.',
        additionalRequirement: 'An additional password requirement from the security validator is not met.',
        success: 'Account created. Continue with your learning setup.',
        failed: 'Registration failed',
        retry: 'Registration failed. Please try again later.',
      };

  // Redirect if already logged in
  if (isAuthenticated && !justRegistered) {
    return <Navigate to={redirectTarget} replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formMessage) setFormMessage(null);
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const passwordValidation = validatePassword(formData.password);
  const allChecksPass = passwordValidation.isValid;
  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;
  const validatorErrors = new Set(passwordValidation.errors);
  const passwordChecks: PasswordCheck[] = passwordRuleCopy.map((rule) => ({
    ...rule,
    passes: formData.password.length > 0 && !validatorErrors.has(rule.validatorError),
  }));
  const knownValidatorErrors = new Set(passwordRuleCopy.map((rule) => rule.validatorError));
  const additionalValidatorErrors = passwordValidation.errors.filter(
    (error) => !knownValidatorErrors.has(error as (typeof passwordRuleCopy)[number]['validatorError']),
  );
  const hasUnspecifiedValidatorFailure =
    formData.password.length > 0 &&
    !passwordValidation.isValid &&
    passwordValidation.errors.length === 0;
  const remainingRequirementCount =
    passwordValidation.errors.length || (hasUnspecifiedValidatorFailure ? 1 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.displayName.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setFormMessage({ tone: 'error', text: copy.missingFields });
      toast.error(copy.missingFields);
      return;
    }

    if (!passwordsMatch) {
      setFormMessage({ tone: 'error', text: copy.passwordsDoNotMatch });
      toast.error(copy.passwordsDoNotMatch);
      return;
    }

    if (!allChecksPass) {
      setFormMessage({ tone: 'error', text: copy.weakPassword });
      toast.error(copy.weakPassword);
      return;
    }

    if (!agreeTerms) {
      setFormMessage({ tone: 'error', text: copy.termsRequired });
      toast.error(copy.termsRequired);
      return;
    }

    setIsLoading(true);
    setJustRegistered(true);
    setFormMessage(null);

    try {
      const { success, error } = await register(
        formData.email.trim(),
        formData.password,
        formData.displayName.trim(),
      );
      if (success) {
        setFormMessage({ tone: 'status', text: copy.success });
        toast.success(copy.success);
        navigate(`/onboarding${location.search}`);
      } else {
        setJustRegistered(false);
        const message = error || copy.failed;
        setFormMessage({ tone: 'error', text: message });
        toast.error(message);
      }
    } catch {
      setJustRegistered(false);
      setFormMessage({ tone: 'error', text: copy.retry });
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
      <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-busy={isLoading}>
        <div className="grid gap-4 sm:grid-cols-2">
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
              aria-invalid={formData.password.length > 0 && !allChecksPass}
              aria-describedby="password-requirements password-validation-status"
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

          <div className="mt-2 rounded-lg bg-muted/25 px-3 py-2.5">
            <p className="text-xs font-medium text-foreground">{copy.passwordRequirements}</p>
            <ul id="password-requirements" className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {passwordChecks.map((check) => (
                <li
                  key={check.validatorError}
                  className={cn(
                    'flex items-center gap-1.5 text-xs transition-colors',
                    check.passes
                      ? 'text-[hsl(var(--success))]'
                      : 'text-muted-foreground',
                  )}
                >
                  {check.passes ? (
                    <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
                  ) : (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-current opacity-45" aria-hidden="true" />
                  )}
                  <span>{isZh ? check.labelZh : check.label}</span>
                  <span className="sr-only">
                    {check.passes ? copy.requirementMet : copy.requirementPending}
                  </span>
                </li>
              ))}
              {additionalValidatorErrors.map((error, index) => (
                <li
                  key={`${error}-${index}`}
                  className="col-span-2 flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-current opacity-45" aria-hidden="true" />
                  <span>{isZh ? error : copy.additionalRequirement}</span>
                  <span className="sr-only">{copy.requirementPending}</span>
                </li>
              ))}
              {hasUnspecifiedValidatorFailure && (
                <li className="col-span-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-current opacity-45" aria-hidden="true" />
                  <span>{copy.additionalRequirement}</span>
                  <span className="sr-only">{copy.requirementPending}</span>
                </li>
              )}
            </ul>
            <p
              id="password-validation-status"
              className="sr-only"
              role="status"
              aria-live="polite"
            >
              {formData.password.length === 0
                ? copy.passwordRequirements
                : allChecksPass
                  ? copy.allRequirementsMet
                  : isZh
                    ? `还有 ${remainingRequirementCount} ${copy.remainingRequirements}`
                    : `${remainingRequirementCount} ${copy.remainingRequirements}`}
            </p>
          </div>
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
            aria-invalid={formData.confirmPassword.length > 0 && !passwordsMatch}
            aria-describedby={
              formData.confirmPassword.length > 0 && !passwordsMatch
                ? 'confirm-password-error'
                : undefined
            }
            className="h-11 rounded-md"
          />
          {formData.confirmPassword && !passwordsMatch && (
            <p
              id="confirm-password-error"
              className="text-xs text-destructive"
              role="alert"
              aria-live="assertive"
            >
              {copy.passwordMismatch}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={agreeTerms}
            onCheckedChange={(checked) => {
              setAgreeTerms(checked === true);
              if (formMessage) setFormMessage(null);
            }}
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
            {copy.creating}
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

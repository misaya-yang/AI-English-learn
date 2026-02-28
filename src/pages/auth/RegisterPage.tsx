import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const navigate = useNavigate();
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

  // Redirect if already logged in
  if (isAuthenticated && !justRegistered) {
    return <Navigate to="/dashboard" replace />;
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
        navigate('/onboarding');
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
            <CardTitle className="text-2xl text-center">创建账号</CardTitle>
            <CardDescription className="text-center">
              开始您的单词学习之旅
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">显示名称</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="您的名字"
                  value={formData.displayName}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">电子邮箱</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
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

                {/* Password Requirements */}
                <div className="space-y-1 mt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Check
                      className={`h-3 w-3 ${
                        formData.password.length >= 8 ? 'text-green-500' : 'text-muted-foreground'
                      }`}
                    />
                    <span className={formData.password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}>
                      至少8个字符
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Check
                      className={`h-3 w-3 ${
                        /[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-muted-foreground'
                      }`}
                    />
                    <span className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'}>
                      包含大写字母
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Check
                      className={`h-3 w-3 ${
                        /[a-z]/.test(formData.password) ? 'text-green-500' : 'text-muted-foreground'
                      }`}
                    />
                    <span className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'}>
                      包含小写字母
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Check
                      className={`h-3 w-3 ${
                        /[0-9]/.test(formData.password) ? 'text-green-500' : 'text-muted-foreground'
                      }`}
                    />
                    <span className={/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'}>
                      包含数字
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Check
                      className={`h-3 w-3 ${
                        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-500' : 'text-muted-foreground'
                      }`}
                    />
                    <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'}>
                      包含特殊字符
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500">密码不一致</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm font-normal leading-tight">
                  我同意{' '}
                  <Link to="#" className="text-emerald-600 hover:text-emerald-700">
                    服务条款
                  </Link>{' '}
                  和{' '}
                  <Link to="#" className="text-emerald-600 hover:text-emerald-700">
                    隐私政策
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white"
                disabled={isLoading || !allChecksPass || !agreeTerms || !passwordsMatch}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  '创建账号'
                )}
              </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground">
              已有账号？{' '}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                立即登录
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

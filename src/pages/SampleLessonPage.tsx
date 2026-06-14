import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { SampleLesson } from '@/features/sample/SampleLesson';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthRedirect } from '@/lib/authRedirect';

export default function SampleLessonPage() {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const isZh = i18n.language?.startsWith('zh');
  const saveProgressHref = isAuthenticated ? '/dashboard/today' : buildAuthRedirect('/dashboard/today', '/register');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-[hsl(var(--surface-raised))]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/20 bg-primary text-primary-foreground">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">VocabDaily</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button variant="outline" size="sm" className="hidden rounded-md sm:inline-flex" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {isZh ? '返回首页' : 'Back home'}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <SampleLesson isZh={Boolean(isZh)} saveProgressHref={saveProgressHref} />
      </main>
    </div>
  );
}

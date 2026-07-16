import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { SampleLesson } from '@/features/sample/SampleLesson';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { GlassSurface } from '@/components/ui/glass-surface';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthRedirect } from '@/lib/authRedirect';
import { BrandMark } from '@/features/marketing/BrandMark';

export default function SampleLessonPage() {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const isZh = i18n.language?.startsWith('zh');
  const continueHref = isAuthenticated ? '/dashboard/today' : buildAuthRedirect('/dashboard/today', '/register');

  return (
    <div className="study-premium-bg min-h-screen bg-background text-foreground">
      <header className="sticky top-3 z-30 px-3 sm:px-4">
        <GlassSurface variant="bar" className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-5">
          <BrandMark />
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button variant="glass" size="sm" className="hidden sm:inline-flex" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {isZh ? '返回首页' : 'Back home'}
              </Link>
            </Button>
          </div>
        </GlassSurface>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <SampleLesson
          isZh={Boolean(isZh)}
          continueHref={continueHref}
          requiresSignIn={!isAuthenticated}
        />
      </main>
    </div>
  );
}

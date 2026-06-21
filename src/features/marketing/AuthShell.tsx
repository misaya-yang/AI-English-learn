import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { BrandMark } from './BrandMark';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GlassSurface } from '@/components/ui/glass-surface';

interface SideRailCopy {
  headline: string;
  headlineZh: string;
  bullets: Array<{ en: string; zh: string }>;
}

interface AuthShellProps {
  /** Bilingual title (en + zh) shown above the panel — required for clarity. */
  title: string;
  titleZh: string;
  subtitle?: string;
  subtitleZh?: string;
  /** The main panel content (form, success message, etc.). */
  children: ReactNode;
  /** Slot rendered below the panel; e.g. "already have an account?". */
  footer?: ReactNode;
  /** Width tier — wider for onboarding, default for sign-in / register. */
  size?: 'default' | 'wide';
  /** Optional className passed to the panel container. */
  panelClassName?: string;
  /** Override the desktop side-rail copy. Defaults to i18n keys with bilingual fallbacks. */
  sideRail?: Partial<SideRailCopy>;
}

/**
 * AuthShell — Modern Learning Workbench auth surface.
 *
 * Light, frosted two-column layout on lg+, single column on mobile.
 * Glass stays in navigation and reassurance surfaces. Forms stay solid.
 */
export function AuthShell({
  title,
  titleZh,
  subtitle,
  subtitleZh,
  children,
  footer,
  size = 'default',
  panelClassName,
  sideRail,
}: AuthShellProps) {
  const { i18n, t } = useTranslation();
  const language = i18n.language ?? 'en';
  const isZh = language.startsWith('zh');
  const displayTitle = isZh ? titleZh : title;
  const displaySubtitle = isZh ? (subtitleZh ?? subtitle) : subtitle;
  const widthClass = size === 'wide' ? 'max-w-xl' : 'max-w-[420px]';

  const rail: SideRailCopy = {
    headline: sideRail?.headline ?? t('auth.shell.headline', { defaultValue: 'Today\'s words and practice' }),
    headlineZh: sideRail?.headlineZh ?? t('auth.shell.headlineZh', { defaultValue: '今天的词和练习' }),
    bullets: sideRail?.bullets ?? [
      { en: t('auth.shell.bullet1', { defaultValue: 'Due reviews' }), zh: t('auth.shell.bullet1Zh', { defaultValue: '到期复习' }) },
      { en: t('auth.shell.bullet2', { defaultValue: 'New words' }), zh: t('auth.shell.bullet2Zh', { defaultValue: '今日新词' }) },
      { en: t('auth.shell.bullet3', { defaultValue: 'Practice' }), zh: t('auth.shell.bullet3Zh', { defaultValue: '练习' }) },
    ],
  };
  const railBody = isZh
    ? t('auth.shell.bodyZh', { defaultValue: '登录后显示你的词和进度。' })
    : t('auth.shell.body', { defaultValue: 'Sign in to load your words and progress.' });

  return (
    <div className="study-premium-bg min-h-screen bg-background text-foreground">
      <main className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16 lg:py-16">
        {/* Form column — first on mobile per direction. */}
        <div className="order-1 flex justify-center lg:order-2 lg:justify-start">
          <div className={cn('w-full', widthClass)}>
            <GlassSurface variant="control" className="mb-4 ml-auto flex w-fit justify-end gap-2 p-1">
              <ThemeToggle />
              <LanguageSwitcher />
            </GlassSurface>

            <div className="mb-6 flex justify-center lg:hidden">
              <BrandMark />
            </div>

            <div className="mb-5 text-center lg:text-left">
              <h1 className="text-xl font-semibold text-foreground">
                {displayTitle}
              </h1>
              {displaySubtitle && (
                <p className="mt-2 text-sm text-muted-foreground">{displaySubtitle}</p>
              )}
            </div>

            <section
              className={cn(
                'border-y border-border/24 py-5 sm:py-6',
                panelClassName,
              )}
            >
              {children}
            </section>

            {footer && (
              <div className="mt-5 text-center text-sm text-muted-foreground lg:text-left">
                {footer}
              </div>
            )}

            <div className="mt-6 text-center lg:text-left">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                <span>{isZh ? '返回首页' : 'Back to home'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Brand / reassurance column — hidden on mobile, primary on lg. */}
        <aside className="order-2 hidden flex-col justify-center lg:order-1 lg:flex">
          <BrandMark />
          <section className="mt-7 max-w-md border-l border-border/24 pl-6">
            <h2 className="text-2xl font-semibold leading-tight text-foreground">
              {isZh ? rail.headlineZh : rail.headline}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {railBody}
            </p>
            <ul className="mt-6 max-w-sm divide-y divide-border/55 border-y border-border/55 text-xs text-muted-foreground">
              {rail.bullets.map((b) => (
                <li key={b.en} className="flex items-center gap-2 py-2.5">
                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary" aria-hidden="true" />
                  <span>{isZh ? b.zh : b.en}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </main>
    </div>
  );
}

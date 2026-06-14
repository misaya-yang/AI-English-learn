import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { BrandMark } from './BrandMark';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

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
 * Light, paper-warm two-column layout on lg+, single column on mobile.
 * No glass / glow / grid overlays — calm, learner-friendly.
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
    headline: sideRail?.headline ?? t('auth.shell.headline', { defaultValue: 'Practice a little English each day.' }),
    headlineZh: sideRail?.headlineZh ?? t('auth.shell.headlineZh', { defaultValue: '每天复习一点，练一点。' }),
    bullets: sideRail?.bullets ?? [
      { en: t('auth.shell.bullet1', { defaultValue: 'Review words due today' }), zh: t('auth.shell.bullet1Zh', { defaultValue: '复习今天到期的词' }) },
      { en: t('auth.shell.bullet2', { defaultValue: 'Practice writing and speaking' }), zh: t('auth.shell.bullet2Zh', { defaultValue: '练写作和口语' }) },
      { en: t('auth.shell.bullet3', { defaultValue: 'Come back to recent mistakes' }), zh: t('auth.shell.bullet3Zh', { defaultValue: '回看最近错过的点' }) },
    ],
  };
  const railBody = isZh
    ? t('auth.shell.bodyZh', { defaultValue: '登录后会看到今天要复习、要学习和要练习的内容。' })
    : t('auth.shell.body', { defaultValue: 'Sign in to see the words and practice tasks due today.' });

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-sunken))] text-foreground">
      <main className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16 lg:py-20">
        {/* Form column — first on mobile per direction. */}
        <div className="order-1 flex justify-center lg:order-2 lg:justify-start">
          <div className={cn('w-full', widthClass)}>
            <div className="mb-4 flex justify-end gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>

            <div className="mb-6 flex justify-center lg:hidden">
              <BrandMark />
            </div>

            <div className="mb-5 text-center lg:text-left">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {displayTitle}
              </h1>
              {displaySubtitle && (
                <p className="mt-2 text-sm text-muted-foreground">{displaySubtitle}</p>
              )}
            </div>

            <section
              className={cn(
                'rounded-lg border border-border bg-[hsl(var(--surface-raised))] p-6 shadow-[0_1px_0_hsl(var(--border)/0.7),0_22px_52px_-40px_hsl(var(--shadow-studio)/0.34)] sm:p-7',
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
          <h2 className="mt-8 max-w-md text-3xl font-semibold leading-tight tracking-tight text-foreground">
            {isZh ? rail.headlineZh : rail.headline}
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {railBody}
          </p>
          <ul className="mt-8 space-y-2 text-xs text-muted-foreground">
            {rail.bullets.map((b) => (
              <li key={b.en}>{isZh ? `· ${b.zh}` : b.en}</li>
            ))}
          </ul>
        </aside>
      </main>
    </div>
  );
}

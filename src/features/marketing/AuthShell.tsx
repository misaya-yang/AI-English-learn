import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
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
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandMark />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-4 pb-8 pt-2 sm:px-6 sm:pb-12 lg:pt-6">
        <div className="workbook-surface grid min-h-[min(680px,calc(100dvh-8.5rem))] overflow-hidden lg:grid-cols-[0.86fr_1.14fr]">
          <motion.aside
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }}
            className="hidden flex-col justify-between border-r border-border/[0.28] bg-primary/[0.035] p-8 lg:flex lg:p-10"
          >
            <div>
              <p className="focus-kicker">{isZh ? '今日学习工作台' : 'Today learning workbench'}</p>
              <h2 className="mt-4 max-w-sm text-3xl font-semibold leading-tight text-foreground">
                {isZh ? rail.headlineZh : rail.headline}
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                {railBody}
              </p>
            </div>

            <ol className="mt-10 space-y-1">
              {rail.bullets.map((b, index) => (
                <li key={b.en} className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-3 border-b border-border/20 py-3 last:border-b-0">
                  <span className="study-number text-lg text-primary">{index + 1}</span>
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary" aria-hidden="true" />
                    {isZh ? b.zh : b.en}
                  </span>
                </li>
              ))}
            </ol>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.04, ease: [0.2, 0, 0, 1] }}
            className="flex items-start justify-center p-5 sm:p-8 lg:p-10"
          >
            <div className={cn('w-full', widthClass)}>
              <div className="mb-5">
                <p className="focus-kicker lg:hidden">{isZh ? 'VocabDaily 学习账号' : 'VocabDaily account'}</p>
                <h1 className="focus-page-title mt-2 text-2xl text-foreground sm:text-3xl">
                  {displayTitle}
                </h1>
                {displaySubtitle && (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{displaySubtitle}</p>
                )}
              </div>

              <section className={cn('py-3 sm:py-4', panelClassName)}>
                {children}
              </section>

              {footer && (
                <div className="mt-5 text-sm text-muted-foreground">
                  {footer}
                </div>
              )}

              <div className="mt-6 border-t border-border/24 pt-5">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                  <span>{isZh ? '返回首页' : 'Back to home'}</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

    </div>
  );
}

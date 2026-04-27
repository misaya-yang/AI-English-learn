import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { BrandMark } from './BrandMark';

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
  const { t } = useTranslation();
  const widthClass = size === 'wide' ? 'max-w-xl' : 'max-w-[420px]';

  const rail: SideRailCopy = {
    headline: sideRail?.headline ?? t('auth.shell.headline', { defaultValue: 'A calmer way to practice English every day.' }),
    headlineZh: sideRail?.headlineZh ?? t('auth.shell.headlineZh', { defaultValue: '把每天的复习、练习、教练反馈整合到一个学习工作台。' }),
    bullets: sideRail?.bullets ?? [
      { en: t('auth.shell.bullet1', { defaultValue: 'FSRS-based spaced repetition' }), zh: t('auth.shell.bullet1Zh', { defaultValue: '基于 FSRS 的间隔重复' }) },
      { en: t('auth.shell.bullet2', { defaultValue: 'Coach-graded writing & speaking retries' }), zh: t('auth.shell.bullet2Zh', { defaultValue: '教练批改的写作与口语重练' }) },
      { en: t('auth.shell.bullet3', { defaultValue: 'Mistake-aware daily missions' }), zh: t('auth.shell.bullet3Zh', { defaultValue: '基于错题的每日学习任务' }) },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16 lg:py-20">
        {/* Form column — first on mobile per direction. */}
        <div className="order-1 flex justify-center lg:order-2 lg:justify-start">
          <div className={cn('w-full', widthClass)}>
            <div className="mb-6 flex justify-center lg:hidden">
              <BrandMark />
            </div>

            <div className="mb-5 text-center lg:text-left">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>

            <section
              className={cn(
                'rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7',
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
                <span lang="zh-CN">返回首页</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Brand / reassurance column — hidden on mobile, primary on lg. */}
        <aside className="order-2 hidden flex-col justify-center lg:order-1 lg:flex">
          <BrandMark />
          <h2 className="mt-8 max-w-md text-2xl font-semibold tracking-tight text-foreground">
            {rail.headline}
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground" lang="zh-CN">
            {rail.headlineZh}
          </p>
          <ul className="mt-8 space-y-2 text-xs text-muted-foreground" lang="zh-CN">
            {rail.bullets.map((b) => (
              <li key={b.en}>· {b.zh}</li>
            ))}
          </ul>
        </aside>
      </main>
    </div>
  );
}

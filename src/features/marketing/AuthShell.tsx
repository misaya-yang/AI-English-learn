import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandMark } from './BrandMark';

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
}: AuthShellProps) {
  const widthClass = size === 'wide' ? 'max-w-xl' : 'max-w-[420px]';

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
              <p
                className="mt-1 text-sm text-[hsl(var(--accent-memory))]"
                lang="zh-CN"
              >
                {titleZh}
              </p>
              {(subtitle || subtitleZh) && (
                <div className="mt-2 space-y-0.5">
                  {subtitle && (
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                  )}
                  {subtitleZh && (
                    <p className="text-xs text-muted-foreground/80" lang="zh-CN">
                      {subtitleZh}
                    </p>
                  )}
                </div>
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
                <span>Back to home</span>
                <span className="text-muted-foreground/60">·</span>
                <span lang="zh-CN">返回首页</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Brand / reassurance column — hidden on mobile, primary on lg. */}
        <aside className="order-2 hidden flex-col justify-center lg:order-1 lg:flex">
          <BrandMark />
          <h2 className="mt-8 max-w-md text-2xl font-semibold tracking-tight text-foreground">
            A calmer way to practice English every day.
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground" lang="zh-CN">
            把每天的复习、练习、教练反馈整合到一个学习工作台。
          </p>
          <blockquote className="mt-8 max-w-md border-l-2 border-[hsl(var(--accent-memory))]/60 pl-4 text-sm leading-relaxed text-muted-foreground">
            "Learning sticks when you come back at the right moment, not when you grind harder."
          </blockquote>
          <ul className="mt-8 space-y-2 text-xs text-muted-foreground">
            <li>· FSRS-based spaced repetition</li>
            <li>· Coach-graded writing &amp; speaking retries</li>
            <li>· Mistake-aware daily missions</li>
          </ul>
        </aside>
      </main>
    </div>
  );
}

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
 * AuthShell — the shared visual frame for every auth & onboarding surface.
 *
 * Goals:
 *   - One brand, one typography scale across Login / Register / MagicLink /
 *     AuthCallback / Onboarding.
 *   - Bilingual labels (en + zh) baked into the API so individual screens
 *     can't drift.
 *   - Mobile-first: 375px width, no horizontal scroll, primary CTA above the
 *     fold (the panel is `min-h` rather than `h-screen`-locked).
 *   - Light + dark via existing CSS variables — no extra heavy deps.
 *
 * This is intentionally lighter than `LearningCockpitShell`: no layout slots,
 * no nested providers, no router state. Auth surfaces stay quick to render.
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
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-50 dark:bg-[#020303]">
      {/* Ambient glow + grid — purely decorative, never blocks pointer events. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[480px] w-[700px] rounded-full bg-emerald-500/[0.06] blur-[140px] dark:bg-emerald-500/[0.08]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 h-[320px] w-[320px] rounded-full bg-emerald-500/[0.04] blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--grid-line-color))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--grid-line-color))_1px,transparent_1px)] bg-[size:32px_32px] opacity-60 dark:opacity-100"
      />

      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:py-16">
        <div className={cn('w-full', widthClass)}>
          <div className="mb-8 flex justify-center sm:mb-10">
            <BrandMark />
          </div>

          {/* Title block — always bilingual. */}
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-[1.6rem]">
              {title}
            </h1>
            <p
              className="mt-1.5 text-sm text-emerald-600 dark:text-emerald-400"
              lang="zh-CN"
            >
              {titleZh}
            </p>
            {(subtitle || subtitleZh) && (
              <div className="mt-3 space-y-1">
                {subtitle && (
                  <p className="text-sm text-slate-600 dark:text-white/60">
                    {subtitle}
                  </p>
                )}
                {subtitleZh && (
                  <p
                    className="text-xs text-slate-500 dark:text-white/40"
                    lang="zh-CN"
                  >
                    {subtitleZh}
                  </p>
                )}
              </div>
            )}
          </div>

          <section
            className={cn(
              'rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-card backdrop-blur-md',
              'sm:p-8',
              'dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-glass',
              panelClassName,
            )}
          >
            {children}
          </section>

          {footer && (
            <div className="mt-6 text-center text-sm text-slate-500 dark:text-white/40">
              {footer}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-white/40 dark:hover:text-white/80"
            >
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              <span>Back to home</span>
              <span className="text-slate-400 dark:text-white/30">·</span>
              <span lang="zh-CN">返回首页</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

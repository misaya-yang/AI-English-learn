import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandMarkProps {
  /** Render as a link back to home; default true. */
  asLink?: boolean;
  /** Compact mode shows only the logo + wordmark. */
  variant?: 'default' | 'compact';
  className?: string;
  /** Override the wordmark color in dark contexts. */
  tone?: 'light' | 'dark' | 'auto';
}

/**
 * The shared VocabDaily wordmark used across marketing + auth surfaces.
 *
 * Locked to a single visual recipe so Home, LandingPage, Login, Register,
 * MagicLink, AuthCallback, Onboarding, and Pricing all share one brand.
 */
export function BrandMark({
  asLink = true,
  variant = 'default',
  className,
  tone = 'auto',
}: BrandMarkProps) {
  const wordmarkClass = cn(
    'text-base font-bold tracking-tight',
    tone === 'light' && 'text-white',
    tone === 'dark' && 'text-slate-900',
    tone === 'auto' && 'text-slate-900 dark:text-white',
  );

  const taglineClass = cn(
    'text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground',
  );

  const inner = (
    <>
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors',
          'group-hover:bg-primary/15',
        )}
        aria-hidden="true"
      >
        <BookOpen className="h-4 w-4" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className={wordmarkClass}>VocabDaily</span>
        {variant === 'default' && (
          <span className={taglineClass}>Learning Cockpit</span>
        )}
      </span>
    </>
  );

  if (!asLink) {
    return (
      <span className={cn('group inline-flex items-center gap-2.5', className)}>
        {inner}
      </span>
    );
  }

  return (
    <Link
      to="/"
      className={cn('group inline-flex items-center gap-2.5', className)}
      aria-label="VocabDaily — back to home"
    >
      {inner}
    </Link>
  );
}

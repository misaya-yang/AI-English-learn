import type { ComponentType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export type AccentTone = 'default' | 'emerald' | 'warm';

export interface MetricItem {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: AccentTone;
}

interface LearningShellFrameProps {
  children: ReactNode;
  className?: string;
}

interface LearningHeroPanelProps {
  eyebrow?: string;
  title: string;
  description?: string;
  progress?: number | null;
  progressLabel?: string;
  progressValueLabel?: string;
  metrics?: MetricItem[];
  actions?: ReactNode;
  className?: string;
}

interface LearningRailSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

interface LearningWorkspaceSurfaceProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

interface LearningMetricStripProps {
  items: MetricItem[];
  className?: string;
}

interface LearningActionClusterProps {
  children: ReactNode;
  className?: string;
}

interface LearningStatePanelProps {
  icon: ComponentType<{ className?: string }>;
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  metrics?: MetricItem[];
  className?: string;
}

export const learningFrameClassName =
  'relative rounded-3xl border border-black/5 dark:border-white/[0.06] glass transition-all duration-500';

const metricToneClass: Record<AccentTone, string> = {
  default: 'text-slate-900 dark:text-white',
  emerald: 'text-emerald-600 dark:text-emerald-300',
  warm: 'text-amber-600 dark:text-amber-300',
};

export function LearningShellFrame({ children, className }: LearningShellFrameProps) {
  return <div className={cn('space-y-6 lg:space-y-8', className)}>{children}</div>;
}

export function LearningHeroPanel({
  eyebrow,
  title,
  description,
  progress,
  progressLabel,
  progressValueLabel,
  metrics = [],
  actions,
  className,
}: LearningHeroPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(learningFrameClassName, 'overflow-hidden p-4 sm:p-6 lg:p-8', className)}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/[0.02] dark:to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[30%] bg-[linear-gradient(180deg,hsl(var(--primary)/0.05),transparent)] xl:block" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_300px] lg:items-start z-10">
        <div className="space-y-5">
          {eyebrow ? (
            <Badge className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/10">
              {eyebrow}
            </Badge>
          ) : null}
          <div className="space-y-3">
            <h1 className="max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-5xl">
              {title}
            </h1>
            {description ? <p className="max-w-3xl text-base leading-7 text-slate-600 dark:text-white/64 sm:text-lg">{description}</p> : null}
          </div>
          {actions ? <LearningActionCluster>{actions}</LearningActionCluster> : null}
        </div>

        <div className="space-y-4 rounded-3xl border border-black/5 dark:border-white/[0.08] bg-white/50 dark:bg-black/40 p-4 sm:p-6 shadow-sm dark:shadow-glass relative z-10">
          {typeof progress === 'number' ? (
            <div className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">{progressLabel || 'Progress'}</p>
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-emerald-600 dark:text-emerald-300">
                    {progressValueLabel || `${progress}%`}
                  </p>
                </div>
                <p className="hidden max-w-[8rem] text-right text-sm leading-6 text-slate-400 dark:text-white/46 lg:block">
                  {progress >= 100 ? 'Round complete.' : 'Stay in flow.'}
                </p>
              </div>
              <Progress
                value={progress}
                className="h-2.5 bg-white/10 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-emerald-400 [&_[data-slot=progress-indicator]]:to-emerald-500"
              />
            </div>
          ) : null}

          {metrics.length > 0 ? <LearningMetricStrip items={metrics} /> : null}
        </div>
      </div>
    </motion.section>
  );
}

export function LearningRailSection({ title, description, children, className }: LearningRailSectionProps) {
  return (
    <section className={cn(learningFrameClassName, 'space-y-4 p-4 sm:p-6', className)}>
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-white/42">{title}</p>
        {description ? <p className="text-sm leading-6 text-slate-600 dark:text-white/58">{description}</p> : null}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function LearningWorkspaceSurface({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: LearningWorkspaceSurfaceProps) {
  return (
    <section className={cn(learningFrameClassName, 'overflow-hidden', className)}>
      <div className="border-b border-black/5 dark:border-white/[0.06] px-5 py-5 sm:px-6 lg:px-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/42">{eyebrow}</p> : null}
            <h2 className="text-2xl font-semibold tracking-[-0.035em] text-slate-900 dark:text-white sm:text-[2rem]">{title}</h2>
            {description ? <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-white/58 sm:text-base">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6 lg:px-7 lg:py-6">{children}</div>
    </section>
  );
}

export function LearningMetricStrip({ items, className }: LearningMetricStripProps) {
  return (
    <div className={cn('grid gap-3 border-t border-black/5 dark:border-white/[0.06] pt-4 sm:grid-cols-2 xl:grid-cols-3', className)}>
      {items.map((item) => (
        <div key={`${item.label}-${String(item.value)}`} className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-white/42">{item.label}</p>
          <div className={cn('text-2xl font-semibold tracking-[-0.04em]', metricToneClass[item.accent || 'default'])}>
            {item.value}
          </div>
          {item.hint ? <p className="hidden text-xs leading-5 text-slate-400 dark:text-white/46 xl:block">{item.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function LearningActionCluster({ children, className }: LearningActionClusterProps) {
  return <div className={cn('flex flex-col gap-3 sm:flex-row sm:flex-wrap', className)}>{children}</div>;
}

export function LearningEmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  metrics,
  className,
}: LearningStatePanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(learningFrameClassName, 'px-6 py-12 text-center sm:px-10', className)}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
        <Icon className="h-8 w-8" />
      </div>
      {eyebrow ? <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">{eyebrow}</p> : null}
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/62">{description}</p>
      {metrics && metrics.length > 0 ? <LearningMetricStrip items={metrics} className="mx-auto mt-8 max-w-3xl text-left" /> : null}
      {actions ? <LearningActionCluster className="mt-8 justify-center">{actions}</LearningActionCluster> : null}
    </motion.section>
  );
}

export function LearningCompletionState({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  metrics,
  className,
}: LearningStatePanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(learningFrameClassName, 'overflow-hidden px-6 py-12 sm:px-10', className)}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,hsl(var(--primary)/0.05),transparent)]" />
      <div className="relative text-center z-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-emerald-500/25 bg-emerald-500/12 text-emerald-600 dark:text-emerald-300">
          <Icon className="h-9 w-9" />
        </div>
        {eyebrow ? <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-white/42">{eyebrow}</p> : null}
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-white/62">{description}</p>
      </div>
      {metrics && metrics.length > 0 ? <LearningMetricStrip items={metrics} className="mt-8" /> : null}
      {actions ? <LearningActionCluster className="mt-8 justify-center">{actions}</LearningActionCluster> : null}
    </motion.section>
  );
}

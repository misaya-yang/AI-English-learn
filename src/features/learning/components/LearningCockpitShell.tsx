import { Suspense, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LearningHeroPanel,
  type MetricItem,
} from '@/features/learning/components/LearningWorkspace';
import { MissionWhyBadge } from '@/features/learning/components/MissionWhyBadge';
import { cn } from '@/lib/utils';

// LearningCockpitShell — the mission-first wrapper every learning surface
// (Today / Review / Practice / LearningPath, eventually Chat header) uses
// to enforce the "5-second answer" invariant: the learner must see what
// to do, why it matters, how long it should take, and the next button —
// without scrolling. The shell composes the existing primitives
// (LearningShellFrame + MissionWhyBadge + LearningHeroPanel) behind one
// typed contract so a page can't accidentally render a generic card grid
// that drops the mission framing.
//
// Pages that need the existing flexibility of `LearningShellFrame` +
// `LearningHeroPanel` directly can still use those primitives — the
// cockpit is a *facade*, not a replacement.

export interface CockpitMissionAction {
  label: string;
  /** Provide either an href (router link) or an onClick. */
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline';
  testId?: string;
}

export interface CockpitWhy {
  /** Stable reason id from the learning engine — see missionWhyChip. */
  reason?: string | null;
  learnerMode?: 'recovery' | 'maintenance' | 'steady' | 'stretch' | 'sprint' | null;
  burnoutRisk?: number;
}

export interface CockpitMission {
  /** The headline answer to "what now". Required. */
  title: string;
  /** Short why-paragraph rendered as the hero description. */
  description?: string;
  /**
   * Estimated time. Surfaces both as a metric chip and as text in the
   * primary action when the page does not supply its own metrics.
   */
  estimatedMinutes?: number;
  /** Single most important next step. Always rendered if supplied. */
  primaryAction?: CockpitMissionAction;
  /** Optional secondary actions; capped at 2 to keep the hero focused. */
  secondaryActions?: CockpitMissionAction[];
  /** Optional why-badge above the hero. */
  why?: CockpitWhy;
}

export interface LearningCockpitShellProps {
  /** Eyebrow chip above the title — e.g. "Today mission · Apr 25". */
  eyebrow?: string;
  mission: CockpitMission;
  metrics?: MetricItem[];
  progress?: number | null;
  progressLabel?: string;
  language: string;
  /** Page-specific workspace below the hero. */
  children: ReactNode;
  /** Optional skeleton to show during a Suspense fallback. */
  fallback?: ReactNode;
  className?: string;
}

const renderAction = (action: CockpitMissionAction, key: string) => {
  const className = cn(
    'rounded-full',
    action.variant === 'outline'
      ? 'border-border bg-muted/20 text-foreground hover:bg-muted/50 hover:text-foreground'
      : 'bg-emerald-500 text-black hover:bg-emerald-400',
  );
  if (action.href) {
    return (
      <Button
        key={key}
        asChild
        variant={action.variant === 'outline' ? 'outline' : 'default'}
        className={className}
        data-testid={action.testId}
      >
        <Link to={action.href}>{action.label}</Link>
      </Button>
    );
  }
  return (
    <Button
      key={key}
      type="button"
      variant={action.variant === 'outline' ? 'outline' : 'default'}
      className={className}
      onClick={action.onClick}
      data-testid={action.testId}
    >
      {action.label}
    </Button>
  );
};

export function LearningCockpitShell({
  eyebrow,
  mission,
  metrics,
  progress,
  progressLabel,
  language,
  children,
  fallback,
  className,
}: LearningCockpitShellProps) {
  const heroMetrics: MetricItem[] = metrics && metrics.length > 0
    ? metrics
    : (typeof mission.estimatedMinutes === 'number' && mission.estimatedMinutes > 0
        ? [
            {
              label: language.startsWith('zh') ? '预计用时' : 'Estimated time',
              value: `${mission.estimatedMinutes} min`,
            },
          ]
        : []);

  const actions = (
    <>
      {mission.primaryAction ? renderAction(mission.primaryAction, 'primary') : null}
      {(mission.secondaryActions || []).slice(0, 2).map((action, idx) =>
        renderAction(action, `secondary-${idx}`),
      )}
    </>
  );

  return (
    <section
      data-testid="learning-cockpit"
      className={cn('space-y-6 lg:space-y-8', className)}
    >
      {mission.why ? (
        <MissionWhyBadge
          reason={mission.why.reason}
          learnerMode={mission.why.learnerMode ?? null}
          burnoutRisk={mission.why.burnoutRisk}
          language={language}
        />
      ) : null}

      <LearningHeroPanel
        eyebrow={eyebrow}
        title={mission.title}
        description={mission.description}
        progress={progress ?? null}
        progressLabel={progressLabel}
        metrics={heroMetrics}
        actions={mission.primaryAction || mission.secondaryActions?.length ? actions : undefined}
      />

      {fallback ? (
        <Suspense fallback={fallback}>{children}</Suspense>
      ) : (
        children
      )}
    </section>
  );
}

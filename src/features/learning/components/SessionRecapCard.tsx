import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, BookOpen, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  buildSessionRecap,
  type SessionRecapInput,
} from '@/features/learning/sessionRecap';

interface SessionRecapCardProps {
  input: SessionRecapInput;
  className?: string;
}

export function SessionRecapCard({ input, className }: SessionRecapCardProps) {
  const recap = buildSessionRecap(input);
  const isZh = (input.language || '').startsWith('zh');

  const heading = isZh ? '本轮结果' : 'Session result';

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'rounded-[18px] border border-border/75 bg-card p-4 shadow-[inset_0_1px_0_hsl(var(--glass-highlight)/0.12),0_18px_38px_-34px_hsl(var(--shadow-studio)/0.22)] sm:p-5',
        className,
      )}
      data-testid="session-recap-card"
      data-kind={recap.kind}
    >
      <div className="flex items-center gap-2 text-[hsl(var(--accent-memory))]">
        <CheckCircle2 className="h-4 w-4" />
        <p className="text-[11px] font-semibold">{heading}</p>
      </div>

      <p className="mt-3 text-sm leading-7 text-foreground sm:text-base">
        {isZh ? recap.encouragement.zh : recap.encouragement.en}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {recap.improved && (
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3">
            <p className="text-[10px] font-medium text-primary">
              {isZh ? '已巩固' : 'Improved'}
            </p>
            <p className="mt-1.5 inline-flex items-center gap-2 text-sm text-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              {isZh ? recap.improved.label.zh : recap.improved.label.en}
            </p>
          </div>
        )}

        {recap.needsReview && (
          <div className="rounded-2xl border border-[hsl(var(--warning)/0.34)] bg-[hsl(var(--warning)/0.10)] p-3">
            <p className="text-[10px] font-semibold text-[hsl(var(--warning))]">
              {isZh ? '仍需再练' : 'Needs review'}
            </p>
            <p className="mt-1.5 inline-flex items-center gap-2 text-sm text-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              {isZh ? recap.needsReview.label.zh : recap.needsReview.label.en}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-border/70 bg-[hsl(var(--surface-sunken)/0.42)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground">
            {isZh ? '下一步' : 'Next step'}
          </p>
          <p className="text-sm text-foreground">
            {isZh ? recap.nextAction.reason.zh : recap.nextAction.reason.en}
          </p>
        </div>
        <Button
          asChild
          variant="glassPrimary"
          className="sm:w-auto"
        >
          <Link to={recap.nextAction.href}>
            {isZh ? recap.nextAction.ctaZh : recap.nextAction.ctaEn}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </motion.section>
  );
}

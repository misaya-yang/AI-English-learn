import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, BookOpen, Sparkles } from 'lucide-react';
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

  const heading = isZh ? '本轮复盘' : 'Session recap';

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 sm:p-6',
        className,
      )}
      data-testid="session-recap-card"
      data-kind={recap.kind}
    >
      <div className="flex items-center gap-2 text-emerald-300">
        <Sparkles className="h-4 w-4" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">{heading}</p>
      </div>

      <p className="mt-3 text-sm leading-7 text-white/85 sm:text-base">
        {isZh ? recap.encouragement.zh : recap.encouragement.en}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {recap.improved && (
          <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.08] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              {isZh ? '已巩固' : 'Improved'}
            </p>
            <p className="mt-1.5 inline-flex items-center gap-2 text-sm text-emerald-100">
              <BookOpen className="h-3.5 w-3.5" />
              {isZh ? recap.improved.label.zh : recap.improved.label.en}
            </p>
          </div>
        )}

        {recap.needsReview && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
              {isZh ? '仍需再练' : 'Needs review'}
            </p>
            <p className="mt-1.5 inline-flex items-center gap-2 text-sm text-amber-100">
              <AlertTriangle className="h-3.5 w-3.5" />
              {isZh ? recap.needsReview.label.zh : recap.needsReview.label.en}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
            {isZh ? '下一步' : 'Next step'}
          </p>
          <p className="text-sm text-white/80">
            {isZh ? recap.nextAction.reason.zh : recap.nextAction.reason.en}
          </p>
        </div>
        <Button
          asChild
          className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400 sm:w-auto"
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

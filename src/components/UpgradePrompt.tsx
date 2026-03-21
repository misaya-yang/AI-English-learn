/**
 * UpgradePrompt — Reusable upgrade/paywall prompt component
 * ─────────────────────────────────────────────────────────────────
 * Shows when a user has exhausted their free-tier quota.
 * Can be used inline (banner) or as a modal overlay.
 */

import { Zap, X, Crown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { QuotaFeature } from '@/hooks/useQuota';
import { QUOTA_LIMITS } from '@/hooks/useQuota';
import { Link } from 'react-router-dom';

// ─── Feature labels ────────────────────────────────────────────────────────────

const FEATURE_LABELS: Record<QuotaFeature, { label: string; labelZh: string }> = {
  aiWritingGrade:   { label: 'AI Writing Feedback', labelZh: 'AI 写作批改' },
  aiReadingGen:     { label: 'AI Reading Generation', labelZh: 'AI 阅读生成' },
  aiChat:           { label: 'AI Coach Chat', labelZh: 'AI 教练对话' },
  aiExamFeedback:   { label: 'Exam Feedback', labelZh: '考试反馈' },
  aiListeningGen:   { label: 'AI Listening Generation', labelZh: 'AI 听力生成' },
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface UpgradePromptProps {
  feature: QuotaFeature;
  /** 'banner' — inline bar, 'card' — full card, 'modal' — floating overlay */
  variant?: 'banner' | 'card' | 'modal';
  onDismiss?: () => void;
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function UpgradePrompt({ feature, variant = 'card', onDismiss, className }: UpgradePromptProps) {
  const featureMeta = FEATURE_LABELS[feature];
  const freeLimit = QUOTA_LIMITS.free[feature];
  const proLimit = QUOTA_LIMITS.pro[feature];

  if (variant === 'banner') {
    return (
      <div className={cn(
        'flex items-center justify-between gap-4 rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3',
        className,
      )}>
        <div className="flex items-center gap-2.5">
          <Zap className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-600 dark:text-amber-300">
            <span className="font-semibold">{featureMeta.labelZh}</span>
            {' '}今日免费额度已用完（{freeLimit}次/天）
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/pricing">
            <Button size="sm" className="rounded-full bg-amber-500 text-black hover:bg-amber-400 h-7 text-xs px-3 font-semibold">
              升级 Pro
            </Button>
          </Link>
          {onDismiss && (
            <button onClick={onDismiss} className="text-amber-400 hover:text-amber-300 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
          <UpgradeCard feature={feature} featureMeta={featureMeta} freeLimit={freeLimit} proLimit={proLimit} onDismiss={onDismiss} />
        </div>
      </div>
    );
  }

  // Default: card
  return (
    <div className={cn(
      'rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] to-orange-500/[0.04] p-6',
      className,
    )}>
      <UpgradeCard feature={feature} featureMeta={featureMeta} freeLimit={freeLimit} proLimit={proLimit} onDismiss={onDismiss} />
    </div>
  );
}

// ─── Inner card content ────────────────────────────────────────────────────────

interface UpgradeCardProps {
  feature: QuotaFeature;
  featureMeta: { label: string; labelZh: string };
  freeLimit: number;
  proLimit: number;
  onDismiss?: () => void;
}

function UpgradeCard({ featureMeta, freeLimit, proLimit, onDismiss }: UpgradeCardProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15">
          <Crown className="h-5 w-5 text-amber-400" />
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/70 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div>
        <p className="text-base font-bold text-slate-900 dark:text-white">今日额度已用完</p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-white/50">
          {featureMeta.labelZh}免费版每天限 {freeLimit} 次。升级 Pro 解锁无限使用。
        </p>
      </div>

      {/* Pro benefits */}
      <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.04] p-3 space-y-2">
        {([
          `${featureMeta.labelZh} ${proLimit}次/天`,
          '所有 AI 功能无限制',
          'FSRS 智能复习 + 个性化计划',
          '优先客户支持',
        ] as const).map((benefit, i) => (
          <div key={i} className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
            <p className="text-xs text-slate-600 dark:text-white/65">{benefit}</p>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="space-y-2">
        <Link to="/pricing" className="block">
          <Button className="w-full rounded-full bg-amber-500 text-black hover:bg-amber-400 font-semibold">
            <Zap className="mr-2 h-4 w-4" />
            升级到 Pro
          </Button>
        </Link>
        {onDismiss && (
          <Button
            variant="outline"
            onClick={onDismiss}
            className="w-full rounded-full border-black/10 dark:border-white/10 text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80"
          >
            明天再说
          </Button>
        )}
      </div>
    </div>
  );
}

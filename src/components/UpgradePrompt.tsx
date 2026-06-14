/**
 * UpgradePrompt: reusable upgrade/paywall prompt component.
 * Shows when a user has exhausted their free-tier quota.
 * Can be used inline (banner) or as a modal overlay.
 */

import { Zap, X, Crown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { QuotaFeature } from '@/hooks/useQuota';
import { QUOTA_LIMITS } from '@/hooks/useQuota';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCheckoutStatus } from '@/features/marketing/pricingAvailability';
import {
  PRO_PLAN_FEATURES,
  PRO_WAITLIST_PROMISE,
  getProGateReason,
  pickLocalized,
} from '@/features/marketing/proPackaging';

// ─── Feature labels ────────────────────────────────────────────────────────────

const FEATURE_LABELS: Record<QuotaFeature, { label: string; labelZh: string }> = {
  aiWritingGrade:   { label: 'Writing Feedback', labelZh: '写作反馈' },
  aiReadingGen:     { label: 'Reading Generation', labelZh: '阅读材料生成' },
  aiChat:           { label: 'English Help', labelZh: '英语答疑' },
  aiExamFeedback:   { label: 'Exam Feedback', labelZh: '考试反馈' },
  aiListeningGen:   { label: 'Listening Generation', labelZh: '听力材料生成' },
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface UpgradePromptProps {
  feature: QuotaFeature;
  /** 'banner': inline bar, 'card': full card, 'modal': floating overlay */
  variant?: 'banner' | 'card' | 'modal';
  onDismiss?: () => void;
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function UpgradePrompt({ feature, variant = 'card', onDismiss, className }: UpgradePromptProps) {
  const { i18n } = useTranslation();
  const language = i18n.language || 'zh';
  const isZh = language.startsWith('zh');
  const featureMeta = FEATURE_LABELS[feature];
  const freeLimit = QUOTA_LIMITS.free[feature];
  const proLimit = QUOTA_LIMITS.pro[feature];
  const checkoutLive = getCheckoutStatus().kind === 'available';
  const ctaLabel = checkoutLive
    ? (isZh ? '查看 Pro 方案' : 'View Pro plan')
    : (isZh ? '加入 Pro 等待名单' : 'Join Pro waitlist');
  const helperCopy = checkoutLive
    ? (isZh ? 'Pro 开放结账时，会在定价页进入真实支付流程。' : 'When checkout is live, Pricing starts the real payment flow.')
    : pickLocalized(PRO_WAITLIST_PROMISE, language);
  const cardProps = {
    feature,
    featureMeta,
    freeLimit,
    proLimit,
    onDismiss,
    language,
    isZh,
    ctaLabel,
    helperCopy,
  };

  if (variant === 'banner') {
    return (
      <div className={cn(
        'flex items-center justify-between gap-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3',
        className,
      )}>
        <div className="flex items-center gap-2.5">
          <Zap className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-600 dark:text-amber-300">
            <span className="font-semibold">{isZh ? featureMeta.labelZh : featureMeta.label}</span>
            {' '}
            {isZh ? `今日免费额度已用完（${freeLimit}次/天）` : `free quota is used today (${freeLimit}/day)`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button asChild size="sm" className="h-8 rounded-md bg-warning text-warning-foreground px-3 text-xs font-medium hover:bg-warning/90">
            <Link to="/pricing">
              {ctaLabel}
            </Link>
          </Button>
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
          <UpgradeCard {...cardProps} />
        </div>
      </div>
    );
  }

  // Default: card
  return (
    <div className={cn(
        'rounded-lg border border-warning/30 bg-warning/10 p-5',
      className,
    )}>
      <UpgradeCard {...cardProps} />
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
  language: string;
  isZh: boolean;
  ctaLabel: string;
  helperCopy: string;
}

function UpgradeCard({
  feature,
  featureMeta,
  freeLimit,
  proLimit,
  onDismiss,
  language,
  isZh,
  ctaLabel,
  helperCopy,
}: UpgradeCardProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-warning/30 bg-warning/10">
          <Crown className="h-5 w-5 text-amber-400" />
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div>
        <p className="text-base font-bold text-foreground">
          {isZh ? '今日额度已用完' : 'Today\'s free quota is used'}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {isZh
            ? `${featureMeta.labelZh}免费版每天限 ${freeLimit} 次。${getProGateReason(feature, language)}`
            : `${featureMeta.label} is limited to ${freeLimit}/day on Free. ${getProGateReason(feature, language)}`}
        </p>
      </div>

      {/* Pro benefits */}
      <div className="space-y-2 rounded-md border border-border bg-card p-3">
        {([
          isZh
            ? `${featureMeta.labelZh} Pro 额度：${proLimit} 次/天`
            : `${featureMeta.label} Pro quota: ${proLimit}/day`,
          pickLocalized(PRO_PLAN_FEATURES[1], language),
          pickLocalized(PRO_PLAN_FEATURES[2], language),
          pickLocalized(PRO_PLAN_FEATURES[4], language),
        ] as const).map((benefit, i) => (
          <div key={i} className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">{benefit}</p>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="space-y-2">
        <Button asChild className="w-full rounded-md bg-warning text-warning-foreground font-medium hover:bg-warning/90">
          <Link to="/pricing">
            <Zap className="mr-2 h-4 w-4" />
            {ctaLabel}
          </Link>
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          {helperCopy}
        </p>
        {onDismiss && (
          <Button
            variant="outline"
            onClick={onDismiss}
            className="w-full rounded-md border-border text-muted-foreground hover:text-foreground"
          >
            {isZh ? '明天再说' : 'Maybe tomorrow'}
          </Button>
        )}
      </div>
    </div>
  );
}

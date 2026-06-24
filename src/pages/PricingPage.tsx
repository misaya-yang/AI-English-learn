import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GlassSurface } from '@/components/ui/glass-surface';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getEntitlement } from '@/data/examContent';
import { getSubscriptionEntitlement } from '@/services/billingGateway';
import { toast } from 'sonner';
import { BrandMark } from '@/features/marketing/BrandMark';
import { getCheckoutStatus } from '@/features/marketing/pricingAvailability';
import {
  hasProWaitlistIntent,
  saveProWaitlistIntent,
  type ProBillingCycle,
} from '@/features/marketing/proWaitlist';
import {
  FREE_JOB,
  FREE_PLAN_FEATURES,
  FREE_PLAN_LIMITATIONS,
  PRO_JOB,
  PRO_PLAN_FEATURES,
  PRO_WAITLIST_PROMISE,
  pickLocalized,
  type LocalizedLine,
} from '@/features/marketing/proPackaging';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

type PaidPlanId = 'pro';

interface Plan {
  id: 'free' | PaidPlanId;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: LocalizedLine[];
  notIncluded?: LocalizedLine[];
  cta: string;
  ctaZh: string;
  highlighted: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    nameZh: '免费版',
    description: 'Daily review and practice.',
    descriptionZh: '日常复习和练习。',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: FREE_PLAN_FEATURES,
    notIncluded: FREE_PLAN_LIMITATIONS,
    cta: 'Start with Free',
    ctaZh: '免费开始',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    nameZh: '专业版',
    description: 'For exam-grade feedback and planning.',
    descriptionZh: '用于考试反馈和学习计划。',
    monthlyPrice: 9.99,
    yearlyPrice: 7.99,
    features: PRO_PLAN_FEATURES,
    cta: 'Join Pro notice',
    ctaZh: '加入专业版通知',
    highlighted: true,
  },
];

const faqs = [
  {
    question: 'Why can\'t I subscribe right now?',
    questionZh: '为什么现在还不能订阅？',
    answer:
      'We\'re finalizing payment provider configuration. Until that\'s live, the free plan is fully functional and this page will only show checkout once a real provider is ready.',
    answerZh:
      '我们正在完成支付服务的配置。在此之前，免费版完全可用；只有真实支付服务准备好后，本页才会开放结账入口。',
  },
  {
    question: 'Will my current data carry over when Pro launches?',
    questionZh: '专业版上线后我现在的数据会保留吗？',
    answer:
      'Yes. Your learning records, vocabulary, and history are independent of your plan. Switching later only changes entitlements.',
    answerZh:
      '会保留。您的学习记录、词汇和历史数据与订阅方案无关，切换后仅权益范围发生变化。',
  },
  {
    question: 'Can I cancel my subscription anytime once it\'s live?',
    questionZh: '订阅功能上线后可以随时取消吗？',
    answer:
      'Yes. You can cancel anytime and keep access until the end of the current billing period.',
    answerZh:
      '可以。您可以随时取消，并在当前计费周期结束前继续享有专业版权益。',
  },
  {
    question: 'Which payment methods will you support?',
    questionZh: '将支持哪些支付方式？',
    answer:
      'Stripe will be the primary international gateway. Alipay is on the roadmap. We\'ll only enable a method here once it can actually complete a real charge end-to-end.',
    answerZh:
      'Stripe 将作为主要的国际支付通道，支付宝已在路线图上。我们只会在某种方式能完整完成真实扣款后才启用。',
  },
];

export default function PricingPage() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');

  const [isYearly, setIsYearly] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro'>('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'inactive' | 'active' | 'unknown'>('unknown');
  const [waitlistedCycles, setWaitlistedCycles] = useState<Record<ProBillingCycle, boolean>>(() => ({
    monthly: hasProWaitlistIntent('monthly'),
    yearly: hasProWaitlistIntent('yearly'),
  }));

  // Hardcoded against the env. Today this returns `coming_soon` because no
  // real Stripe/Alipay secret is wired into the deploy. The PricingPage MUST
  // never invite a checkout call when this is the case — otherwise the user
  // sees a broken Stripe error after clicking, which feels worse than an
  // honest "not yet available" notice.
  const checkoutStatus = getCheckoutStatus();
  const isCheckoutLive = checkoutStatus.kind === 'available';
  const billingCycle: ProBillingCycle = isYearly ? 'yearly' : 'monthly';

  useEffect(() => {
    let cancelled = false;
    const loadPlan = async () => {
      if (!isAuthenticated || !user?.id) {
        setCurrentPlan('free');
        setSubscriptionStatus('inactive');
        return;
      }

      try {
        // The user could already be Pro via a manual grant in the DB —
        // entitlement lookup tells the UI which plan badge to show. This
        // never starts a checkout.
        const entitlement = await getEntitlement(user.id);
        if (cancelled) return;
        setCurrentPlan(entitlement.plan);

        const remote = await getSubscriptionEntitlement().catch(() => null);
        if (cancelled) return;
        if (remote?.subscription?.status === 'active') {
          setSubscriptionStatus('active');
        } else {
          setSubscriptionStatus('inactive');
        }
      } catch {
        if (cancelled) return;
        setSubscriptionStatus('unknown');
      }
    };

    void loadPlan();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get('checkout');

    if (status === 'success') {
      toast.success(isZh ? '订阅流程已完成，正在同步权益' : 'Checkout completed. Syncing your plan access.');
    }
    if (status === 'canceled') {
      toast.info(isZh ? '已取消支付，仍可继续使用免费版' : 'Checkout canceled. You can keep using the free plan.');
    }
  }, [isZh, location.search]);

  const handleProWaitlist = () => {
    const result = saveProWaitlistIntent({
      billingCycle,
      goal: currentPlan === 'pro' ? 'pro_plan_interest_review' : 'upgrade_from_free',
      userId: user?.id,
      language: isZh ? 'zh' : 'en',
    });

    if (result.status === 'failed') {
      toast.error(
        isZh
          ? '暂时无法保存你的意向，请稍后再试。'
          : 'We could not save your interest yet. Please try again.',
      );
      return;
    }

    setWaitlistedCycles((previous) => ({
      ...previous,
      [result.intent.billingCycle]: true,
    }));

    if (result.status === 'duplicate') {
      toast.info(
        isZh
          ? '已经记录过这个专业版意向了。'
          : 'You are already on the Pro interest list for this billing option.',
      );
      return;
    }

    toast.success(
      isZh
        ? '已记录：专业版开放时会提醒你。'
        : 'Saved. We will use this signal for the Pro launch.',
    );
  };

  return (
    <div className="pricing-unframed-route study-premium-bg min-h-screen bg-background text-foreground">
      {/* Header reuses the shared brand mark so Pricing matches Home / Auth. */}
      <header className="sticky top-3 z-30 px-3 sm:px-4">
        <GlassSurface variant="bar" className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-5">
          <BrandMark />
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            {isAuthenticated ? (
              <Button asChild variant="glassPrimary" className="h-9 px-4 text-sm font-medium">
                <Link to="/dashboard/today">
                  {isZh ? '进入今日' : 'Go to Today'}
                </Link>
              </Button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
                >
                  {isZh ? '登录' : 'Sign in'}
                </Link>
                <Button asChild variant="glassPrimary" className="h-9 px-4 text-sm font-medium">
                  <Link to="/register">
                    {isZh ? '免费开始' : 'Get started'}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </GlassSurface>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="max-w-3xl">
          <Badge
            variant="secondary"
            className="rounded-md bg-muted text-muted-foreground"
          >
            <BookOpen className="mr-1 h-3 w-3" />
            {isZh ? '定价与会员' : 'Pricing & membership'}
          </Badge>
          <h1 className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">
            {isZh ? '选择你的学习方案' : 'Choose your learning plan'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {isZh ? '免费版够日常练习，专业版用于考试评分和周计划。' : 'Free covers daily practice. Pro adds exam scoring and weekly planning.'}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {isZh ? '先用免费版，专业版开放后再切换。' : 'Start free, switch when Pro is live.'}
          </p>
        </div>

        <section
          aria-label={isZh ? '方案任务分工' : 'Plan jobs to be done'}
          className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-2"
        >
          <div className="rounded-xl bg-[hsl(var(--paper-muted)/0.24)] px-4 py-3">
            <p className="text-xs font-semibold text-muted-foreground">
              {isZh ? '免费版包含' : 'Free includes'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{pickLocalized(FREE_JOB, i18n.language || 'en')}</p>
          </div>
          <div className="rounded-xl bg-primary/10 px-4 py-3">
            <p className="text-xs font-semibold text-primary">
              {isZh ? '专业版适合' : 'Pro is for'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{pickLocalized(PRO_JOB, i18n.language || 'en')}</p>
          </div>
        </section>

        <Card className="mt-8 max-w-4xl border-transparent [padding-block:0]">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {isZh ? '当前方案' : 'Current plan'}
                </p>
                <p className="mt-1 text-base font-semibold">
                  {currentPlan === 'pro' ? (isZh ? '专业版' : 'Pro') : (isZh ? '免费版' : 'Free')}
                </p>
              </div>
              <Badge
                variant={currentPlan === 'pro' ? 'default' : 'outline'}
                className={cn(
                  'px-3 py-1 text-xs',
                  currentPlan === 'pro'
                    ? 'bg-primary text-primary-foreground'
                    : 'border-transparent bg-muted/55 text-muted-foreground',
                )}
              >
                {currentPlan === 'pro'
                  ? subscriptionStatus === 'active'
                    ? (isZh ? '已激活' : 'Active')
                    : (isZh ? '已授权' : 'Granted')
                  : (isZh ? '免费版' : 'Free tier')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <GlassSurface variant="control" className="mt-6 inline-flex items-center justify-start gap-4 px-4 py-2.5">
          <span className={cn('text-sm', !isYearly && 'font-semibold')}>{isZh ? '按月' : 'Monthly'}</span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            aria-label="Toggle yearly pricing"
            className="data-[state=unchecked]:bg-muted/70"
          />
          <span className={cn('text-sm', isYearly && 'font-semibold')}>
            {isZh ? '按年' : 'Yearly'}
            <Badge
              variant="secondary"
              className="ml-2 bg-primary/10 text-xs text-primary"
            >
              {isZh ? '省 20%' : 'Save 20%'}
            </Badge>
          </span>
        </GlassSurface>

        <div className="mt-6 grid max-w-4xl gap-6 sm:grid-cols-2">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isPaid = plan.id !== 'free';
            const showFailClosedNotice = isPaid && !isCheckoutLive;
            const isWaitlistedForCycle = isPaid && waitlistedCycles[billingCycle];

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card
                  data-testid={`pricing-plan-${plan.id}`}
                  className={cn(
	                    'pricing-plan-surface relative h-full overflow-hidden pl-5 [padding-block:0]',
	                  )}
	                  data-highlighted={plan.highlighted ? 'true' : 'false'}
	                >
	                  {plan.highlighted && (
                    <Badge className="absolute right-0 top-0 rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {isZh ? '备考方案' : 'Exam prep'}
                    </Badge>
                  )}

                  <CardContent className="flex h-full flex-col p-5 sm:p-6">
                    <div>
                      <h2 className="text-xl font-semibold">{isZh ? plan.nameZh : plan.name}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {isZh ? plan.descriptionZh : plan.description}
                      </p>
                    </div>

                    <div className="mt-6">
                      {showFailClosedNotice ? (
                        <div>
                          <p className="text-sm font-semibold text-[hsl(var(--warning))]">
                            {isZh ? '暂未开放' : 'Coming soon'}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {isZh
                              ? `参考价 $${price.toFixed(2).replace(/\.00$/, '')}${isYearly ? ' / 月，按年结算' : ' / 月'}`
                              : `Reference price $${price.toFixed(2).replace(/\.00$/, '')}${isYearly ? ' / month, billed yearly' : ' / month'}`}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-semibold">
                              ${price.toFixed(2).replace(/\.00$/, '')}
                            </span>
                            <span className="text-sm text-muted-foreground">{isZh ? '/ 月' : '/ month'}</span>
                          </div>
                          {isYearly && plan.yearlyPrice > 0 && (
                            <p className="mt-1 text-xs text-primary">
                              {isZh
                                ? `按年结算（$${(plan.yearlyPrice * 12).toFixed(0)}/年）`
                                : `Billed annually ($${(plan.yearlyPrice * 12).toFixed(0)}/year)`}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <Separator className="my-6 bg-border" />

                    <ul className="flex-1 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature.en} className="flex items-start gap-2.5 text-sm">
                          <Check
                            className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          <span className="text-foreground">{isZh ? feature.zh : feature.en}</span>
                        </li>
                      ))}
                      {plan.notIncluded?.map((feature) => (
                        <li
                          key={feature.en}
                          className="flex items-start gap-2.5 text-sm text-muted-foreground"
                        >
                          <span className="mt-0.5 inline-block h-4 w-4 flex-shrink-0 text-center" aria-hidden="true">
                            -
                          </span>
                          <span>{isZh ? feature.zh : feature.en}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7">
                      {plan.id === 'free' ? (
                        <Button
                          asChild
                          className="h-11 w-full rounded-lg"
	                          variant="glass"
                        >
                          <Link to={isAuthenticated ? '/dashboard/today' : '/register'}>
                            {isZh ? plan.ctaZh : plan.cta}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : showFailClosedNotice ? (
                        // Fail-closed UI: do NOT mount any onClick that
                        // attempts to start a real checkout. This only stores
                        // local product intent so we can measure Pro demand.
                        <div
                          data-testid="pricing-pro-coming-soon"
                          className="rounded-lg bg-[hsl(var(--warning)/0.1)] px-4 py-3 text-left"
                        >
                          <p className="text-sm font-semibold text-[hsl(var(--warning))]">
                            {isZh ? '暂未开放' : 'Coming soon'}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-[hsl(var(--warning))]/85">
                            {isZh
                              ? '专业版将围绕 IELTS 评分、进阶分析、自定义词书和周计划开放；免费版可正常使用。'
                              : "Pro will focus on IELTS scoring, advanced analytics, custom wordbooks, and weekly planning. Free stays available."}
                          </p>
                          <p className="mt-3 text-xs font-medium text-[hsl(var(--warning))]">
                            {isZh ? '结账入口会在真实支付服务接好后出现。' : 'Checkout appears here once a real provider is connected.'}
                          </p>
                          <Button
                            type="button"
                            data-testid="pricing-pro-waitlist-button"
                            variant={isWaitlistedForCycle ? 'secondary' : 'default'}
                            className="mt-4 h-11 w-full rounded-lg"
                            onClick={handleProWaitlist}
                          >
                            {isWaitlistedForCycle ? (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                {isZh ? '已记录意向' : "You're on the list"}
                              </>
                            ) : (
                              <>
                                <Bell className="mr-2 h-4 w-4" />
                                {isZh ? '专业版开放时通知我' : 'Notify me when Pro opens'}
                              </>
                            )}
                          </Button>
                          <p className="mt-2 text-[11px] leading-relaxed text-[hsl(var(--warning))]/80">
                            {isWaitlistedForCycle
                              ? (isZh
                                ? `已保存${billingCycle === 'yearly' ? '按年' : '按月'}方案意向；不会创建支付会话。`
                                : `${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} Pro interest saved. No checkout session was created.`)
                              : pickLocalized(PRO_WAITLIST_PROMISE, i18n.language || 'en')}
                          </p>
                        </div>
                      ) : (
                        // Real provider is wired. The actual checkout call lives
                        // behind this branch so we can lift it back in once
                        // VITE_BILLING_ENABLED=true is set on the deploy.
                        <Button
                          className="h-11 w-full rounded-lg bg-primary text-primary-foreground shadow-none hover:bg-primary/90"
                          onClick={() =>
                            toast.info(isZh ? '支付服务配置完成后即可开始结账。' : 'Checkout will start when payment provider is configured.')
                          }
                        >
                          {isZh ? plan.ctaZh : plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Fail-closed banner — visible whenever live checkout is disabled. */}
        {!isCheckoutLive && (
          <div
            role="status"
            className="mt-8 flex max-w-4xl flex-col gap-2 rounded-lg bg-[hsl(var(--warning)/0.1)] px-4 py-3 text-sm text-[hsl(var(--warning))] sm:flex-row sm:items-center sm:gap-3"
          >
            <ShieldAlert className="h-5 w-5 flex-shrink-0 text-[hsl(var(--warning))]" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-semibold">
                {isZh ? '专业版订阅暂未开放' : 'Pro checkout is not yet open'}
              </p>
              <p className="text-xs text-[hsl(var(--warning))]/90">
                {isZh ? (
                  <>
                    我们暂未接入真实支付服务，因此不会让你点进一个无效的支付流程。免费版完全可用，
                    支付服务真实可用后，本页会显示明确的专业版入口。
                  </>
                ) : (
                  <>
                    We haven't wired a real payment provider on this deployment yet, so we won't pretend Pro is purchasable.
                    The free plan stays fully functional, and this page will switch to checkout only after a real provider is ready.
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center text-2xl font-bold">
            {isZh ? '常见问题' : 'Frequently asked questions'}
          </h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq) => (
	              <Card key={faq.question} className="border-transparent">
                <CardContent className="p-4 sm:p-5">
                  <h3 className="flex items-start gap-2 text-sm font-semibold">
                    <HelpCircle
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>
                      {isZh ? faq.questionZh : faq.question}
                    </span>
                  </h3>
                  <p className="mt-2 pl-6 text-sm text-muted-foreground">
                    {isZh ? faq.answerZh : faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="mt-14 text-center">
          <p className="text-sm text-muted-foreground">
            {isZh ? '需要企业或学校方案？先用免费版试完整学习流程。' : 'Need an enterprise or school plan? Start with Free while checkout is being prepared.'}
          </p>
          <Button
            asChild
            size="lg"
            className="mt-5 rounded-lg bg-primary text-primary-foreground shadow-none hover:bg-primary/90"
          >
            <Link to="/register">
              {isZh ? '免费开始' : 'Start free'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </main>

      <footer className="py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
          <BrandMark variant="compact" />
          <p className="text-xs text-muted-foreground">
            {isZh
              ? '© 2026 VocabDaily · 每日英语练习'
              : '© 2026 VocabDaily · Daily English practice.'}
          </p>
          <nav className="flex items-center gap-3 text-xs text-muted-foreground" aria-label={isZh ? '法律链接' : 'Legal links'}>
            <Link to="/terms" className="transition-colors hover:text-foreground">
              {isZh ? '服务条款' : 'Terms'}
            </Link>
            <span className="text-border" aria-hidden="true">/</span>
            <Link to="/privacy" className="transition-colors hover:text-foreground">
              {isZh ? '隐私政策' : 'Privacy'}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

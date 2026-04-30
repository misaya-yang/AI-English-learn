import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRight,
  Check,
  Crown,
  HelpCircle,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getEntitlement } from '@/data/examContent';
import { getSubscriptionEntitlement } from '@/services/billingGateway';
import { toast } from 'sonner';
import { BrandMark } from '@/features/marketing/BrandMark';
import { getCheckoutStatus } from '@/features/marketing/pricingAvailability';
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
  features: Array<{ en: string; zh: string }>;
  notIncluded?: Array<{ en: string; zh: string }>;
  cta: string;
  ctaZh: string;
  highlighted: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    nameZh: '免费版',
    description: 'Build the daily habit.',
    descriptionZh: '从每日学习习惯开始。',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { en: 'Daily mission with new words + review', zh: '每日任务：新词 + 复习' },
      { en: 'Core quiz, listening, and chat usage', zh: '核心测验、听力与教练对话' },
      { en: 'Limited IELTS simulation and AI feedback', zh: '有限 IELTS 仿真与 AI 反馈' },
      { en: 'Smart spaced-review queue', zh: '智能间隔复习队列' },
      { en: 'Basic progress tracking', zh: '基础进度追踪' },
    ],
    notIncluded: [
      { en: 'Deep AI writing feedback', zh: '深度 AI 写作反馈' },
      { en: 'All practice modes unlocked', zh: '全部练习模式' },
      { en: 'Priority generation queue', zh: '优先生成队列' },
      { en: 'Export to CSV / Anki', zh: '导出 CSV / Anki' },
    ],
    cta: 'Start with Free',
    ctaZh: '免费开始',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    nameZh: '专业版',
    description: 'For learners who want depth and speed.',
    descriptionZh: '面向需要深度反馈与高效学习的用户。',
    monthlyPrice: 9.99,
    yearlyPrice: 7.99,
    features: [
      { en: 'Unlimited daily words', zh: '每日新词不限量' },
      { en: 'Advanced AI feedback', zh: '进阶 AI 反馈' },
      { en: 'IELTS Writing Coach (structured scoring)', zh: 'IELTS 写作教练（结构化评分）' },
      { en: 'IELTS micro courses + simulation items', zh: 'IELTS 微课程与仿真题' },
      { en: 'Error graph & one-click remediation lessons', zh: '错因图谱与一键补强课' },
      { en: 'All practice modes', zh: '全部练习模式' },
      { en: 'Priority word generation', zh: '优先词汇生成' },
      { en: 'Export to CSV / Anki', zh: '导出 CSV / Anki' },
      { en: 'Ad-free experience', zh: '无广告体验' },
      { en: 'Detailed analytics', zh: '详细学习分析' },
    ],
    cta: 'Upgrade to Pro',
    ctaZh: '升级到专业版',
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
    questionZh: 'Pro 上线后我现在的数据会保留吗？',
    answer:
      'Yes. Your learning records, vocabulary, and history are independent of your plan. Upgrading later only changes entitlements.',
    answerZh:
      '会保留。您的学习记录、词汇和历史数据与订阅方案无关，升级后仅权益发生变化。',
  },
  {
    question: 'Can I cancel my subscription anytime once it\'s live?',
    questionZh: '订阅功能上线后可以随时取消吗？',
    answer:
      'Yes. You can cancel anytime and keep access until the end of the current billing period.',
    answerZh:
      '可以。您可以随时取消，并在当前计费周期结束前继续享有 Pro 权益。',
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

  // Hardcoded against the env. Today this returns `coming_soon` because no
  // real Stripe/Alipay secret is wired into the deploy. The PricingPage MUST
  // never invite a checkout call when this is the case — otherwise the user
  // sees a broken Stripe error after clicking, which feels worse than an
  // honest "not yet available" notice.
  const checkoutStatus = getCheckoutStatus();
  const isCheckoutLive = checkoutStatus.kind === 'available';

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header reuses the shared brand mark so Pricing matches Home / Auth. */}
      <header className="sticky top-0 z-30 border-b border-border bg-[hsl(var(--surface-raised))]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            {isAuthenticated ? (
              <Link to="/dashboard/today">
                <Button className="h-9 rounded-md px-4 text-sm font-medium shadow-sm">
                  {isZh ? '进入控制台' : 'Go to dashboard'}
                </Button>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
                >
                  {isZh ? '登录' : 'Sign in'}
                </Link>
                <Link to="/register">
                  <Button className="h-9 rounded-md px-4 text-sm font-medium shadow-sm">
                    {isZh ? '免费开始' : 'Get started'}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="border border-primary/20 bg-primary/10 text-primary"
          >
            <Crown className="mr-1 h-3 w-3" />
            {isZh ? '定价与会员' : 'Pricing & membership'}
          </Badge>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {isZh ? '选择你的学习方案' : 'Choose your learning plan'}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {isZh ? '选择适合你的学习方案' : 'Choose the plan that fits your practice rhythm.'}
          </p>
          <p className="mt-3 text-base text-muted-foreground">
            {isZh ? '免费开始，Pro 上线后再升级。' : 'Start free, upgrade when Pro is live.'}
          </p>
        </div>

        {/* Fail-closed banner — visible whenever live checkout is disabled. */}
        {!isCheckoutLive && (
          <div
            role="status"
            className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 rounded-lg border border-amber-300/70 bg-amber-50/70 px-5 py-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:gap-3 dark:border-amber-400/30 dark:bg-amber-500/[0.08] dark:text-amber-200"
          >
            <ShieldAlert className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-semibold">
                {isZh ? 'Pro 订阅暂未开放' : 'Pro checkout is not yet open'}
              </p>
              <p className="text-xs text-amber-800/90 dark:text-amber-200/80">
                {isZh ? (
                  <>
                    我们暂未接入真实支付服务，因此不会让你点进一个无效的支付流程。免费版完全可用，
                    支付服务真实可用后，本页会显示明确的升级入口。
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

        <Card className="mx-auto mt-10 max-w-3xl border-primary/25">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {isZh ? '当前方案' : 'Current plan'}
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {currentPlan === 'pro' ? 'Pro' : (isZh ? '免费版' : 'Free')}
                </p>
              </div>
              <Badge
                variant={currentPlan === 'pro' ? 'default' : 'outline'}
                className={cn(
                  'px-3 py-1 text-xs',
                  currentPlan === 'pro'
                    ? 'bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground',
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

        <div className="mt-10 flex items-center justify-center gap-4">
          <span className={cn('text-sm', !isYearly && 'font-semibold')}>{isZh ? '按月' : 'Monthly'}</span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            aria-label="Toggle yearly pricing"
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
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isPaid = plan.id !== 'free';
            const showFailClosedNotice = isPaid && !isCheckoutLive;

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
                    'relative h-full overflow-hidden rounded-lg border bg-[hsl(var(--surface-raised))]',
                    plan.highlighted
                      ? 'border-[hsl(var(--accent-coach))] shadow-[0_1px_0_hsl(var(--border)/0.7),0_22px_52px_-38px_hsl(var(--accent-coach)/0.7)]'
                      : 'border-border',
                  )}
                >
                  {plan.highlighted && <div className="absolute inset-x-0 top-0 h-1 bg-[hsl(var(--accent-coach))]" />}
                  {plan.highlighted && (
                    <Badge className="absolute right-5 top-5 bg-[hsl(var(--accent-coach))] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      {isZh ? '最受欢迎' : 'Most popular'}
                    </Badge>
                  )}

                  <CardContent className="flex h-full flex-col p-6 sm:p-7">
                    <div>
                      <h2 className="text-2xl font-bold">{isZh ? plan.nameZh : plan.name}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {isZh ? plan.descriptionZh : plan.description}
                      </p>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tight">
                          ${price.toFixed(2).replace(/\.00$/, '')}
                        </span>
                        <span className="text-sm text-muted-foreground">{isZh ? '/ 月' : '/ month'}</span>
                      </div>
                      {isYearly && plan.yearlyPrice > 0 && (
                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                          {isZh
                            ? `按年结算（$${(plan.yearlyPrice * 12).toFixed(0)}/年）`
                            : `Billed annually ($${(plan.yearlyPrice * 12).toFixed(0)}/year)`}
                        </p>
                      )}
                    </div>

                    <Separator className="my-6 bg-border" />

                    <ul className="flex-1 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature.en} className="flex items-start gap-2.5 text-sm">
                          <Check
                            className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500"
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
                            –
                          </span>
                          <span>{isZh ? feature.zh : feature.en}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7">
                      {plan.id === 'free' ? (
                        <Link to={isAuthenticated ? '/dashboard/today' : '/register'}>
                          <Button
                            className="h-11 w-full rounded-md"
                            variant="outline"
                          >
                            {isZh ? plan.ctaZh : plan.cta}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      ) : showFailClosedNotice ? (
                        // Fail-closed UI: do NOT mount any onClick that
                        // attempts to start a real checkout. Render a clearly
                        // labelled status state and link to support instead.
                        <div
                          data-testid="pricing-pro-coming-soon"
                          className="rounded-lg border border-dashed border-amber-300/70 bg-amber-50/60 p-4 text-center dark:border-amber-400/30 dark:bg-amber-500/[0.08]"
                        >
                          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                            {isZh ? '暂未开放' : 'Coming soon'}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-amber-800/85 dark:text-amber-200/85">
                            {isZh
                              ? '付费版本暂未开放，免费版可正常使用。'
                              : "Pro subscription isn't available on this deploy yet."}
                          </p>
                          <p className="mt-3 text-xs font-medium text-amber-900 dark:text-amber-200">
                            {isZh ? '结账入口会在真实支付服务接好后出现。' : 'Checkout appears here once a real provider is connected.'}
                          </p>
                        </div>
                      ) : (
                        // Real provider is wired. The actual checkout call lives
                        // behind this branch so we can lift it back in once
                        // VITE_BILLING_ENABLED=true is set on the deploy.
                        <Button
                          className="h-11 w-full rounded-md bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
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

        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center text-2xl font-bold">
            {isZh ? '常见问题' : 'Frequently asked questions'}
          </h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq) => (
              <Card key={faq.question} className="border-border">
                <CardContent className="p-4 sm:p-5">
                  <h3 className="flex items-start gap-2 text-sm font-semibold">
                    <HelpCircle
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500"
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
            {isZh ? '需要企业或学校方案？请先使用免费版完成学习闭环验证。' : 'Need an enterprise or school plan? Start with the free learning loop while checkout is being prepared.'}
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="mt-5 rounded-md bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {isZh ? '免费开始' : 'Start free'}
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
          <BrandMark variant="compact" />
          <p className="text-xs text-muted-foreground">
            {isZh
              ? '© 2026 VocabDaily · 英语学习工作台'
              : '© 2026 VocabDaily · A learning workbench for English.'}
          </p>
        </div>
      </footer>
    </div>
  );
}

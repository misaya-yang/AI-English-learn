import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Check, Sparkles, Crown, ArrowRight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getEntitlement, getQuotaSnapshot } from '@/data/examContent';
import { createBillingCheckout, getSubscriptionEntitlement } from '@/services/billingGateway';
import { recordLearningEvent } from '@/services/learningEvents';
import { toast } from 'sonner';

const plans = [
  {
    id: 'free',
    name: 'Free',
    nameZh: '免费版',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '10 words per day',
      'Basic review mode',
      'Limited practice quizzes',
      '2 IELTS AI feedback/day',
      'Community support',
      'Basic progress tracking',
    ],
    notIncluded: [
      'Advanced AI feedback',
      'All practice modes',
      'Priority generation',
      'Export to CSV/Anki',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    nameZh: '专业版',
    description: 'For serious learners',
    monthlyPrice: 9.99,
    yearlyPrice: 7.99,
    features: [
      'Unlimited words per day',
      'Advanced AI feedback',
      'IELTS Writing Coach (structured scoring)',
      'IELTS micro courses + simulation items',
      'Error graph & one-click remediation lesson',
      'All practice modes',
      'Priority word generation',
      'Export to CSV/Anki',
      'Ad-free experience',
      'Email support',
      'Detailed analytics',
    ],
    notIncluded: [],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
];

const faqs = [
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes. You can cancel anytime and keep access until the end of the current billing period.',
  },
  {
    question: 'Do you support Alipay and Stripe?',
    answer: 'Yes. Stripe is the primary checkout path, and Alipay adapter is available.',
  },
  {
    question: 'Will my current data be kept after upgrade?',
    answer: 'Yes. Upgrading only changes entitlements; your learning records remain unchanged.',
  },
];

export default function PricingPage() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const userId = user?.id || 'guest';

  const [isYearly, setIsYearly] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro'>('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive');
  const [billingProvider, setBillingProvider] = useState<'stripe' | 'alipay' | 'manual'>('manual');
  const [remaining, setRemaining] = useState({
    aiAdvancedFeedbackPerDay: 0,
    simItemsPerDay: 0,
    microLessonsPerDay: 0,
  });
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const loadPlan = async () => {
      const entitlement = await getEntitlement(userId);
      const snapshot = await getQuotaSnapshot(userId);
      setCurrentPlan(entitlement.plan);
      setRemaining(snapshot.remaining);

      try {
        const remote = await getSubscriptionEntitlement();
        setSubscriptionStatus(remote.subscription?.status || 'inactive');
        setBillingProvider(remote.subscription?.provider || 'manual');
      } catch {
        setSubscriptionStatus('inactive');
      }
    };

    void loadPlan();
  }, [userId]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get('checkout');

    if (status === 'success') {
      toast.success('订阅流程已完成，正在同步权益');
    }

    if (status === 'canceled') {
      toast.info('已取消支付，仍可继续使用免费版');
    }
  }, [location.search]);

  const planId = useMemo(() => (isYearly ? 'pro_yearly' : 'pro_monthly'), [isYearly]);

  const handleCheckout = async (provider: 'stripe' | 'alipay') => {
    if (!isAuthenticated) {
      toast.info('请先登录后再升级');
      return;
    }

    setIsCheckingOut(true);

    try {
      await recordLearningEvent({
        userId,
        eventName: 'billing.checkout_started',
        payload: { provider, planId },
      });

      const origin = window.location.origin;
      const result = await createBillingCheckout({
        provider,
        planId,
        successUrl: `${origin}/pricing?checkout=success`,
        cancelUrl: `${origin}/pricing?checkout=canceled`,
      });

      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }

      toast.success(`已创建 ${provider.toUpperCase()} 订单：${result.orderId || 'pending'}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建支付失败';
      toast.error(message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">VocabDaily AI</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm hover:text-emerald-600">
                Sign In
              </Link>
              <Link to="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Crown className="h-3 w-3 mr-1" />
            Pricing & Membership
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Learning Plan</h1>
          <p className="text-xl text-muted-foreground mb-2">Start free, upgrade when you're ready</p>
          <p className="text-muted-foreground">免费开始，准备好时升级 Pro 即可</p>
        </div>

        <Card className="max-w-3xl mx-auto mb-8 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="text-lg font-semibold">{currentPlan === 'pro' ? 'Pro' : 'Free'}</p>
              </div>
              <Badge variant={currentPlan === 'pro' ? 'default' : 'outline'}>
                {currentPlan === 'pro' ? 'Active' : 'Upgrade available'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={cn('text-sm', !isYearly && 'font-medium')}>Monthly</span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={cn('text-sm', isYearly && 'font-medium')}>
            Yearly
            <Badge variant="secondary" className="ml-2 text-xs">
              Save 20%
            </Badge>
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className={cn('h-full relative', plan.highlighted && 'border-emerald-500 shadow-card')}>
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600">Most Popular</Badge>
                )}
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold">{plan.name}</h2>
                    <p className="text-sm text-muted-foreground">{plan.nameZh}</p>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">${isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                    <span className="text-muted-foreground">/month</span>
                    {isYearly && plan.yearlyPrice > 0 && (
                      <p className="text-sm text-emerald-600 mt-1">Billed annually (${plan.yearlyPrice * 12}/year)</p>
                    )}
                  </div>

                  <Separator className="my-6" />

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-muted-foreground">
                        <span className="h-5 w-5 flex-shrink-0 text-center">-</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.id === 'free' ? (
                    <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                      <Button className="w-full" variant="outline">
                        {plan.cta}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleCheckout('stripe')}
                        disabled={isCheckingOut}
                      >
                        {isCheckingOut ? 'Processing...' : 'Checkout with Stripe'}
                      </Button>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handleCheckout('alipay')}
                        disabled={isCheckingOut}
                      >
                        {isCheckingOut ? 'Processing...' : 'Checkout with Alipay'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-emerald-600" />
                    {faq.question}
                  </h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Need help with enterprise or school plan?{' '}
            <a href="mailto:support@vocabdaily.ai" className="text-emerald-600 hover:underline">
              support@vocabdaily.ai
            </a>
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <Sparkles className="h-5 w-5 mr-2" />
              Start Your Free Journey
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
                <BookOpen className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium">VocabDaily AI</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 VocabDaily AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

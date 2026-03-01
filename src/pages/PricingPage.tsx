import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  Check,
  Sparkles,
  Crown,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getEntitlement, getQuotaSnapshot, setEntitlementPlan } from '@/data/examContent';
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
    ctaZh: '免费开始',
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
    cta: 'Start Pro Trial',
    ctaZh: '开始专业版试用',
    highlighted: true,
  },
];

const faqs = [
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.',
  },
  {
    question: 'Is there a free trial for Pro?',
    answer: 'Yes! We offer a 7-day free trial for Pro. You can try all Pro features before committing.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept credit cards, PayPal, and various local payment methods depending on your region.',
  },
  {
    question: 'Can I switch between monthly and yearly billing?',
    answer: 'Yes, you can switch your billing cycle at any time from your account settings.',
  },
];

export default function PricingPage() {
  const { isAuthenticated, user } = useAuth();
  const userId = user?.id || 'guest';
  const [isYearly, setIsYearly] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro'>('free');
  const [remaining, setRemaining] = useState({
    aiAdvancedFeedbackPerDay: 0,
    simItemsPerDay: 0,
    microLessonsPerDay: 0,
  });

  useEffect(() => {
    const loadPlan = async () => {
      const entitlement = await getEntitlement(userId);
      const snapshot = await getQuotaSnapshot(userId);
      setCurrentPlan(entitlement.plan);
      setRemaining(snapshot.remaining);
    };
    void loadPlan();
  }, [userId]);

  const handleSwitchPlan = async (plan: 'free' | 'pro') => {
    await setEntitlementPlan(userId, plan);
    const entitlement = await getEntitlement(userId);
    const snapshot = await getQuotaSnapshot(userId);
    setCurrentPlan(entitlement.plan);
    setRemaining(snapshot.remaining);
    toast.success(`Plan switched to ${plan.toUpperCase()} (manual entitlement mode)`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">VocabDaily AI</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm hover:text-emerald-600">
                Sign In
              </Link>
              <Link to="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Crown className="h-3 w-3 mr-1" />
            Simple Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Learning Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Start free, upgrade when you're ready
          </p>
          <p className="text-muted-foreground">
            免费开始，准备好时再升级
          </p>
        </div>

        <Card className="max-w-3xl mx-auto mb-8 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Current Entitlement</p>
                <p className="text-lg font-semibold">Plan: {currentPlan.toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">
                  AI feedback left today: {remaining.aiAdvancedFeedbackPerDay} • Sim items left: {remaining.simItemsPerDay} • Micro lessons left: {remaining.microLessonsPerDay}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant={currentPlan === 'free' ? 'default' : 'outline'} onClick={() => handleSwitchPlan('free')}>
                  Switch to Free
                </Button>
                <Button variant={currentPlan === 'pro' ? 'default' : 'outline'} onClick={() => handleSwitchPlan('pro')}>
                  Switch to Pro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Toggle */}
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

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                className={cn(
                  'h-full relative',
                  plan.highlighted && 'border-emerald-500 shadow-lg'
                )}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold">{plan.name}</h2>
                    <p className="text-sm text-muted-foreground">{plan.nameZh}</p>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                    {isYearly && plan.yearlyPrice > 0 && (
                      <p className="text-sm text-emerald-600 mt-1">
                        Billed annually (${plan.yearlyPrice * 12}/year)
                      </p>
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

                  <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                    <Button
                      className={cn(
                        'w-full',
                        plan.highlighted
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'variant-outline'
                      )}
                      variant={plan.highlighted ? 'default' : 'outline'}
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">Free</th>
                  <th className="text-center py-3 px-4">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Daily words', free: '10', pro: 'Unlimited' },
                  { feature: 'Review mode', free: 'Basic', pro: 'Advanced SRS' },
                  { feature: 'Practice quizzes', free: 'Limited', pro: 'All modes' },
                  { feature: 'IELTS AI feedback/day', free: '2', pro: '30' },
                  { feature: 'IELTS micro courses', free: 'Limited', pro: 'Full access' },
                  { feature: 'Error graph', free: '-', pro: '✓' },
                  { feature: 'Export to CSV/Anki', free: '-', pro: '✓' },
                  { feature: 'Analytics', free: 'Basic', pro: 'Detailed' },
                  { feature: 'Support', free: 'Community', pro: 'Email' },
                  { feature: 'Ads', free: 'Yes', pro: 'No' },
                ].map((row) => (
                  <tr key={row.feature} className="border-b">
                    <td className="py-3 px-4">{row.feature}</td>
                    <td className="text-center py-3 px-4">{row.free}</td>
                    <td className="text-center py-3 px-4 text-emerald-600">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
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

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Still have questions? Contact us at{' '}
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

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center">
                <BookOpen className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium">VocabDaily AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 VocabDaily AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

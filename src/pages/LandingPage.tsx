import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  ChartNoAxesCombined,
  CheckCircle2,
  Flame,
  Menu,
  MessageCircleMore,
  Moon,
  Sparkles,
  Sun,
  Target,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { buildAuthRedirect } from '@/lib/authRedirect';
import { cn } from '@/lib/utils';
import { BrandMark } from '@/features/marketing/BrandMark';

const outcomeCards = [
  {
    title: 'Know your next best action',
    titleZh: '知道下一步该练什么',
    description: 'Today, Review, Practice, Coach, and Exam all speak the same learning language.',
    icon: Target,
  },
  {
    title: 'Turn weak spots into drills',
    titleZh: '把薄弱点直接变成练习',
    description: 'Errors from writing, quiz, and review flow back into the next mission automatically.',
    icon: Brain,
  },
  {
    title: 'Get fast, structured feedback',
    titleZh: '拿到快速而结构化的反馈',
    description: 'Short answers feel instant. Deep IELTS-style feedback stays transparent and actionable.',
    icon: Sparkles,
  },
];

const workflow = [
  {
    step: '01',
    title: 'Set your goal',
    titleZh: '设定目标',
    description: 'General English, workplace communication, or IELTS score boost.',
  },
  {
    step: '02',
    title: 'Follow one clear daily path',
    titleZh: '沿着一条清晰主线学',
    description: 'The system prioritizes due review, weak tags, and the most efficient next action.',
  },
  {
    step: '03',
    title: 'Close the loop with AI',
    titleZh: '用 AI 完成反馈闭环',
    description: 'Chat, quiz, writing, and exam prep feed into the same profile and mission engine.',
  },
];

const feedbackSamples = [
  {
    label: 'Today mission',
    labelZh: '今日主任务',
    title: 'Clear 8 due cards before learning 6 new transport words',
    titleZh: '先清掉 8 个到期卡，再学 6 个交通主题新词',
    note: 'Estimated 14 minutes · Recommended because your retention load is rising',
  },
  {
    label: 'Coach guidance',
    labelZh: 'AI 家教建议',
    title: 'Your recent weakness clusters around collocations and tense control',
    titleZh: '你最近的错误集中在搭配和时态控制',
    note: 'Suggested next step: 3-question quiz + one mini writing drill',
  },
  {
    label: 'Exam feedback',
    labelZh: '考试反馈',
    title: 'Band 6.0 → biggest gap: coherence and lexical precision',
    titleZh: 'Band 6.0 → 最大短板是连贯衔接和词汇精度',
    note: 'One-click: convert issues to micro lesson and vocabulary follow-up',
  },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    tone: 'border-border bg-card',
    points: [
      'Daily mission with new words + review',
      'Core quiz, listening, and chat usage',
      'Limited IELTS simulation and AI feedback',
    ],
  },
  {
    name: 'Pro',
    price: '$9.99',
    tone: 'border-emerald-500/40 bg-emerald-500/8 shadow-[0_20px_60px_-45px_hsl(var(--primary)/0.95)]',
    points: [
      'Deep AI feedback and adaptive practice',
      'Full IELTS score-boost cockpit and writing coach',
      'Long-term memory, advanced analytics, and premium TTS paths',
    ],
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const continuePath = isAuthenticated ? '/dashboard/today' : buildAuthRedirect('/dashboard/today');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleThemeToggle = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/68">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <BrandMark />
            <span className="hidden text-xs text-muted-foreground sm:inline-block">
              A focused English learning system
            </span>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#outcomes" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Outcomes</a>
            <a href="#workflow" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Workflow</a>
            <a href="#membership" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Membership</a>
            <Link to="/word-of-the-day" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Word of the Day</Link>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={handleThemeToggle}>
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {isAuthenticated ? (
              <Button className="rounded-md bg-primary hover:bg-primary/90" asChild>
                <Link to={continuePath}>Continue learning</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="rounded-lg" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button className="rounded-md bg-primary hover:bg-primary/90" asChild>
                  <Link to="/register">Start free</Link>
                </Button>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl md:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isMobileMenuOpen ? (
          <div className="border-t bg-background px-4 py-4 md:hidden">
            <div className="space-y-3">
              <a href="#outcomes" className="block text-sm text-muted-foreground">Outcomes</a>
              <a href="#workflow" className="block text-sm text-muted-foreground">Workflow</a>
              <a href="#membership" className="block text-sm text-muted-foreground">Membership</a>
              <Link to="/word-of-the-day" className="block text-sm text-muted-foreground">Word of the Day</Link>
              <Separator />
              <Button variant="outline" className="w-full rounded-lg" onClick={handleThemeToggle}>
                {resolvedTheme === 'dark' ? 'Switch to light' : 'Switch to dark'}
              </Button>
              {isAuthenticated ? (
                <Button className="w-full rounded-md bg-primary hover:bg-primary/90" asChild>
                  <Link to={continuePath}>Continue learning</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full rounded-lg" asChild>
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button className="w-full rounded-md bg-primary hover:bg-primary/90" asChild>
                    <Link to="/register">Start free</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main>
        <section className="px-4 pb-16 pt-28 lg:px-6 lg:pb-24 lg:pt-36">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <Badge className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300">
                General English first · IELTS when it matters
              </Badge>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Stop juggling isolated AI features. Start learning through one clear English workflow.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground lg:text-xl">
                VocabDaily turns vocabulary, review, practice, AI coaching, and IELTS prep into one system that actually remembers your goals and weak spots.
              </p>
              <p className="mt-3 max-w-2xl text-base text-muted-foreground">
                不再是“一个聊天框 + 一堆工具按钮”，而是一个知道你今天该做什么、你卡在哪、下一步怎么补强的学习系统。
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="rounded-md bg-primary px-5 hover:bg-primary/90" asChild>
                  <Link to={isAuthenticated ? '/dashboard/today' : '/register'}>
                    {isAuthenticated ? 'Continue today plan' : 'Start free'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-lg px-6" asChild>
                  <Link to="/pricing">See Pro difference</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Next-best-action UI', value: '3 sec' },
                  { label: 'Target feedback loop', value: '< 8 sec' },
                  { label: 'Learning surfaces', value: 'Today / Review / Practice / Coach / Exam' },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border bg-card px-4 py-4">
                    <p className="text-xl font-semibold text-emerald-600">{item.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <Card className="overflow-hidden rounded-[28px] border-emerald-500/20 bg-gradient-to-br from-card via-card to-emerald-500/5">
                <CardContent className="space-y-4 p-6 lg:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-emerald-600">Today mission</p>
                      <h2 className="mt-1 text-2xl font-semibold">Clear 8 due cards, then learn 6 transport words</h2>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-600">
                      <Target className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="rounded-lg border bg-background/70 px-4 py-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Mission progress</span>
                      <span className="text-muted-foreground">2 / 3 done</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-muted">
                      <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border bg-background/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Weak spot</p>
                      <p className="mt-2 text-lg font-semibold">Collocations + tense control</p>
                      <p className="mt-1 text-sm text-muted-foreground">Next action: 3-question coach quiz</p>
                    </div>
                    <div className="rounded-lg border bg-background/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Exam boost</p>
                      <p className="mt-2 text-lg font-semibold">Band 6.0 writing focus</p>
                      <p className="mt-1 text-sm text-muted-foreground">Coherence and lexical precision are the biggest gap</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-3">
                {feedbackSamples.map((item) => (
                  <Card key={item.label} className="rounded-lg">
                    <CardContent className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.titleZh}</p>
                      <p className="mt-3 text-xs text-muted-foreground">{item.note}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="outcomes" className="border-y bg-muted/35 px-4 py-16 lg:px-6 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Outcomes first</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
                The product should feel like a serious learning cockpit, not a loose collection of AI demos.
              </h2>
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {outcomeCards.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full rounded-[28px] border-border/70 bg-card">
                    <CardContent className="p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-600">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{item.titleZh}</p>
                      <p className="mt-4 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="px-4 py-16 lg:px-6 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Workflow</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
                  One profile, one mission engine, five learning surfaces.
                </h2>
                <p className="mt-4 text-base text-muted-foreground">
                  无论你今天是在背单词、做复习、刷小测、问 AI 家教，还是练 IELTS 写作，系统都应该共用同一份目标、弱项和反馈闭环。
                </p>
              </div>

              <div className="space-y-4">
                {workflow.map((item) => (
                  <Card key={item.step} className="rounded-[28px] border-border/70">
                    <CardContent className="flex gap-4 p-5 lg:p-6">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-sm font-semibold text-white">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.titleZh}</p>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="membership" className="border-t px-4 py-16 lg:px-6 lg:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Membership</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
                Free should feel useful. Pro should feel decisively more efficient.
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                付费价值不来自“更多按钮”，而来自更快、更深、更连续的学习结果。
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {plans.map((plan) => (
                <Card key={plan.name} className={cn('rounded-[32px] border', plan.tone)}>
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{plan.name}</p>
                        <p className="mt-3 text-4xl font-semibold">{plan.price}</p>
                      </div>
                      {plan.name === 'Pro' ? <Badge className="rounded-full bg-emerald-600 text-white">Best for serious learners</Badge> : null}
                    </div>
                    <div className="mt-6 space-y-3">
                      {plan.points.map((point) => (
                        <div key={point} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                          <p className="text-sm text-muted-foreground">{point}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      className={cn(
                        'mt-6 w-full rounded-lg',
                        plan.name === 'Pro' ? 'bg-primary hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                      )}
                      asChild
                    >
                      <Link to={plan.name === 'Pro' ? '/pricing' : isAuthenticated ? '/dashboard/today' : '/register'}>
                        {plan.name === 'Pro' ? 'See Pro details' : 'Start with Free'}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 pt-4 lg:px-6 lg:pb-28">
          <div className="mx-auto max-w-5xl rounded-[36px] border bg-gradient-to-br from-card via-card to-emerald-500/5 px-6 py-8 text-center lg:px-10 lg:py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600">
              <Zap className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight lg:text-4xl">
              Build momentum first. Then let AI amplify it.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              从今天的一步开始：先清任务、再补弱项、再让 AI 给你结构化反馈。学习过程应该稳定、透明、可持续。
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" className="rounded-md bg-primary px-5 hover:bg-primary/90" asChild>
                <Link to={isAuthenticated ? '/dashboard/today' : '/register'}>
                  {isAuthenticated ? 'Continue learning' : 'Start learning free'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-lg px-6" asChild>
                <Link to="/pricing">Compare plans</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><Flame className="h-4 w-4 text-orange-500" /> streak-friendly</span>
              <span className="inline-flex items-center gap-2"><MessageCircleMore className="h-4 w-4 text-emerald-600" /> AI coach integrated</span>
              <span className="inline-flex items-center gap-2"><ChartNoAxesCombined className="h-4 w-4 text-cyan-600" /> outcome-driven analytics</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

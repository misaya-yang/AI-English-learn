import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, Check, CirclePlay, Sparkles, Target, Trophy, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthRedirect } from '@/lib/authRedirect';
import { cn } from '@/lib/utils';

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const reduceMotion = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const cockpitRef = useRef<HTMLElement | null>(null);
  const outcomesRef = useRef<HTMLElement | null>(null);
  const membershipRef = useRef<HTMLElement | null>(null);

  const continuePath = isAuthenticated ? '/dashboard/today' : buildAuthRedirect('/dashboard/today');
  const profilePath = isAuthenticated ? '/dashboard/profile' : buildAuthRedirect('/dashboard/profile');
  const primaryCtaPath = isAuthenticated ? continuePath : '/register';
  const upgradePath = '/pricing';

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const cockpitInView = useInView(cockpitRef, { once: true, amount: 0.3 });
  const outcomesInView = useInView(outcomesRef, { once: true, amount: 0.25 });
  const membershipInView = useInView(membershipRef, { once: true, amount: 0.25 });

  const heroCopyY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -68]);
  const heroCopyOpacity = useTransform(scrollYProgress, [0, 0.65], [1, reduceMotion ? 1 : 0.78]);
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 56]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 26]);

  const ease = [0.22, 1, 0.36, 1] as const;

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        delayChildren: reduceMotion ? 0 : 0.08,
        staggerChildren: reduceMotion ? 0 : 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease,
      },
    },
  };

  const navItems = [
    {
      href: '#outcomes',
      label: t('home.nav.outcomes', { defaultValue: 'Outcomes' }),
      route: false,
    },
    {
      href: '#workflow',
      label: t('home.nav.workflow', { defaultValue: 'Workflow' }),
      route: false,
    },
    {
      href: '#membership',
      label: t('home.nav.membership', { defaultValue: 'Membership' }),
      route: false,
    },
    {
      href: '/word-of-the-day',
      label: t('home.nav.wordOfTheDay', { defaultValue: 'Word of the Day' }),
      route: true,
    },
  ];

  const cockpitSideCards = [
    {
      label: t('home.cockpit.weakSpot.label', { defaultValue: 'WEAK SPOT' }),
      labelZh: t('home.cockpit.weakSpot.labelZh', { defaultValue: '薄弱点' }),
      title: t('home.cockpit.weakSpot.title', { defaultValue: 'Collocations + tense control' }),
      titleZh: t('home.cockpit.weakSpot.titleZh', { defaultValue: '搭配使用 + 时态控制' }),
      detail: t('home.cockpit.weakSpot.detail', { defaultValue: 'Next drill: repair sentence glue before new vocab.' }),
      detailZh: t('home.cockpit.weakSpot.detailZh', { defaultValue: '下一练习：先修正句子连接，再进新词。' }),
      icon: Brain,
    },
    {
      label: t('home.cockpit.examBoost.label', { defaultValue: 'EXAM BOOST' }),
      labelZh: t('home.cockpit.examBoost.labelZh', { defaultValue: '提分重点' }),
      title: t('home.cockpit.examBoost.title', { defaultValue: 'Band 6.0 writing focus' }),
      titleZh: t('home.cockpit.examBoost.titleZh', { defaultValue: 'Band 6.0 写作突破' }),
      detail: t('home.cockpit.examBoost.detail', { defaultValue: 'Coach prompt: one body paragraph with structure scoring.' }),
      detailZh: t('home.cockpit.examBoost.detailZh', { defaultValue: '教练任务：完成一段主体段并获取结构评分。' }),
      icon: Trophy,
    },
  ];

  const outcomeCards = [
    {
      icon: Target,
      label: t('home.outcomes.cards.nextAction.label', { defaultValue: 'Outcome 01' }),
      title: t('home.outcomes.cards.nextAction.title', { defaultValue: 'Know your next best action' }),
      titleZh: t('home.outcomes.cards.nextAction.titleZh', { defaultValue: '随时知道最值得做的下一步' }),
      detail: t('home.outcomes.cards.nextAction.detail', {
        defaultValue: 'Every session resolves into one clear move, not five floating AI suggestions.',
      }),
      detailZh: t('home.outcomes.cards.nextAction.detailZh', {
        defaultValue: '每次学习都落到一个明确动作，而不是五个飘在空中的 AI 建议。',
      }),
    },
    {
      icon: Brain,
      label: t('home.outcomes.cards.weakSpot.label', { defaultValue: 'Outcome 02' }),
      title: t('home.outcomes.cards.weakSpot.title', { defaultValue: 'Turn weak spots into drills' }),
      titleZh: t('home.outcomes.cards.weakSpot.titleZh', { defaultValue: '把薄弱点直接变成训练题' }),
      detail: t('home.outcomes.cards.weakSpot.detail', {
        defaultValue: 'Grammar leaks, collocations, and IELTS gaps reappear as practice instead of getting buried.',
      }),
      detailZh: t('home.outcomes.cards.weakSpot.detailZh', {
        defaultValue: '语法漏洞、固定搭配和 IELTS 短板会被持续拉回训练，而不是埋进历史记录。',
      }),
    },
    {
      icon: Sparkles,
      label: t('home.outcomes.cards.feedback.label', { defaultValue: 'Outcome 03' }),
      title: t('home.outcomes.cards.feedback.title', { defaultValue: 'Get fast, structured feedback' }),
      titleZh: t('home.outcomes.cards.feedback.titleZh', { defaultValue: '拿到快速而结构化的反馈' }),
      detail: t('home.outcomes.cards.feedback.detail', {
        defaultValue: 'Feedback arrives with priorities, not generic encouragement or one-off corrections.',
      }),
      detailZh: t('home.outcomes.cards.feedback.detailZh', {
        defaultValue: '反馈会带着优先级到来，而不是泛泛鼓励或一次性的零散纠错。',
      }),
    },
  ];

  const freeFeatures = [
    {
      title: t('home.membership.free.features.dailyMission.title', { defaultValue: 'Daily mission' }),
      titleZh: t('home.membership.free.features.dailyMission.titleZh', { defaultValue: '每日主线任务' }),
    },
    {
      title: t('home.membership.free.features.coreQuiz.title', { defaultValue: 'Core quiz' }),
      titleZh: t('home.membership.free.features.coreQuiz.titleZh', { defaultValue: '核心测验练习' }),
    },
    {
      title: t('home.membership.free.features.smartReview.title', { defaultValue: 'Smart review queue' }),
      titleZh: t('home.membership.free.features.smartReview.titleZh', { defaultValue: '智能复习队列' }),
    },
    {
      title: t('home.membership.free.features.wordOfDay.title', { defaultValue: 'Word of the Day' }),
      titleZh: t('home.membership.free.features.wordOfDay.titleZh', { defaultValue: '每日单词精选' }),
    },
  ];

  const proFeatures = [
    {
      title: t('home.membership.pro.features.feedback.title', { defaultValue: 'Deep AI feedback' }),
      titleZh: t('home.membership.pro.features.feedback.titleZh', { defaultValue: '更深入的 AI 反馈' }),
    },
    {
      title: t('home.membership.pro.features.writingCoach.title', { defaultValue: 'Writing coach workflows' }),
      titleZh: t('home.membership.pro.features.writingCoach.titleZh', { defaultValue: '写作教练工作流' }),
    },
    {
      title: t('home.membership.pro.features.examCockpit.title', { defaultValue: 'Full IELTS cockpit' }),
      titleZh: t('home.membership.pro.features.examCockpit.titleZh', { defaultValue: '完整 IELTS 学习驾驶舱' }),
    },
    {
      title: t('home.membership.pro.features.weakSpot.title', { defaultValue: 'Weak-spot drill generation' }),
      titleZh: t('home.membership.pro.features.weakSpot.titleZh', { defaultValue: '自动生成薄弱点训练' }),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* STEP 1: Navbar */}
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all duration-300',
          isScrolled &&
            'border-border/70 bg-background/92 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.55)] dark:shadow-[0_22px_56px_-34px_rgba(2,6,23,0.92)]',
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-20 items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_18px_40px_-22px_rgba(16,185,129,0.95)]">
                <BookOpen className="size-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                  {t('home.brand.name', { defaultValue: 'VocabDaily' })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('home.brand.tagline', { defaultValue: 'Learning Cockpit' })}
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-7 lg:flex">
              {navItems.map((item) =>
                item.route ? (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                ),
              )}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-full border border-transparent text-muted-foreground hover:border-emerald-500/25 hover:bg-emerald-500/10 hover:text-foreground"
              >
                <Link to={profilePath} aria-label={t('home.nav.profile', { defaultValue: 'Profile' })}>
                  <Users className="size-5" />
                </Link>
              </Button>
              <Button
                asChild
                className="h-11 rounded-full bg-emerald-500 px-5 text-sm font-semibold text-white shadow-[0_18px_44px_-24px_rgba(16,185,129,0.95)] hover:bg-emerald-600"
              >
                <Link to={continuePath}>{t('home.nav.continueLearning', { defaultValue: 'Continue learning' })}</Link>
              </Button>
            </div>
          </div>

          <div className="pb-3 lg:hidden">
            <nav className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {navItems.map((item) =>
                item.route ? (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="shrink-0 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-emerald-500/35 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    className="shrink-0 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-emerald-500/35 hover:text-foreground"
                  >
                    {item.label}
                  </a>
                ),
              )}
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* STEP 2: Hero */}
        <section ref={heroRef} className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(244,247,245,0.9))] dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.92),rgba(3,7,18,0.98))]"
          />
          <motion.div
            aria-hidden="true"
            style={{ y: glowY }}
            className="absolute inset-y-0 right-0 -z-10 hidden w-[55%] bg-[radial-gradient(circle_at_35%_28%,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_72%_38%,rgba(15,23,42,0.08),transparent_32%)] lg:block dark:bg-[radial-gradient(circle_at_35%_28%,rgba(16,185,129,0.22),transparent_30%),radial-gradient(circle_at_72%_38%,rgba(148,163,184,0.12),transparent_32%)]"
          />
          <div className="mx-auto grid min-h-screen max-w-7xl gap-14 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center lg:px-8 lg:py-16">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 32 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.78, ease }}
              style={{ y: heroCopyY, opacity: heroCopyOpacity }}
              className="max-w-3xl"
            >
              <Badge className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-emerald-700 hover:bg-emerald-500/10 dark:bg-emerald-500/12 dark:text-emerald-300">
                <Sparkles className="size-3.5" />
                {t('home.hero.eyebrow', { defaultValue: 'Learning Cockpit' })}
              </Badge>

              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl dark:text-slate-50">
                {t('home.hero.title', {
                  defaultValue: 'Stop juggling isolated AI features. Start learning through one clear English workflow.',
                })}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
                {t('home.hero.titleZh', {
                  defaultValue: '别再在零散的 AI 功能之间切换，开始沿着一条清晰的英语学习工作流稳定推进。',
                })}
              </p>

              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                {t('home.hero.subtitle', {
                  defaultValue:
                    'VocabDaily turns vocabulary, review, practice, AI coaching, and IELTS prep into one system that keeps your next move visible.',
                })}
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full bg-emerald-500 px-7 text-base font-semibold text-white shadow-[0_24px_56px_-28px_rgba(16,185,129,0.98)] hover:bg-emerald-600"
                >
                  <Link to={primaryCtaPath}>
                    {t('home.hero.cta.primary', { defaultValue: 'Start Free' })}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-14 rounded-full border-border/70 bg-background/70 px-7 text-base font-semibold backdrop-blur-sm hover:bg-card/80"
                >
                  <a href="#workflow">
                    <CirclePlay className="size-4" />
                    {t('home.hero.cta.secondary', { defaultValue: 'Watch 30s Demo' })}
                  </a>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: 34, y: 24 }}
              animate={reduceMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.82, delay: 0.16, ease }}
              style={{ y: mockupY }}
              className="relative mx-auto w-full max-w-2xl"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-[2.25rem] bg-[radial-gradient(circle_at_28%_24%,rgba(16,185,129,0.2),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(15,23,42,0.12),transparent_24%)] blur-3xl dark:bg-[radial-gradient(circle_at_28%_24%,rgba(16,185,129,0.22),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(148,163,184,0.16),transparent_24%)]"
              />

              <motion.div
                animate={reduceMotion ? undefined : { y: [0, -9, 0] }}
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        duration: 6,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'easeInOut',
                      }
                }
                className="relative rounded-[2.25rem] border border-white/55 bg-white/72 p-4 shadow-[0_38px_90px_-46px_rgba(15,23,42,0.58)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72 dark:shadow-[0_38px_90px_-42px_rgba(2,6,23,0.96)] sm:p-5"
              >
                <div className="rounded-[1.8rem] border border-border/70 bg-background/90 p-5 dark:bg-slate-950/72">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">
                        {t('home.hero.mockup.label', { defaultValue: 'Dashboard mockup' })}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-slate-50">
                        {t('home.hero.mockup.title', { defaultValue: 'One cockpit for review, practice, and exam momentum' })}
                      </h2>
                    </div>
                    <Badge variant="outline" className="rounded-full border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300">
                      {t('home.hero.mockup.badge', { defaultValue: 'Preview placeholder' })}
                    </Badge>
                  </div>

                  <Separator className="my-5 bg-border/70" />

                  <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/[0.08] p-4 dark:bg-emerald-500/[0.09]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                            {t('home.hero.mockup.primary.title', { defaultValue: 'Today mission' })}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {t('home.hero.mockup.primary.titleZh', { defaultValue: '今日任务面板' })}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                          {t('home.hero.mockup.primary.progress', { defaultValue: '66%' })}
                        </span>
                      </div>
                      <div className="mt-5 h-2.5 rounded-full bg-emerald-500/15">
                        <div className="h-full w-2/3 rounded-full bg-emerald-500" />
                      </div>
                      <div className="mt-5 space-y-3">
                        {[
                          t('home.hero.mockup.primary.itemOne', { defaultValue: 'Review recall queue' }),
                          t('home.hero.mockup.primary.itemTwo', { defaultValue: 'Repair collocation errors' }),
                          t('home.hero.mockup.primary.itemThree', { defaultValue: 'Draft one IELTS body paragraph' }),
                        ].map((item) => (
                          <div key={item} className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-sm text-muted-foreground">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[1.5rem] border border-border/70 bg-card/80 p-4">
                        <div className="flex items-center gap-3">
                          <Brain className="size-5 text-emerald-500" />
                          <div>
                            <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                              {t('home.hero.mockup.secondary.weakSpot', { defaultValue: 'Weak spot detected' })}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {t('home.hero.mockup.secondary.weakSpotZh', { defaultValue: '系统识别到固定搭配和时态需要回炉' })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-[1.5rem] border border-border/70 bg-card/80 p-4">
                        <div className="flex items-center gap-3">
                          <Sparkles className="size-5 text-emerald-500" />
                          <div>
                            <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                              {t('home.hero.mockup.secondary.coach', { defaultValue: 'AI coach ready' })}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {t('home.hero.mockup.secondary.coachZh', { defaultValue: '下一步建议：30 秒口语热身，再进入写作练习' })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-background/60 p-4">
                        <p className="text-sm font-medium text-slate-950 dark:text-slate-50">
                          {t('home.hero.mockup.secondary.placeholder', { defaultValue: 'Floating dashboard placeholder' })}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t('home.hero.mockup.secondary.placeholderZh', { defaultValue: '这里展示真实学习数据后，主流程依然保持紧凑清晰。' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* STEP 3: Learning Cockpit */}
        <section id="workflow" ref={cockpitRef} className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={cockpitInView ? 'show' : 'hidden'}
              className="rounded-[2rem] border border-border/70 bg-card/85 p-5 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.6)] backdrop-blur-sm dark:bg-card/60 sm:p-8"
            >
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
                <motion.div variants={itemVariants}>
                  <Card className="rounded-[1.75rem] border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] via-card to-card py-0 shadow-none">
                    <CardContent className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <Badge className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-700 hover:bg-emerald-500/10 dark:bg-emerald-500/12 dark:text-emerald-300">
                            {t('home.cockpit.mission.badge', { defaultValue: 'Today mission' })}
                          </Badge>
                          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
                            {t('home.cockpit.mission.title', { defaultValue: 'Finish review, lock collocations, then draft one IELTS paragraph.' })}
                          </h2>
                          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                            {t('home.cockpit.mission.titleZh', { defaultValue: '先完成复习，巩固定搭配，再写出一段 IELTS 主体段。' })}
                          </p>
                        </div>
                        <div className="rounded-3xl border border-emerald-500/20 bg-background/80 px-4 py-3 text-right">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                            {t('home.cockpit.mission.progressLabel', { defaultValue: 'Mission progress' })}
                          </p>
                          <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-emerald-600 dark:text-emerald-400">
                            {t('home.cockpit.mission.progressValue', { defaultValue: '66%' })}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                          <span>{t('home.cockpit.mission.progressCopy', { defaultValue: '8 of 12 guided steps completed' })}</span>
                          <span>{t('home.cockpit.mission.progressCopyZh', { defaultValue: '12 个引导步骤已完成 8 个' })}</span>
                        </div>
                        <Progress
                          value={cockpitInView ? 66 : 0}
                          className="h-3 bg-emerald-500/14 [&_[data-slot=progress-indicator]]:bg-emerald-500"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {[
                          {
                            title: t('home.cockpit.mission.actionOne', { defaultValue: 'Review recall set' }),
                            subtitle: t('home.cockpit.mission.actionOneZh', { defaultValue: '复习回忆组' }),
                          },
                          {
                            title: t('home.cockpit.mission.actionTwo', { defaultValue: 'Collocation repair drill' }),
                            subtitle: t('home.cockpit.mission.actionTwoZh', { defaultValue: '固定搭配修正训练' }),
                          },
                          {
                            title: t('home.cockpit.mission.actionThree', { defaultValue: 'IELTS writing checkpoint' }),
                            subtitle: t('home.cockpit.mission.actionThreeZh', { defaultValue: 'IELTS 写作检查点' }),
                          },
                        ].map((item) => (
                          <div key={item.title} className="rounded-3xl border border-border/70 bg-background/80 p-4">
                            <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{item.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={containerVariants} className="grid gap-5">
                  {cockpitSideCards.map((card) => {
                    const Icon = card.icon;

                    return (
                      <motion.div key={card.label} variants={itemVariants}>
                        <Card className="h-full rounded-[1.75rem] border-border/70 bg-background/85 py-0 shadow-none">
                          <CardContent className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
                                  {card.label}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">{card.labelZh}</p>
                              </div>
                              <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                                <Icon className="size-5" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-slate-50">
                                {card.title}
                              </h3>
                              <p className="mt-2 text-sm text-muted-foreground">{card.titleZh}</p>
                            </div>
                            <Separator className="bg-border/70" />
                            <div>
                              <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{card.detail}</p>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.detailZh}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* STEP 4: Outcomes First */}
        <section id="outcomes" ref={outcomesRef} className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
                {t('home.outcomes.eyebrow', { defaultValue: 'Outcomes First' })}
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl dark:text-slate-50">
                {t('home.outcomes.title', { defaultValue: 'The product should feel like a serious learning cockpit, not a bag of disconnected tools.' })}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                {t('home.outcomes.titleZh', { defaultValue: '产品体验应该像一个严肃的学习驾驶舱，而不是一堆互不相连的功能集合。' })}
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={outcomesInView ? 'show' : 'hidden'}
              className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {outcomeCards.map((card) => {
                const Icon = card.icon;

                return (
                  <motion.div
                    key={card.title}
                    variants={itemVariants}
                    whileHover={reduceMotion ? undefined : { y: -8, scale: 1.05 }}
                    transition={{ duration: 0.22 }}
                  >
                    <Card className="h-full rounded-[1.75rem] border-border/70 bg-card/85 py-0 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.5)]">
                      <CardContent className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
                        <div className="flex items-center justify-between gap-4">
                          <Badge variant="outline" className="rounded-full border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300">
                            {card.label}
                          </Badge>
                          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                            <Icon className="size-6" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-slate-50">
                            {card.title}
                          </h3>
                          <p className="mt-3 text-base leading-7 text-muted-foreground">{card.titleZh}</p>
                        </div>
                        <Separator className="bg-border/70" />
                        <div>
                          <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">{card.detail}</p>
                          <p className="mt-2 text-sm leading-7 text-muted-foreground">{card.detailZh}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* STEP 5: Membership */}
        <section id="membership" ref={membershipRef} className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl dark:text-slate-50">
                {t('home.membership.title', { defaultValue: 'Free should feel useful. Pro should feel decisively more efficient.' })}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                {t('home.membership.titleZh', { defaultValue: '免费版要真的能用，专业版则要在效率和提分路径上明显拉开差距。' })}
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={membershipInView ? 'show' : 'hidden'}
              className="mt-12 grid gap-6 lg:grid-cols-2"
            >
              <motion.div variants={itemVariants}>
                <Card className="h-full rounded-[1.9rem] border-border/70 bg-card/85 py-0 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.45)]">
                  <CardContent className="flex h-full flex-col space-y-6 px-6 py-6">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {t('home.membership.free.name', { defaultValue: 'Free' })}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t('home.membership.free.nameZh', { defaultValue: '免费版' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-5xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-slate-50">
                        {t('home.membership.free.price', { defaultValue: '$0' })}
                      </p>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {t('home.membership.free.priceZh', { defaultValue: '适合先建立稳定学习节奏' })}
                      </p>
                    </div>
                    <Separator className="bg-border/70" />
                    <div className="space-y-4">
                      {freeFeatures.map((feature) => (
                        <div key={feature.title} className="flex gap-3 rounded-3xl border border-border/70 bg-background/70 px-4 py-3">
                          <Check className="mt-0.5 size-4 text-emerald-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-950 dark:text-slate-50">{feature.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{feature.titleZh}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto pt-2">
                      <Button asChild variant="outline" className="h-12 w-full rounded-full text-sm font-semibold">
                        <Link to={primaryCtaPath}>
                          {isAuthenticated
                            ? t('home.membership.free.cta.authenticated', { defaultValue: 'Open cockpit' })
                            : t('home.membership.free.cta.guest', { defaultValue: 'Start Free' })}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="h-full rounded-[1.9rem] border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.12] via-card to-card py-0 shadow-[0_34px_84px_-46px_rgba(16,185,129,0.28)]">
                  <CardContent className="flex h-full flex-col space-y-6 px-6 py-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
                          {t('home.membership.pro.name', { defaultValue: 'Pro' })}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {t('home.membership.pro.nameZh', { defaultValue: '专业版' })}
                        </p>
                      </div>
                      <Badge className="rounded-full bg-emerald-500 px-3 py-1 text-white hover:bg-emerald-500">
                        <Trophy className="size-3.5" />
                        {t('home.membership.pro.badge', { defaultValue: 'Best for serious learners' })}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-5xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-slate-50">
                        {t('home.membership.pro.price', { defaultValue: '$9.99' })}
                      </p>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {t('home.membership.pro.priceZh', { defaultValue: '适合想把时间真正花在高价值训练上的学习者' })}
                      </p>
                    </div>
                    <Separator className="bg-emerald-500/20" />
                    <div className="space-y-4">
                      {proFeatures.map((feature) => (
                        <div key={feature.title} className="flex gap-3 rounded-3xl border border-emerald-500/20 bg-background/75 px-4 py-3">
                          <Check className="mt-0.5 size-4 text-emerald-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-950 dark:text-slate-50">{feature.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{feature.titleZh}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto pt-2">
                      <Button asChild className="h-12 w-full rounded-full bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600">
                        <Link to={upgradePath}>
                          {t('home.membership.pro.cta', { defaultValue: 'Upgrade' })}
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* STEP 6: Footer CTA */}
        <section className="px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pb-24">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-[2rem] border border-border/70 bg-card/85 px-6 py-10 text-center shadow-[0_28px_70px_-48px_rgba(15,23,42,0.45)] sm:px-10">
              <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                <Trophy className="size-4" />
                {t('home.footer.eyebrow', { defaultValue: 'Final CTA' })}
              </div>
              <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-slate-50">
                {t('home.footer.title', { defaultValue: 'Ready to stop juggling and start mastering English?' })}
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">
                {t('home.footer.titleZh', { defaultValue: '准备好告别来回切换，把英语学习真正变成可持续进步的系统了吗？' })}
              </p>
              <Separator className="mx-auto my-8 max-w-xl bg-border/70" />
              <Button
                asChild
                size="lg"
                className="h-14 rounded-full bg-emerald-500 px-8 text-base font-semibold text-white shadow-[0_24px_56px_-28px_rgba(16,185,129,0.95)] hover:bg-emerald-600"
              >
                <Link to={primaryCtaPath}>
                  {isAuthenticated
                    ? t('home.footer.cta.authenticated', { defaultValue: 'Continue learning' })
                    : t('home.footer.cta.guest', { defaultValue: 'Start Free' })}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

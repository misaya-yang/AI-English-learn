// PREMIUM MINIMAL VERSION
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, Check, CirclePlay, Sparkles, Target, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthRedirect } from '@/lib/authRedirect';
import { cn } from '@/lib/utils';

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  const continuePath = isAuthenticated ? '/dashboard/today' : buildAuthRedirect('/dashboard/today');
  const primaryCtaPath = isAuthenticated ? continuePath : '/register';
  const upgradePath = '/pricing';

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans tracking-tight text-neutral-950 selection:bg-emerald-500/30 dark:bg-neutral-950 dark:text-neutral-50">
      {/* 1. Sticky Navbar */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          isScrolled
            ? 'border-b border-neutral-200/50 bg-white/70 backdrop-blur-xl dark:border-neutral-800/50 dark:bg-neutral-950/70'
            : 'bg-transparent py-4'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm transition-transform group-hover:scale-105">
              <BookOpen className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-none tracking-tight">VocabDaily</span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Learning Cockpit
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {['Outcomes', 'Workflow', 'Membership'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
              >
                {t(`home.nav.${item.toLowerCase()}`, { defaultValue: item })}
              </a>
            ))}
            <Link
              to="/word-of-the-day"
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
            >
              {t('home.nav.wordOfTheDay', { defaultValue: 'Word of the Day' })}
            </Link>
          </nav>

          <Button
            asChild
            className="rounded-full bg-emerald-500 px-6 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:bg-emerald-600 hover:shadow-lg dark:shadow-emerald-900/20"
          >
            <Link to={continuePath}>{t('home.nav.continueLearning', { defaultValue: 'Continue learning' })}</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* 2. Full-viewport Hero */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/50 via-neutral-50 to-neutral-50 dark:from-emerald-950/20 dark:via-neutral-950 dark:to-neutral-950" />
          
          <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <motion.div
              style={{ y: heroY, opacity: heroOpacity }}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex flex-col justify-center pt-10 lg:pt-0"
            >
              <motion.h1 
                variants={fadeUpVariants}
                className="text-[4rem] font-bold leading-[0.9] tracking-tighter text-neutral-950 md:text-[5.5rem] lg:text-[6.5rem] dark:text-neutral-50"
              >
                {t('home.hero.title', { defaultValue: 'Stop juggling isolated AI features.' })}
                <span className="block text-neutral-400 dark:text-neutral-600">
                  {t('home.hero.titleSuffix', { defaultValue: 'Start learning.' })}
                </span>
              </motion.h1>

              <motion.p 
                variants={fadeUpVariants}
                className="mt-8 max-w-xl text-xl font-light leading-relaxed text-neutral-600 dark:text-neutral-400"
              >
                {t('home.hero.subtitleZh', { defaultValue: '沿着一条清晰的学习工作流稳定推进，别被零散的工具分散注意力。' })}
              </motion.p>

              <motion.div variants={fadeUpVariants} className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full bg-emerald-500 px-8 text-lg font-medium text-white shadow-[0_8px_30px_rgb(16,185,129,0.3)] transition-all hover:scale-105 hover:bg-emerald-600 hover:shadow-[0_8px_40px_rgb(16,185,129,0.4)]"
                >
                  <Link to={primaryCtaPath}>
                    {t('home.hero.cta.primary', { defaultValue: 'Start Free' })}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-14 rounded-full px-8 text-lg font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
                >
                  <a href="#workflow">
                    <CirclePlay className="mr-2 size-5" />
                    {t('home.hero.cta.secondary', { defaultValue: 'Watch Demo' })}
                  </a>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden items-center lg:flex"
            >
              <div className="relative aspect-square w-full rounded-[2.5rem] border border-white/40 bg-white/20 p-2 shadow-2xl shadow-emerald-900/5 backdrop-blur-3xl dark:border-white/10 dark:bg-neutral-900/40 dark:shadow-emerald-900/20">
                <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-emerald-500/10 blur-[80px]" />
                <div className="h-full w-full rounded-[2rem] border border-neutral-200/50 bg-white/80 p-8 shadow-inner dark:border-neutral-800/50 dark:bg-neutral-950/80">
                  <div className="flex h-full flex-col gap-6">
                    <div className="h-10 w-1/3 rounded-full bg-neutral-100 dark:bg-neutral-900" />
                    <div className="h-40 w-full rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-6">
                       <div className="mb-4 h-6 w-1/2 rounded-full bg-emerald-500/20" />
                       <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-emerald-500/10">
                         <div className="h-full w-2/3 rounded-full bg-emerald-500" />
                       </div>
                       <div className="h-12 w-full rounded-xl bg-white/50 backdrop-blur dark:bg-black/50" />
                    </div>
                    <div className="grid flex-1 grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-neutral-100/80 p-5 dark:bg-neutral-900/80">
                         <div className="mb-4 size-10 rounded-full bg-emerald-500/10" />
                         <div className="h-4 w-3/4 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                      </div>
                      <div className="rounded-2xl bg-neutral-100/80 p-5 dark:bg-neutral-900/80">
                         <div className="mb-4 size-10 rounded-full bg-indigo-500/10" />
                         <div className="h-4 w-2/3 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 3. Learning Cockpit */}
        <section id="workflow" className="px-6 py-32 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid gap-6 lg:grid-cols-[1.5fr_1fr]"
            >
              <motion.div variants={fadeUpVariants}>
                <div className="flex h-full flex-col justify-between rounded-[2rem] border border-neutral-200/60 bg-white/60 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/40">
                  <div>
                    <h3 className="text-3xl font-semibold tracking-tight">
                      {t('home.cockpit.mission.title', { defaultValue: 'Today mission' })}
                    </h3>
                    <div className="mt-8 flex items-center gap-6">
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "66%" }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                          className="h-full rounded-full bg-emerald-500" 
                        />
                      </div>
                      <span className="text-2xl font-bold text-emerald-500">66%</span>
                    </div>
                  </div>
                  
                  <div className="mt-12 flex flex-col gap-4">
                    {[
                      t('home.cockpit.mission.actionOne', { defaultValue: 'Review recall set' }),
                      t('home.cockpit.mission.actionTwo', { defaultValue: 'Collocation repair drill' }),
                      t('home.cockpit.mission.actionThree', { defaultValue: 'IELTS writing checkpoint' })
                    ].map((task, i) => (
                      <div key={i} className="flex items-center gap-4 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-950/50">
                        <div className={`size-6 rounded-full border-2 ${i < 2 ? 'border-emerald-500 bg-emerald-500/20' : 'border-neutral-300 dark:border-neutral-700'}`} />
                        <span className="text-lg font-medium text-neutral-700 dark:text-neutral-300">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <div className="flex flex-col gap-6">
                {[
                  {
                    icon: Brain,
                    title: t('home.cockpit.weakSpot.title', { defaultValue: 'Collocations + tense control' }),
                    subtitle: t('home.cockpit.weakSpot.titleZh', { defaultValue: '搭配使用 + 时态控制' }),
                  },
                  {
                    icon: Trophy,
                    title: t('home.cockpit.examBoost.title', { defaultValue: 'Band 6.0 writing focus' }),
                    subtitle: t('home.cockpit.examBoost.titleZh', { defaultValue: '写作突破评分指导' }),
                  }
                ].map((card, i) => (
                  <motion.div key={i} variants={fadeUpVariants} className="h-full">
                    <div className="group flex h-full flex-col justify-center rounded-[2rem] border border-neutral-200/60 bg-white/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all hover:scale-[1.03] hover:shadow-2xl hover:shadow-emerald-900/10 dark:border-neutral-800/60 dark:bg-neutral-900/40">
                      <card.icon className="mb-6 size-10 text-emerald-500 transition-transform group-hover:scale-110 group-hover:text-emerald-400" />
                      <h4 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">{card.title}</h4>
                      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{card.subtitle}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* 4. Outcomes First */}
        <section id="outcomes" className="bg-white px-6 py-32 dark:bg-neutral-950 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">
                Outcomes First
              </span>
              <h2 className="mt-6 text-5xl font-bold tracking-tight md:text-6xl">
                {t('home.outcomes.title', { defaultValue: 'One cockpit. Real results.' })}
              </h2>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="mt-24 grid gap-8 md:grid-cols-3"
            >
              {[
                {
                  icon: Target,
                  title: t('home.outcomes.cards.nextAction.title', { defaultValue: 'Clear next action' }),
                  titleZh: t('home.outcomes.cards.nextAction.titleZh', { defaultValue: '知道该做什么' }),
                  detail: t('home.outcomes.cards.nextAction.detail', { defaultValue: 'Always know your exact next step to progress.' }),
                },
                {
                  icon: Brain,
                  title: t('home.outcomes.cards.weakSpot.title', { defaultValue: 'Turn weak spots into drills' }),
                  titleZh: t('home.outcomes.cards.weakSpot.titleZh', { defaultValue: '短板变成肌肉' }),
                  detail: t('home.outcomes.cards.weakSpot.detail', { defaultValue: 'Grammar leaks reappear as practice.' }),
                },
                {
                  icon: Sparkles,
                  title: t('home.outcomes.cards.feedback.title', { defaultValue: 'Fast, structured feedback' }),
                  titleZh: t('home.outcomes.cards.feedback.titleZh', { defaultValue: '结构化的反馈' }),
                  detail: t('home.outcomes.cards.feedback.detail', { defaultValue: 'Prioritized corrections, not just generic tips.' }),
                }
              ].map((card, i) => (
                <motion.div 
                  key={i} 
                  variants={fadeUpVariants}
                  className="group rounded-[2rem] p-8 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                >
                  <card.icon className="mb-8 size-12 text-neutral-900 transition-colors group-hover:text-emerald-500 dark:text-neutral-100" />
                  <h3 className="text-2xl font-semibold">{card.title}</h3>
                  <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">{card.titleZh}</p>
                  <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">{card.detail}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 5. Membership */}
        <section id="membership" className="px-6 py-32 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid gap-12 md:grid-cols-2 lg:gap-24"
            >
              <motion.div variants={fadeUpVariants} className="flex flex-col pt-8">
                <span className="text-xl font-medium text-neutral-500">Free</span>
                <span className="mt-2 text-5xl font-bold">$0</span>
                <div className="mt-12 flex flex-1 flex-col gap-6">
                  {[
                    t('home.membership.free.features.dailyMission.title', { defaultValue: 'Daily mission' }),
                    t('home.membership.free.features.coreQuiz.title', { defaultValue: 'Core quiz' }),
                    t('home.membership.free.features.smartReview.title', { defaultValue: 'Smart review queue' })
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Check className="size-5 text-neutral-400" />
                      <span className="text-lg text-neutral-700 dark:text-neutral-300">{feat}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={fadeUpVariants} className="relative flex flex-col rounded-[2.5rem] border border-neutral-800 bg-neutral-950 p-10 text-white shadow-2xl dark:bg-neutral-900">
                <div className="absolute -top-4 left-10 rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/30">
                  Best for serious learners
                </div>
                <span className="text-xl font-medium text-neutral-400">Pro</span>
                <span className="mt-2 text-5xl font-bold">$9.99<span className="text-xl font-normal text-neutral-500">/mo</span></span>
                <div className="mt-12 flex flex-1 flex-col gap-6">
                  {[
                    t('home.membership.pro.features.feedback.title', { defaultValue: 'Deep AI feedback' }),
                    t('home.membership.pro.features.writingCoach.title', { defaultValue: 'Writing coach workflows' }),
                    t('home.membership.pro.features.examCockpit.title', { defaultValue: 'Full IELTS cockpit' })
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Check className="size-5 text-emerald-400" />
                      <span className="text-lg text-neutral-200">{feat}</span>
                    </div>
                  ))}
                </div>
                <Button asChild className="mt-12 h-14 w-full rounded-full bg-emerald-500 text-lg font-semibold hover:bg-emerald-600">
                  <Link to={upgradePath}>Upgrade to Pro</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 6. Final tiny footer CTA */}
        <section className="py-32 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-8"
          >
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {t('home.footer.title', { defaultValue: 'Ready to master English with clarity?' })}
            </h2>
            <Button asChild className="h-12 rounded-full bg-emerald-500 px-8 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:bg-emerald-600">
              <Link to={primaryCtaPath}>
                {t('home.footer.cta.guest', { defaultValue: 'Start Free' })} <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

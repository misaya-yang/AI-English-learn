import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, Check, CirclePlay, Menu, Sparkles, Target, CalendarDays, MessageCircleMore, WandSparkles, X, Route, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthRedirect } from '@/lib/authRedirect';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Spotlight } from '@/components/ui/spotlight';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';

const chatMessages = [
  { role: 'user' as const, text: 'How do I use "nevertheless" naturally?' },
  { role: 'ai' as const, text: '"Nevertheless" signals contrast despite expectations. Try: "The exam was tough; nevertheless, she passed with flying colors." It\'s more formal than "but" — perfect for IELTS writing.' },
  { role: 'user' as const, text: 'Can you give me a practice sentence?' },
  { role: 'ai' as const, text: 'Fill in: "The weather was terrible. ___, we decided to go hiking." Great — you\'re building academic register!' },
];

function AIChatDemo() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= chatMessages.length) return;
    const delay = visibleCount === 0 ? 800 : 1600;
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), delay);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  // Loop the animation
  useEffect(() => {
    if (visibleCount < chatMessages.length) return;
    const timer = setTimeout(() => setVisibleCount(0), 4000);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-black/5 dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl shadow-card dark:shadow-glass p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/[0.06]">
          <div className="flex size-6 items-center justify-center rounded-lg bg-emerald-500/10">
            <Bot className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">AI Coach</span>
          <span className="ml-auto flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <div className="space-y-2.5 min-h-[180px] sm:min-h-[200px]">
          <AnimatePresence mode="wait">
            {chatMessages.slice(0, visibleCount).map((msg, i) => (
              <motion.div
                key={`${visibleCount}-${i}`}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: [0, 0, 0, 1] }}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                    <Bot className="size-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
                <div
                  className={`rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
                      : 'bg-black/[0.03] dark:bg-white/[0.05] text-slate-700 dark:text-neutral-300'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.role === 'user' && (
                  <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-white/10">
                    <User className="size-3 text-slate-600 dark:text-neutral-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {visibleCount < chatMessages.length && visibleCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 items-center"
            >
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                <Bot className="size-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex gap-1 px-3 py-2">
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    className="size-1.5 rounded-full bg-emerald-500/50"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: dot * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const continuePath = isAuthenticated ? '/dashboard/today' : buildAuthRedirect('/dashboard/today');
  const primaryCtaPath = isAuthenticated ? continuePath : '/register';
  const upgradePath = '/pricing';

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape key or scroll
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileMenuOpen(false); };
    const handleScroll = () => setMobileMenuOpen(false);
    window.addEventListener('keydown', handleEsc);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mobileMenuOpen]);

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  return (
    <div className="noise-bg bg-grid min-h-screen bg-slate-50 dark:bg-black font-sans tracking-tight text-slate-900 dark:text-white selection:bg-emerald-500/30">
      {/* 1. Floating Pill Navbar */}
      <div className="fixed inset-x-0 top-6 z-50 flex justify-center px-6 pointer-events-none">
        <header
          className={cn(
            'pointer-events-auto flex h-14 w-full max-w-4xl items-center justify-between rounded-full border px-4 transition-all duration-500',
            isScrolled
              ? 'border-white/[0.08] bg-black/60 shadow-glass backdrop-blur-3xl'
              : 'border-transparent bg-transparent'
          )}
        >
          <Link to="/" className="group flex items-center gap-2.5 pl-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 ring-1 ring-emerald-500/20 transition-all group-hover:bg-emerald-500/20 group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
              <BookOpen className="size-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">VocabDaily</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {['Outcomes', 'Workflow', 'Membership'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-xs font-semibold uppercase tracking-widest text-neutral-400 transition-colors hover:text-white"
              >
                {t(`home.nav.${item.toLowerCase()}`, { defaultValue: item })}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>

            <Link
              to="/word-of-the-day"
              className="hidden text-xs font-semibold text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors sm:block"
            >
              {t('home.nav.wordOfTheDay', { defaultValue: 'Word of the Day' })}
            </Link>
            <Button
              asChild
              size="sm"
              className="hidden sm:inline-flex h-9 rounded-full bg-black text-white dark:bg-white px-5 text-xs font-bold dark:text-black transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] ml-2"
            >
              <Link to={continuePath}>{t('home.nav.continueLearning', { defaultValue: 'Continue' })}</Link>
            </Button>
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-black/10 dark:border-white/10 text-slate-700 dark:text-white transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </header>
        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto mt-2 w-full max-w-4xl rounded-2xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-black/90 backdrop-blur-2xl p-4 shadow-lg"
          >
            <div className="flex flex-col gap-2">
              {['Outcomes', 'Workflow', 'Membership'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-white/80 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                >
                  {t(`home.nav.${item.toLowerCase()}`, { defaultValue: item })}
                </a>
              ))}
              <div className="my-1 h-px bg-black/5 dark:bg-white/10" />
              <Link
                to="/word-of-the-day"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-white/80 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              >
                {t('home.nav.wordOfTheDay', { defaultValue: 'Word of the Day' })}
              </Link>
              <Link
                to={continuePath}
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-emerald-500"
              >
                {t('home.nav.continueLearning', { defaultValue: 'Continue' })}
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      <main>
        {/* 2. Full-viewport Hero */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden pb-16 pt-28 sm:pb-32 lg:pb-40 lg:pt-40">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="hsl(161 84% 40% / 0.4)"
          />
          <motion.div style={{ scale: bgScale, opacity: bgOpacity, y: heroY }} className="absolute inset-0 -z-10 pointer-events-none">
            <img src="/hero_bg_light.png" alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 opacity-80 dark:opacity-0 mask-radial-fade" />
            <img src="/hero_bg_dark.png" alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 opacity-0 dark:opacity-70 mask-radial-fade" />
            <div className="absolute inset-0 bg-slate-50/30 dark:bg-black/40 backdrop-blur-[2px] mask-radial-fade" />
          </motion.div>

          <div className="mx-auto flex max-w-[90rem] flex-col items-center px-6 lg:px-8">
            <motion.div
              style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex flex-col items-center text-center"
            >
              <motion.div variants={fadeUpVariants} className="mb-8 hidden sm:flex">
                <div className="rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-1.5 text-sm font-semibold text-slate-700 dark:text-neutral-300 backdrop-blur-md shadow-sm transition-all hover:bg-white dark:hover:bg-white/10 hover:-translate-y-0.5 cursor-pointer flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {t('home.hero.badge', { defaultValue: '✨ VocabDaily 2.0 is now live' })}
                  <span className="ml-1 text-slate-400 dark:text-neutral-500">-&gt;</span>
                </div>
              </motion.div>

              <motion.h1
                variants={fadeUpVariants}
                className="mx-auto max-w-4xl text-[2rem] font-semibold leading-[1.15] tracking-tight text-slate-900 dark:text-white sm:text-[3rem] md:text-[5.5rem] lg:text-[6rem]"
              >
                <span className="bg-gradient-to-b from-slate-900 to-slate-500 dark:from-white dark:to-white/50 bg-clip-text text-transparent pb-1">Stop juggling AI tools.</span>
                <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-300 dark:to-teal-200 bg-clip-text text-transparent pb-1 pr-2 sm:ml-0 md:ml-3">
                  Start learning.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUpVariants}
                className="mt-8 max-w-2xl text-lg font-normal leading-relaxed text-slate-500 dark:text-neutral-400 sm:text-xl"
              >
                {t('home.hero.subtitleZh', { defaultValue: '沿着一条清晰的学习工作流稳定推进，别被零散的工具分散注意力。' })}
              </motion.p>

              <motion.div variants={fadeUpVariants} className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full bg-white px-10 text-lg font-bold text-black shadow-[0_0_40px_rgba(255,255,255,0.1),inset_0_2px_4px_rgba(255,255,255,0.8)] transition-all hover:scale-105 hover:bg-neutral-200"
                >
                  <Link to={primaryCtaPath}>
                    {t('home.hero.cta.primary', { defaultValue: 'Start Free' })}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-14 rounded-full border border-white/5 bg-white/[0.02] px-8 text-lg font-medium text-neutral-300 hover:bg-white/[0.08] hover:border-white/10 transition-colors backdrop-blur-md"
                >
                  <Link to="/word-of-the-day">
                    <CirclePlay className="mr-2 size-5 text-neutral-400" />
                    {t('home.hero.cta.secondary', { defaultValue: 'Try It Free' })}
                  </Link>
                </Button>
                <div className="mt-4 sm:mt-0 sm:ml-4 text-xs font-medium text-neutral-500 uppercase tracking-widest hidden lg:block">
                  No credit card required.
                </div>
              </motion.div>

              {/* AI Chat Demo Animation */}
              <motion.div
                variants={fadeUpVariants}
                className="mt-16 w-full max-w-lg"
              >
                <AIChatDemo />
              </motion.div>
            </motion.div>
          </div>
        </section>


        {/* 3. Outcomes First - Vercel Style Grid */}
        <section id="outcomes" className="relative border-t border-black/5 dark:border-white/5 px-6 py-16 md:py-24 lg:py-32 lg:px-8">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--grid-line-color))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--grid-line-color))_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="mx-auto max-w-7xl relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center"
            >
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500">
                Outcomes First
              </span>
              <h2 className="mt-6 text-[2rem] font-bold leading-[1.1] tracking-tighter sm:text-[3rem] md:text-[4.5rem] lg:text-[5.5rem]">
                One cockpit. Real results.
              </h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {[
                {
                  icon: Target,
                  title: t('home.outcomes.cards.nextAction.title', { defaultValue: 'Clear next action' }),
                  detail: t('home.outcomes.cards.nextAction.titleZh', { defaultValue: '知道该做什么' }),
                },
                {
                  icon: Brain,
                  title: t('home.outcomes.cards.weakSpot.title', { defaultValue: 'Turn weak spots into drills' }),
                  detail: t('home.outcomes.cards.weakSpot.titleZh', { defaultValue: '短板变成肌肉' }),
                },
                {
                  icon: Sparkles,
                  title: t('home.outcomes.cards.feedback.title', { defaultValue: 'Fast, structured feedback' }),
                  detail: t('home.outcomes.cards.feedback.titleZh', { defaultValue: '结构化的反馈' }),
                },
                {
                  icon: Route,
                  title: t('home.outcomes.cards.path.title', { defaultValue: 'Personalized learning path' }),
                  detail: t('home.outcomes.cards.path.titleZh', { defaultValue: 'AI 定制你的专属路线' }),
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  variants={fadeUpVariants}
                  className="group relative overflow-hidden rounded-2xl border border-black/5 dark:border-white/[0.04] bg-black/[0.02] dark:bg-white/[0.01] p-10 lg:p-14 transition-all duration-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.03] hover:-translate-y-1"
                >
                  <div className="absolute top-8 right-8 text-xs font-mono text-black/10 dark:text-white/[0.1] font-bold tracking-widest group-hover:text-black/20 dark:group-hover:text-white/[0.2] transition-colors">{`0${i + 1}`}</div>
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/[0.1] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.05),transparent_50%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="mb-10 flex size-12 items-center justify-center rounded-xl bg-white dark:bg-black/50 border border-black/5 dark:border-white/[0.05] shadow-sm dark:shadow-[inset_0_1px_rgba(255,255,255,0.05)] transition-all duration-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:border-emerald-200 dark:group-hover:border-emerald-500/20 dark:group-hover:shadow-[inset_0_1px_hsl(var(--primary)/0.3)] group-hover:scale-110 origin-left">
                      <card.icon className="size-5 text-slate-500 dark:text-neutral-500 transition-colors duration-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]" strokeWidth={2} />
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-50 transition-colors">{card.title}</h3>
                      <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-neutral-500 group-hover:text-slate-600 dark:group-hover:text-neutral-400 transition-colors">{card.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 4. Workflow – Bento Grid */}
        <section id="workflow" className="relative border-t border-black/5 dark:border-white/5 px-6 py-16 md:py-24 lg:py-32 lg:px-8">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[600px] rounded-full bg-emerald-500/[0.06] blur-[140px]" />
          <div className="mx-auto max-w-7xl relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center"
            >
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500">
                Workflow
              </span>
              <h2 className="mt-6 text-[2rem] font-bold leading-[1.1] tracking-tighter sm:text-[3rem] md:text-[4.5rem] lg:text-[5.5rem]">
                A daily cockpit, not just flashcards.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400">
                {t('home.workflow.subtitle', { defaultValue: '每天登录后，清晰知道该做什么、做完后拿到什么。' })}
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="mt-20 grid auto-rows-[250px] gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {[
                {
                  icon: CalendarDays,
                  title: t('home.workflow.steps.today.title', { defaultValue: 'Today Mission' }),
                  description: t('home.workflow.steps.today.desc', { defaultValue: '每天一个清晰的任务面板。系统根据你的水平、到期复习和弱项自动排优先级。' }),
                  accent: 'from-emerald-500/10 to-transparent',
                  span: 'sm:col-span-2 lg:col-span-2 lg:row-span-2',
                },
                {
                  icon: Brain,
                  title: t('home.workflow.steps.review.title', { defaultValue: 'Spaced Review' }),
                  description: t('home.workflow.steps.review.desc', { defaultValue: '到期复习卡自动浮出。先回忆，再打分。间隔算法帮你用最少的重复量维持记忆。' }),
                  accent: 'from-cyan-500/10 to-transparent',
                  span: 'sm:col-span-1 lg:col-span-1 lg:row-span-1',
                },
                {
                  icon: WandSparkles,
                  title: t('home.workflow.steps.practice.title', { defaultValue: 'Targeted Practice' }),
                  description: t('home.workflow.steps.practice.desc', { defaultValue: '选择题、填空、听辨、写作——根据弱项自动推荐最该做的练习模式。' }),
                  accent: 'from-violet-500/10 to-transparent',
                  span: 'sm:col-span-1 lg:col-span-1 lg:row-span-1',
                },
                {
                  icon: MessageCircleMore,
                  title: t('home.workflow.steps.coach.title', { defaultValue: 'AI Coach' }),
                  description: t('home.workflow.steps.coach.desc', { defaultValue: '带上下文的引导对话。不是通用聊天——AI 记住你的词书、弱项和学习历史。' }),
                  accent: 'from-amber-500/10 to-transparent',
                  span: 'sm:col-span-2 lg:col-span-2 lg:row-span-1',
                },
                {
                  icon: Target,
                  title: t('home.workflow.steps.exam.title', { defaultValue: 'Exam Prep' }),
                  description: t('home.workflow.steps.exam.desc', { defaultValue: 'IELTS 冲分工作台。结构化写作评分、仿真题和个性化冲分路线。' }),
                  accent: 'from-rose-500/10 to-transparent',
                  span: 'sm:col-span-1 lg:col-span-1 lg:row-span-1',
                },
                {
                  icon: Sparkles,
                  title: t('home.workflow.steps.analytics.title', { defaultValue: 'Real Analytics' }),
                  description: t('home.workflow.steps.analytics.desc', { defaultValue: '不是随机生成的好看图表。真实的学习数据——你到底在进步还是在原地踏步。' }),
                  accent: 'from-emerald-500/10 to-transparent',
                  span: 'sm:col-span-1 lg:col-span-1 lg:row-span-1',
                },
              ].map((step, i) => (
                <motion.div variants={fadeUpVariants} key={i} className={step.span}>
                  <CardContainer containerClassName="h-full w-full" className="h-full w-full">
                    <CardBody
                      className="h-full w-full group relative overflow-visible rounded-2xl border border-black/5 dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.01] p-8 glass transition-all duration-500 hover:glass-strong hover:border-black/10 dark:hover:border-white/[0.15] hover:shadow-glass-hover"
                    >
                      <CardItem translateZ="-20" className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-2xl', step.accent)} />
                      <CardItem translateZ="-10" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/[0.15] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      
                      <CardItem translateZ="50" className="relative z-10 w-full">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-slate-500 dark:text-white/50 transition-all duration-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 dark:group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.2)]">
                          <step.icon className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                      </CardItem>
                      <CardItem as="h3" translateZ="30" className="relative z-10 w-full mt-6 text-lg font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-sm transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-50">
                        {step.title}
                      </CardItem>
                      <CardItem as="p" translateZ="20" className="relative z-10 w-full mt-3 text-sm leading-relaxed text-slate-500 dark:text-neutral-400">
                        {step.description}
                      </CardItem>
                    </CardBody>
                  </CardContainer>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 5. Minimal Membership */}
        <section id="membership" className="relative border-t border-black/5 dark:border-white/5 px-6 py-16 md:py-24 lg:py-32 lg:px-8">
          <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 bg-emerald-500/5 blur-[120px]" />
          <div className="mx-auto max-w-5xl relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid gap-8 md:grid-cols-2"
            >
              <motion.div variants={fadeUpVariants} className="flex flex-col rounded-2xl border border-black/5 dark:border-white/[0.06] bg-black/5 dark:bg-black/50 p-10 glass transition-all hover:glass-strong hover-lift group">
                <span className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-neutral-400">Free</span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-6xl font-bold tracking-tighter text-slate-900 dark:text-white">$0</span>
                </div>
                <p className="mt-4 text-sm text-slate-500 dark:text-neutral-500">Perfect for getting started and maintaining a daily habit.</p>
                <div className="mt-12 flex flex-1 flex-col gap-6">
                  {['Daily mission', 'Core quiz', 'Smart review queue'].map((feat, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Check className="size-5 text-slate-400 dark:text-neutral-600" />
                      <span className="text-base font-medium text-slate-700 dark:text-neutral-300">{feat}</span>
                    </div>
                  ))}
                </div>
                <Button asChild variant="outline" className="mt-12 h-14 w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-lg font-semibold text-slate-900 dark:text-white transition-all hover:bg-black/5 dark:hover:bg-white/5">
                  <Link to={primaryCtaPath}>Get Started Free</Link>
                </Button>
              </motion.div>

              <motion.div variants={fadeUpVariants} className="relative flex flex-col rounded-2xl border-conic bg-white dark:bg-black p-10 shadow-glow-emerald-lg hover-lift group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.05] dark:from-emerald-500/[0.08] to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.1),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
                <div className="absolute -top-3 left-10 z-20 rounded-full border border-emerald-500/30 dark:border-emerald-500/50 bg-white dark:bg-black px-4 py-1 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
                  Most Popular
                </div>
                <div className="relative z-10 flex flex-col flex-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Pro Power</span>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-7xl font-extrabold tracking-tighter text-slate-900 dark:text-white drop-shadow-sm">$9</span>
                  <span className="text-xl font-medium text-slate-500 dark:text-neutral-500">.99 / mo</span>
                </div>
                <p className="mt-6 text-sm text-slate-600 dark:text-neutral-400 leading-relaxed max-w-sm">Unlock the full power of AI. Deep feedback, unlimited writing tests, and custom learning paths.</p>
                <div className="mt-12 flex flex-1 flex-col gap-6">
                  {['Deep AI feedback', 'Writing coach workflows', 'Full IELTS cockpit', 'Priority generation'].map((feat, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Check className="size-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-base font-medium text-slate-900 dark:text-white">{feat}</span>
                    </div>
                  ))}
                </div>
                <Button asChild className="mt-12 h-14 w-full rounded-xl bg-black dark:bg-white text-lg font-bold text-white dark:text-black shadow-[0_4px_14px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1),inset_0_2px_4px_rgba(255,255,255,0.8)] transition-all hover:scale-105 hover:bg-slate-800 dark:hover:bg-neutral-200 relative z-10">
                  <Link to={upgradePath}>Upgrade to Pro</Link>
                </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 6. Deep Dark Footer CTA */}
        <section className="border-t border-black/5 dark:border-white/5 py-16 md:py-24 lg:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center px-6"
          >
            <h2 className="max-w-3xl text-[2rem] font-bold leading-tight tracking-tighter text-slate-900 dark:text-white sm:text-[3rem] md:text-[4.5rem]">
              Ready to master English with clarity?
            </h2>
            <Button asChild className="mt-10 h-14 rounded-full border border-emerald-600/50 dark:border-emerald-400/50 bg-emerald-600 dark:bg-emerald-500 px-10 text-lg font-bold text-white shadow-[0_0_30px_hsl(var(--primary)/0.2)] dark:shadow-[0_0_40px_hsl(var(--primary)/0.4),inset_0_2px_4px_rgba(255,255,255,0.4)] transition-all hover:scale-105 hover:bg-emerald-500 dark:hover:bg-emerald-400 dark:hover:shadow-[0_0_60px_hsl(var(--primary)/0.6)]">
              <Link to={primaryCtaPath}>
                {t('home.footer.cta.guest', { defaultValue: 'Start Free' })} <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

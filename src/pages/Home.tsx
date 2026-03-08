import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, Check, CirclePlay, Sparkles, Target } from 'lucide-react';
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
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-black font-sans tracking-tight text-white selection:bg-emerald-500/30">
      {/* 1. Sticky Navbar */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-700',
          isScrolled
            ? 'border-b border-white/5 bg-black/50 backdrop-blur-2xl'
            : 'bg-transparent py-4'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <div className="relative flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 transition-all group-hover:bg-emerald-500/20 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:border-emerald-500/50">
              <BookOpen className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-none tracking-tight text-white">VocabDaily</span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-500">
                Learning Cockpit
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-6 lg:gap-10">
            {['Outcomes', 'Workflow', 'Membership'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-neutral-400 transition-colors hover:text-white"
              >
                {t(`home.nav.${item.toLowerCase()}`, { defaultValue: item })}
              </a>
            ))}
            <Link
              to="/word-of-the-day"
              className="text-sm font-medium text-neutral-400 transition-colors hover:text-white"
            >
              {t('home.nav.wordOfTheDay', { defaultValue: 'Word of the Day' })}
            </Link>
          </nav>

          <Button
            asChild
            className="rounded-full bg-white px-6 text-sm font-semibold text-black transition-all hover:scale-105 hover:bg-neutral-200"
          >
            <Link to={continuePath}>{t('home.nav.continueLearning', { defaultValue: 'Continue learning' })}</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* 2. Full-viewport Hero */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden pb-40 pt-32 lg:pt-40">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/40 via-black to-black" />
          <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

          <div className="mx-auto flex max-w-[90rem] flex-col items-center px-6 lg:px-8">
            <motion.div
              style={{ y: heroY, opacity: heroOpacity }}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex flex-col items-center text-center"
            >
              <motion.div variants={fadeUpVariants} className="mb-8 hidden sm:flex">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-neutral-300 backdrop-blur-md">
                  <span className="mr-2 inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t('home.hero.badge', { defaultValue: 'VocabDaily 2.0 is now live' })}
                </div>
              </motion.div>

              <motion.h1
                variants={fadeUpVariants}
                className="max-w-[70rem] text-[4rem] font-bold leading-[0.95] tracking-tighter text-white sm:text-[6rem] md:text-[7.5rem] lg:text-[8.5rem]"
              >
                <span className="bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">Stop juggling AI tools.</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">Start learning.</span>
              </motion.h1>

              <motion.p
                variants={fadeUpVariants}
                className="mt-8 max-w-2xl text-xl font-light leading-relaxed text-neutral-400 sm:text-2xl"
              >
                {t('home.hero.subtitleZh', { defaultValue: '沿着一条清晰的学习工作流稳定推进，别被零散的工具分散注意力。' })}
              </motion.p>

              <motion.div variants={fadeUpVariants} className="mt-14 flex flex-col items-center gap-6 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full bg-white px-10 text-lg font-semibold text-black shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all hover:scale-105 hover:bg-neutral-200"
                >
                  <Link to={primaryCtaPath}>
                    {t('home.hero.cta.primary', { defaultValue: 'Start Free' })}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-14 rounded-full border border-white/10 px-8 text-lg font-medium text-neutral-300 hover:bg-white/5"
                >
                  <a href="#workflow">
                    <CirclePlay className="mr-2 size-5" />
                    {t('home.hero.cta.secondary', { defaultValue: 'Watch Demo' })}
                  </a>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>


        {/* 3. Outcomes First - Vercel Style Grid */}
        <section id="outcomes" className="relative border-t border-white/5 bg-black px-6 py-40 lg:px-8">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
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
              <h2 className="mt-6 text-[3rem] font-bold leading-[1.1] tracking-tighter sm:text-[4.5rem] lg:text-[5.5rem]">
                One cockpit. Real results.
              </h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="mt-20 grid gap-px bg-white/5 rounded-3xl overflow-hidden sm:grid-cols-3 border border-white/10 shadow-2xl"
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
                }
              ].map((card, i) => (
                <motion.div
                  key={i}
                  variants={fadeUpVariants}
                  className="group relative bg-black p-10 lg:p-14"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative z-10">
                    <card.icon className="mb-10 size-10 text-neutral-500 transition-colors duration-500 group-hover:text-emerald-400" strokeWidth={1.5} />
                    <h3 className="text-2xl font-semibold tracking-tight text-white">{card.title}</h3>
                    <p className="mt-3 text-sm font-medium text-neutral-400">{card.detail}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 4. Minimal Membership */}
        <section id="membership" className="relative border-t border-white/5 bg-black px-6 py-40 lg:px-8">
          <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 bg-emerald-500/5 blur-[120px]" />
          <div className="mx-auto max-w-5xl relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid gap-8 md:grid-cols-2"
            >
              <motion.div variants={fadeUpVariants} className="flex flex-col rounded-3xl border border-white/5 bg-white/[0.01] p-10 backdrop-blur-3xl transition-colors hover:bg-white/[0.02]">
                <span className="text-sm font-semibold uppercase tracking-widest text-neutral-400">Free</span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-6xl font-bold tracking-tighter text-white">$0</span>
                </div>
                <p className="mt-4 text-sm text-neutral-500">Perfect for getting started and maintaining a daily habit.</p>
                <div className="mt-12 flex flex-1 flex-col gap-6">
                  {['Daily mission', 'Core quiz', 'Smart review queue'].map((feat, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Check className="size-5 text-neutral-600" />
                      <span className="text-base font-medium text-neutral-300">{feat}</span>
                    </div>
                  ))}
                </div>
                <Button asChild variant="outline" className="mt-12 h-14 w-full rounded-xl border border-white/10 bg-transparent text-lg font-semibold text-white transition-all hover:bg-white/5">
                  <Link to={primaryCtaPath}>Get Started Free</Link>
                </Button>
              </motion.div>

              <motion.div variants={fadeUpVariants} className="relative flex flex-col rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent p-10 shadow-[0_0_80px_rgba(16,185,129,0.1)] backdrop-blur-3xl">
                <div className="absolute -top-3 left-10 rounded-full border border-emerald-500/50 bg-black px-4 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  Most Popular
                </div>
                <span className="text-sm font-semibold uppercase tracking-widest text-emerald-500">Pro</span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-6xl font-bold tracking-tighter text-white">$9.99</span>
                  <span className="text-lg font-medium text-neutral-500">/mo</span>
                </div>
                <p className="mt-4 text-sm text-neutral-400">Unlock the full power of AI for serious learners.</p>
                <div className="mt-12 flex flex-1 flex-col gap-6">
                  {['Deep AI feedback', 'Writing coach workflows', 'Full IELTS cockpit', 'Priority generation'].map((feat, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Check className="size-5 text-emerald-400" />
                      <span className="text-base font-medium text-white">{feat}</span>
                    </div>
                  ))}
                </div>
                <Button asChild className="mt-12 h-14 w-full rounded-xl bg-white text-lg font-semibold text-black shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all hover:scale-105 hover:bg-neutral-200">
                  <Link to={upgradePath}>Upgrade to Pro</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 6. Deep Dark Footer CTA */}
        <section className="border-t border-white/5 py-40 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center px-6"
          >
            <h2 className="max-w-3xl text-[3rem] font-bold leading-tight tracking-tighter text-white sm:text-[4.5rem]">
              Ready to master English with clarity?
            </h2>
            <Button asChild className="mt-10 h-14 rounded-full bg-emerald-500 px-10 text-lg font-semibold text-white shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all hover:scale-105 hover:bg-emerald-400">
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

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, Brain, Calendar, Menu, MessageSquare, Target, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthRedirect } from '@/lib/authRedirect';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

const sampleWords = [
  {
    word: 'nevertheless',
    pos: 'adv.',
    example: 'The exam was tough; nevertheless, she passed with flying colors.',
  },
  {
    word: 'mitigate',
    pos: 'v.',
    example: 'Small daily habits mitigate the stress of exam season.',
  },
  {
    word: 'compelling',
    pos: 'adj.',
    example: 'A compelling argument needs evidence, not adjectives.',
  },
];

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const continuePath = isAuthenticated ? '/dashboard/today' : buildAuthRedirect('/dashboard/today');
  const primaryCtaPath = isAuthenticated ? continuePath : '/register';

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top nav — quiet, paper-warm */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">VocabDaily</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <a href="#workflow" className="text-sm text-muted-foreground hover:text-foreground">
              {t('home.nav.workflow', { defaultValue: 'How it works' })}
            </a>
            <Link to="/word-of-the-day" className="text-sm text-muted-foreground hover:text-foreground">
              {t('home.nav.wordOfTheDay', { defaultValue: 'Word of the day' })}
            </Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              {t('home.nav.membership', { defaultValue: 'Pricing' })}
            </Link>
          </nav>

          <div className="flex items-center gap-1.5">
            <div className="hidden items-center gap-1 sm:flex">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            <Button
              asChild
              size="sm"
              className="hidden h-9 rounded-md px-4 text-sm font-medium shadow-sm sm:inline-flex"
            >
              <Link to={continuePath}>
                {isAuthenticated
                  ? t('home.nav.continueLearning', { defaultValue: 'Continue' })
                  : t('home.nav.signIn', { defaultValue: 'Sign in' })}
              </Link>
            </Button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-border bg-card md:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">
                {t('home.nav.workflow', { defaultValue: 'How it works' })}
              </a>
              <Link to="/word-of-the-day" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">
                {t('home.nav.wordOfTheDay', { defaultValue: 'Word of the day' })}
              </Link>
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">
                {t('home.nav.membership', { defaultValue: 'Pricing' })}
              </Link>
              <Link
                to={continuePath}
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
              >
                {isAuthenticated
                  ? t('home.nav.continueLearning', { defaultValue: 'Continue' })
                  : t('home.nav.signIn', { defaultValue: 'Sign in' })}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero — first viewport with concrete workflow preview */}
        <section className="border-b border-border/70">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent-memory))]" />
                {t('home.hero.eyebrow', { defaultValue: 'A daily learning workbench for English' })}
              </span>
              <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {t('home.hero.title', { defaultValue: "Practice English you'll actually remember." })}
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg" lang="zh-CN">
                {t('home.hero.titleZh', { defaultValue: '每天 15 分钟，把词汇、写作、口语整合到一个学习节奏里。' })}
              </p>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t('home.hero.body', {
                  defaultValue:
                    "Each day VocabDaily shows what's due to review, what to learn next, and gives you AI-coached feedback on the writing and speaking you actually practice.",
                })}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-11 rounded-md px-5 text-sm font-medium shadow-sm">
                  <Link to={primaryCtaPath}>
                    {t('home.hero.cta.primary', { defaultValue: "Start today's session" })}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Link
                  to="#workflow"
                  className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {t('home.hero.cta.secondary', { defaultValue: 'See how it works' })}
                </Link>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                {t('home.hero.footnote', { defaultValue: 'Free to start · No credit card required · 免费开始' })}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  5,000+ 学习者使用
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  4.8 / 5 用户评分
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                  平均每天 15 分钟
                </span>
              </div>
            </div>

            {/* Today preview card */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {t('home.todayCard.label', { defaultValue: '今日' })}
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {t('home.todayCard.title', { defaultValue: 'A typical day' })}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground" lang="zh-CN">
                    {t('home.todayCard.subtitle', { defaultValue: '示例 · Example session — your real queue appears after sign-in' })}
                  </p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[hsl(var(--accent-memory))]/10 text-[hsl(var(--accent-memory))]">
                  <Calendar className="h-4 w-4" />
                </span>
              </div>

              <ul className="mt-5 space-y-3" aria-label="Example daily learning queue">
                <li className="flex items-center justify-between rounded-md border border-border/80 bg-background px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--accent-memory))]/10 text-[hsl(var(--accent-memory))]">
                      <Brain className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">12 个到期复习</p>
                      <p className="text-xs text-muted-foreground" lang="zh-CN">到期复习</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">约 6 分钟</span>
                </li>
                <li className="flex items-center justify-between rounded-md border border-border/80 bg-background px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--accent-practice))]/10 text-[hsl(var(--accent-practice))]">
                      <BookOpen className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">5 个新词</p>
                      <p className="text-xs text-muted-foreground" lang="zh-CN">新词学习</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">约 5 分钟</span>
                </li>
                <li className="flex items-center justify-between rounded-md border border-border/80 bg-background px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--accent-coach))]/10 text-[hsl(var(--accent-coach))]">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">1 个教练任务</p>
                      <p className="text-xs text-muted-foreground" lang="zh-CN">教练任务</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">约 4 分钟</span>
                </li>
              </ul>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  {t('home.todayCard.summary', { defaultValue: 'Estimated 15 min · 预计 15 分钟' })}
                </p>
                <Link
                  to={primaryCtaPath}
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t('home.todayCard.cta', { defaultValue: 'Begin →' })}
                </Link>
              </div>
            </div>
          </div>

          {/* Sample word strip */}
          <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16">
            <p className="text-xs font-medium text-muted-foreground">
              {t('home.examples.label', { defaultValue: '本周可能学到的词汇' })}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {sampleWords.map((w) => (
                <div key={w.word} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold tracking-tight">{w.word}</span>
                    <span className="text-xs text-muted-foreground">{w.pos}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">"{w.example}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="workflow" className="border-b border-border/70 bg-card/30">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t('home.workflow.title', { defaultValue: 'How VocabDaily works' })}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base" lang="zh-CN">
              {t('home.workflow.subtitle', { defaultValue: '三步把零散学习变成稳定节奏。' })}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Calendar,
                  accent: 'var(--accent-memory)',
                  title: t('home.workflow.steps.review.title', { defaultValue: 'Review what is due' }),
                  body: t('home.workflow.steps.review.body', {
                    defaultValue: 'FSRS-based spaced repetition tells you which words to retest today, no guessing.',
                  }),
                },
                {
                  icon: Target,
                  accent: 'var(--accent-practice)',
                  title: t('home.workflow.steps.practice.title', { defaultValue: 'Practice with prompts' }),
                  body: t('home.workflow.steps.practice.body', {
                    defaultValue: 'Targeted drills, listening, writing tasks tied to the words you just studied.',
                  }),
                },
                {
                  icon: MessageSquare,
                  accent: 'var(--accent-coach)',
                  title: t('home.workflow.steps.coach.title', { defaultValue: 'Get coach feedback' }),
                  body: t('home.workflow.steps.coach.body', {
                    defaultValue: 'AI coach reviews your answers, schedules retries, and converts mistakes into review cards.',
                  }),
                },
              ].map((step, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-md"
                    style={{
                      backgroundColor: `hsl(${step.accent} / 0.1)`,
                      color: `hsl(${step.accent})`,
                    }}
                  >
                    <step.icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature chip row */}
        <section className="border-b border-border/70 bg-card/30">
          <div className="mx-auto max-w-6xl px-4 pb-10 pt-0 sm:px-6">
            <div className="flex flex-wrap justify-center gap-3">
              {[
                'FSRS 间隔记忆算法',
                'AI 教练实时反馈',
                'IELTS 考试专项训练',
                '完全离线可用',
              ].map((feature) => (
                <span key={feature} className="rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Fact strip */}
        <section className="border-b border-border/70">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              <span className="font-medium text-foreground">FSRS-based spaced repetition</span>
              <span className="mx-2 text-border">·</span>
              <span>Coach-graded retries</span>
              <span className="mx-2 text-border">·</span>
              <span>Mistake-aware practice</span>
            </p>
            <p className="text-xs" lang="zh-CN">
              {t('home.facts.zh', { defaultValue: '间隔记忆 · 教练评分 · 错题驱动练习' })}
            </p>
          </div>
        </section>

        {/* Closing CTA */}
        <section>
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-20">
            <div>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {t('home.footer.cta.title', { defaultValue: 'Build a daily English habit you can keep.' })}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground" lang="zh-CN">
                {t('home.footer.cta.titleZh', { defaultValue: '从今天开始，用一个清晰的工作流学英语。' })}
              </p>
            </div>
            <Button asChild size="lg" className="h-11 rounded-md px-5 text-sm font-medium shadow-sm">
              <Link to={primaryCtaPath}>
                {t('home.footer.cta.guest', { defaultValue: "Start today's session" })}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-2">
            <span className={cn('flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary')}>
              <BookOpen className="h-3 w-3" />
            </span>
            <span className="font-medium text-foreground">VocabDaily</span>
          </div>
          <p>© 2026 VocabDaily. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

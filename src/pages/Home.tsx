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
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isZh = i18n.language?.startsWith('zh');

  const continuePath = isAuthenticated ? '/dashboard/today' : buildAuthRedirect('/dashboard/today');
  const primaryCtaPath = isAuthenticated ? continuePath : '/register';
  const copy = {
    nav: {
      workflow: isZh ? '如何运作' : 'How it works',
      wordOfTheDay: isZh ? '每日单词' : 'Word of the day',
      membership: isZh ? '定价' : 'Pricing',
      auth: isAuthenticated ? (isZh ? '继续学习' : 'Continue') : (isZh ? '登录' : 'Sign in'),
      menu: isZh ? '切换菜单' : 'Toggle menu',
    },
    hero: {
      eyebrow: isZh ? '面向英语学习者的每日工作台' : 'A daily learning workbench for English',
      title: isZh ? '把英语练到真正记得住。' : "Practice English you'll actually remember.",
      subtitle: isZh
        ? '每天 15 分钟，把词汇、写作、口语整合到一个学习节奏里。'
        : 'A focused 15-minute rhythm for vocabulary, writing, speaking, and review.',
      body: isZh
        ? 'VocabDaily 每天告诉你该复习什么、接下来学什么，并用 AI 教练反馈你真正练过的写作和口语。'
        : "Each day VocabDaily shows what's due to review, what to learn next, and gives you AI-coached feedback on the writing and speaking you actually practice.",
      primaryCta: isZh ? '开始今天的学习' : "Start today's session",
      secondaryCta: isZh ? '看看如何运作' : 'See how it works',
      footnote: isZh ? '免费开始 · 无需信用卡' : 'Free to start · No credit card required',
      evidence: [
        isZh ? 'FSRS 到期复习' : 'FSRS due reviews',
        isZh ? 'IELTS 写作反馈' : 'IELTS writing feedback',
        isZh ? '平均每天 15 分钟' : 'About 15 minutes a day',
      ],
    },
    today: {
      label: isZh ? '今日' : 'Today',
      title: isZh ? '典型学习日' : 'A typical day',
      subtitle: isZh ? '示例任务：登录后会看到你的真实队列' : 'Example session: your real queue appears after sign-in',
      items: [
        {
          title: isZh ? '12 个到期复习' : '12 due reviews',
          subtitle: isZh ? '到期复习' : 'Spaced repetition',
          duration: isZh ? '约 6 分钟' : 'About 6 min',
        },
        {
          title: isZh ? '5 个新词' : '5 new words',
          subtitle: isZh ? '新词学习' : 'New vocabulary',
          duration: isZh ? '约 5 分钟' : 'About 5 min',
        },
        {
          title: isZh ? '1 个教练任务' : '1 coach task',
          subtitle: isZh ? '教练任务' : 'Coach next step',
          duration: isZh ? '约 4 分钟' : 'About 4 min',
        },
      ],
      summary: isZh ? '预计 15 分钟' : 'Estimated 15 min',
      cta: isZh ? '开始' : 'Begin',
    },
    examplesLabel: isZh ? '本周可能学到的词汇' : 'Words you might practice this week',
    workflow: {
      title: isZh ? 'VocabDaily 如何运作' : 'How VocabDaily works',
      subtitle: isZh ? '三步把零散学习变成稳定节奏。' : 'Three steps turn scattered practice into a steady daily rhythm.',
      steps: [
        {
          title: isZh ? '复习到期内容' : 'Review what is due',
          body: isZh ? '基于 FSRS 的间隔重复告诉你今天该复测哪些词，不靠猜。' : 'FSRS-based spaced repetition tells you which words to retest today, no guessing.',
        },
        {
          title: isZh ? '用任务练习' : 'Practice with prompts',
          body: isZh ? '短测、听力、写作任务会围绕你刚学过的词和弱项生成。' : 'Targeted drills, listening, and writing tasks stay tied to the words you just studied.',
        },
        {
          title: isZh ? '获得教练反馈' : 'Get coach feedback',
          body: isZh ? 'AI 教练复盘答案、安排重练，并把错误转成后续复习。' : 'AI coach reviews your answers, schedules retries, and converts mistakes into review cards.',
        },
      ],
    },
    featureChips: isZh
      ? ['FSRS 间隔记忆算法', 'AI 教练实时反馈', 'IELTS 考试专项训练', '本地数据可用']
      : ['FSRS spaced repetition', 'Real-time AI coach feedback', 'IELTS-focused training', 'Local data fallback'],
    facts: isZh
      ? ['FSRS 间隔记忆', '教练评分重练', '错题驱动练习']
      : ['FSRS-based spaced repetition', 'Coach-graded retries', 'Mistake-aware practice'],
    footerCta: {
      title: isZh ? '建立一个能坚持的每日英语习惯。' : 'Build a daily English habit you can keep.',
      subtitle: isZh ? '从今天开始，用一个清晰的工作流学英语。' : 'Start with one clear workflow instead of another pile of features.',
      button: isZh ? '开始今天的学习' : "Start today's session",
    },
  };

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
      <header className="sticky top-0 z-40 border-b border-border bg-[hsl(var(--surface-raised))]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/20 bg-primary text-primary-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.18)]">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">VocabDaily</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <a href="#workflow" className="text-sm text-muted-foreground hover:text-foreground">
              {copy.nav.workflow}
            </a>
            <Link to="/word-of-the-day" className="text-sm text-muted-foreground hover:text-foreground">
              {copy.nav.wordOfTheDay}
            </Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              {copy.nav.membership}
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
                {copy.nav.auth}
              </Link>
            </Button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={copy.nav.menu}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-border bg-card md:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">
                {copy.nav.workflow}
              </a>
              <Link to="/word-of-the-day" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">
                {copy.nav.wordOfTheDay}
              </Link>
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">
                {copy.nav.membership}
              </Link>
              <Link
                to={continuePath}
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
              >
                {copy.nav.auth}
              </Link>
              <div className="mt-2 flex items-center gap-1 border-t border-border pt-3">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero — first viewport with concrete workflow preview */}
        <section className="border-b border-border bg-[hsl(var(--surface-sunken))]">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-md border border-border bg-[hsl(var(--surface-raised))] px-3 py-1 text-xs font-semibold text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent-memory))]" />
                {copy.hero.eyebrow}
              </span>
              <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {copy.hero.title}
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                {copy.hero.subtitle}
              </p>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {copy.hero.body}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-11 rounded-md px-5 text-sm font-medium shadow-sm">
                  <Link to={primaryCtaPath}>
                    {copy.hero.primaryCta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Link
                  to="#workflow"
                  className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {copy.hero.secondaryCta}
                </Link>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                {copy.hero.footnote}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {copy.hero.evidence[0]}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  {copy.hero.evidence[1]}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                  {copy.hero.evidence[2]}
                </span>
              </div>
            </div>

            {/* Today preview card */}
            <div className="relative overflow-hidden rounded-lg border border-border border-l-4 border-l-primary bg-[hsl(var(--surface-raised))] p-5 shadow-[0_1px_0_hsl(var(--border)/0.7),0_22px_48px_-38px_hsl(var(--shadow-studio)/0.34)] sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {copy.today.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {copy.today.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {copy.today.subtitle}
                  </p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[hsl(var(--accent-memory)/0.18)] bg-[hsl(var(--accent-memory))]/10 text-[hsl(var(--accent-memory))]">
                  <Calendar className="h-4 w-4" />
                </span>
              </div>

              <ul className="mt-5 space-y-3" aria-label="Example daily learning queue">
                <li className="flex items-center justify-between rounded-md border border-border/80 bg-[hsl(var(--surface-sunken))] px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--accent-memory))]/10 text-[hsl(var(--accent-memory))]">
                      <Brain className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{copy.today.items[0].title}</p>
                      <p className="text-xs text-muted-foreground">{copy.today.items[0].subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{copy.today.items[0].duration}</span>
                </li>
                <li className="flex items-center justify-between rounded-md border border-border/80 bg-[hsl(var(--surface-sunken))] px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--accent-practice))]/10 text-[hsl(var(--accent-practice))]">
                      <BookOpen className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{copy.today.items[1].title}</p>
                      <p className="text-xs text-muted-foreground">{copy.today.items[1].subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{copy.today.items[1].duration}</span>
                </li>
                <li className="flex items-center justify-between rounded-md border border-border/80 bg-[hsl(var(--surface-sunken))] px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--accent-coach))]/10 text-[hsl(var(--accent-coach))]">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{copy.today.items[2].title}</p>
                      <p className="text-xs text-muted-foreground">{copy.today.items[2].subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{copy.today.items[2].duration}</span>
                </li>
              </ul>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  {copy.today.summary}
                </p>
                <Link
                  to={primaryCtaPath}
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  {copy.today.cta}
                </Link>
              </div>
            </div>
          </div>

          {/* Sample word strip */}
          <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16">
            <p className="text-xs font-medium text-muted-foreground">
              {copy.examplesLabel}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {sampleWords.map((w) => (
                <div key={w.word} className="rounded-lg border border-border bg-[hsl(var(--surface-raised))] p-4 shadow-[0_1px_0_hsl(var(--border)/0.7)]">
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
        <section id="workflow" className="border-b border-border bg-background">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {copy.workflow.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {copy.workflow.subtitle}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Calendar,
                  accent: 'var(--accent-memory)',
                  title: copy.workflow.steps[0].title,
                  body: copy.workflow.steps[0].body,
                },
                {
                  icon: Target,
                  accent: 'var(--accent-practice)',
                  title: copy.workflow.steps[1].title,
                  body: copy.workflow.steps[1].body,
                },
                {
                  icon: MessageSquare,
                  accent: 'var(--accent-coach)',
                  title: copy.workflow.steps[2].title,
                  body: copy.workflow.steps[2].body,
                },
              ].map((step, i) => (
                <div key={i} className="rounded-lg border border-border bg-[hsl(var(--surface-raised))] p-5 shadow-[0_1px_0_hsl(var(--border)/0.7)]">
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
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-6xl px-4 pb-10 pt-0 sm:px-6">
            <div className="flex flex-wrap justify-center gap-3">
              {copy.featureChips.map((feature) => (
                <span key={feature} className="rounded-md border border-border bg-[hsl(var(--surface-raised))] px-4 py-1.5 text-sm font-medium text-muted-foreground">
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
              <span className="font-medium text-foreground">
                {copy.facts[0]}
              </span>
              <span className="mx-2 text-border">·</span>
              <span>{copy.facts[1]}</span>
              <span className="mx-2 text-border">·</span>
              <span>{copy.facts[2]}</span>
            </p>
          </div>
        </section>

        {/* Closing CTA */}
        <section>
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-20">
            <div>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {copy.footerCta.title}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {copy.footerCta.subtitle}
              </p>
            </div>
            <Button asChild size="lg" className="h-11 rounded-md px-5 text-sm font-medium shadow-sm">
              <Link to={primaryCtaPath}>
                {copy.footerCta.button}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-[hsl(var(--surface-sunken))]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-2">
            <span className={cn('flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary')}>
              <BookOpen className="h-3 w-3" />
            </span>
            <span className="font-medium text-foreground">VocabDaily</span>
          </div>
          <p>
            {isZh ? '© 2026 VocabDaily。保留所有权利。' : '© 2026 VocabDaily. All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}

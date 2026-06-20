import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Menu,
  MessageSquare,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassSurface } from '@/components/ui/glass-surface';
import { useAuth } from '@/contexts/AuthContext';
import { buildAuthRedirect } from '@/lib/authRedirect';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

const sampleWords = [
  {
    word: 'nevertheless',
    pos: 'adv.',
    example: 'It was raining. Nevertheless, we went out.',
  },
  {
    word: 'mitigate',
    pos: 'v.',
    example: 'Good notes mitigate last-minute review.',
  },
  {
    word: 'compelling',
    pos: 'adj.',
    example: 'Her example made the point compelling.',
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
      workflow: isZh ? '怎么练' : 'Practice flow',
      wordOfTheDay: isZh ? '每日单词' : 'Word of the day',
      membership: isZh ? '定价' : 'Pricing',
      auth: isAuthenticated ? (isZh ? '继续' : 'Continue') : (isZh ? '登录' : 'Sign in'),
      menu: isZh ? '切换菜单' : 'Toggle menu',
    },
    hero: {
      title: isZh ? '今天要做的事' : 'Today\'s list',
      subtitle: isZh
        ? '复习到期词，看几个新词，做一组题。'
        : 'Review due words, add a few new ones, then do one set.',
      primaryCta: isZh ? '开始' : 'Start',
      secondaryCta: isZh ? '试用' : 'Try sample',
    },
    today: {
      label: isZh ? '今日安排' : 'Today',
      title: isZh ? '约 15 分钟' : 'About 15 min',
      subtitle: isZh ? '登录后换成你的内容' : 'Uses your words after sign-in',
      items: [
        {
          title: isZh ? '复习 12 个词' : 'Review 12 words',
          subtitle: isZh ? '今天到期' : 'Due today',
          duration: isZh ? '6 分钟' : '6 min',
        },
        {
          title: isZh ? '学 5 个新词' : 'Learn 5 new words',
          subtitle: isZh ? '加入后续复习' : 'Added to review',
          duration: isZh ? '5 分钟' : '5 min',
        },
        {
          title: isZh ? '做 1 组练习' : 'Do 1 practice set',
          subtitle: isZh ? '听力或写作' : 'Listening or writing',
          duration: isZh ? '4 分钟' : '4 min',
        },
      ],
      summary: isZh ? '3 项，约 15 分钟' : '3 items, about 15 min',
    },
    examplesLabel: isZh ? '例词' : 'Sample words',
    workflow: {
      title: isZh ? '复习，新词，练习' : 'Review, Words, Practice',
      subtitle: isZh ? '每天按这个顺序走。' : 'The daily order stays simple.',
      steps: [
        {
          title: isZh ? '复习到期词' : 'Review due words',
          body: isZh ? '先过一遍今天到期的词。' : 'Start with words due today.',
        },
        {
          title: isZh ? '学几个新词' : 'Add a few words',
          body: isZh ? '新词会进入后续复习。' : 'New words enter later reviews.',
        },
        {
          title: isZh ? '做一组练习' : 'Do one set',
          body: isZh ? '答题、听写或写一句。' : 'Answer, dictate, or write one sentence.',
        },
      ],
    },
  };

  const workflowCards = [
    {
      icon: Calendar,
      title: copy.workflow.steps[0].title,
      body: copy.workflow.steps[0].body,
      className: 'bg-primary/[0.08] md:row-span-2',
    },
    {
      icon: Target,
      title: copy.workflow.steps[1].title,
      body: copy.workflow.steps[1].body,
      className: 'bg-[hsl(var(--surface-raised))]/82',
    },
    {
      icon: MessageSquare,
      title: copy.workflow.steps[2].title,
      body: copy.workflow.steps[2].body,
      className: 'bg-[hsl(var(--accent-memory)/0.08)]',
    },
  ];

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [mobileMenuOpen]);

  return (
    <div className="home-study-bg min-h-[100dvh] text-foreground">
      <header className="sticky top-3 z-40 px-3 sm:px-4">
        <GlassSurface
          variant="bar"
          className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-5"
        >
          <Link to="/" className="flex items-center gap-2.5">
            <span className="liquid-glass-control flex h-9 w-9 items-center justify-center text-primary">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold">VocabDaily</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <a href="#workflow" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {copy.nav.workflow}
            </a>
            <Link to="/word-of-the-day" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {copy.nav.wordOfTheDay}
            </Link>
            <Link to="/pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {copy.nav.membership}
            </Link>
          </nav>

          <div className="flex items-center gap-1.5">
            <div className="hidden items-center gap-1 sm:flex">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            <Button asChild size="sm" variant="glassPrimary" className="hidden h-9 px-4 sm:inline-flex">
              <Link to={continuePath}>
                {copy.nav.auth}
              </Link>
            </Button>
            <button
              type="button"
              className="liquid-glass-control liquid-glass-interactive flex h-9 w-9 items-center justify-center text-foreground md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={copy.nav.menu}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </GlassSurface>

        {mobileMenuOpen && (
          <GlassSurface variant="panel" className="mx-auto mt-2 max-w-6xl p-2 md:hidden">
            <div className="flex flex-col gap-1">
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm hover:bg-muted">
                {copy.nav.workflow}
              </a>
              <Link to="/word-of-the-day" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm hover:bg-muted">
                {copy.nav.wordOfTheDay}
              </Link>
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm hover:bg-muted">
                {copy.nav.membership}
              </Link>
              <Link
                to={continuePath}
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 rounded-xl bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
              >
                {copy.nav.auth}
              </Link>
              <div className="mt-2 flex items-center gap-1 border-t border-border/45 pt-3">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </div>
          </GlassSurface>
        )}
      </header>

      <main id="main-content">
        <section>
          <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.9fr)] lg:items-center lg:py-14">
            <div className="max-w-2xl">
              <h1 className="max-w-xl text-4xl font-semibold leading-[1.04] text-foreground sm:text-5xl lg:text-6xl">
                {copy.hero.title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                {copy.hero.subtitle}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-11 px-5 text-sm font-medium">
                  <Link to={primaryCtaPath}>
                    {copy.hero.primaryCta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="glass" className="h-11 px-5 text-sm font-medium">
                  <Link to="/demo">
                    {copy.hero.secondaryCta}
                  </Link>
                </Button>
              </div>

              <div className="mt-8 grid gap-2.5 sm:max-w-lg">
                {copy.today.items.map((item) => (
                  <GlassSurface key={item.title} variant="control" className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3.5 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="truncate text-sm font-medium text-foreground">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.duration}</span>
                  </GlassSurface>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-border/55 bg-card shadow-[0_1px_1px_hsl(var(--shadow-studio)/0.04),0_28px_70px_-56px_hsl(var(--shadow-studio)/0.55)]">
              <img
                src="/vocabdaily-study-desk.jpg"
                alt={isZh ? '桌面上的笔记本和学习记录' : 'Notebook and study notes on a desk'}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
                <GlassSurface variant="bar" className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">{copy.today.label}</p>
                    <p className="mt-0.5 truncate text-base font-semibold">{copy.today.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{copy.today.subtitle}</p>
                  </div>
                  <span className="liquid-glass-control flex h-10 w-10 shrink-0 items-center justify-center text-primary">
                    <Calendar className="h-4 w-4" />
                  </span>
                </GlassSurface>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/40 bg-[hsl(var(--surface-raised)/0.24)]">
          <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-foreground">{copy.examplesLabel}</h2>
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2">
              {sampleWords.map((w) => (
                <article key={w.word} className="min-w-[240px] snap-start rounded-2xl border border-border/65 bg-card/75 p-4 sm:min-w-0 sm:flex-1">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-semibold">{w.word}</h3>
                    <span className="text-xs text-muted-foreground">{w.pos}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{w.example}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
                {copy.workflow.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                {copy.workflow.subtitle}
              </p>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-[1.08fr_0.92fr] md:grid-rows-2">
              {workflowCards.map((step) => (
                <article key={step.title} className={`rounded-[1.6rem] border border-border/62 p-5 shadow-[var(--shadow-paper)] ${step.className}`}>
                  <div className="liquid-glass-control flex h-11 w-11 items-center justify-center text-primary">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/45 bg-[hsl(var(--surface-raised)/0.52)]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-2">
            <span className="liquid-glass-control flex h-7 w-7 items-center justify-center text-primary">
              <BookOpen className="h-3.5 w-3.5" />
            </span>
            <span className="font-medium text-foreground">VocabDaily</span>
          </div>
          <p>
            {isZh ? '© 2026 VocabDaily。保留所有权利。' : '© 2026 VocabDaily. All rights reserved.'}
          </p>
          <nav className="flex items-center gap-3" aria-label={isZh ? '法律链接' : 'Legal links'}>
            <Link to="/terms" className="hover:text-foreground">
              {isZh ? '服务条款' : 'Terms'}
            </Link>
            <span className="text-border" aria-hidden="true">/</span>
            <Link to="/privacy" className="hover:text-foreground">
              {isZh ? '隐私政策' : 'Privacy'}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

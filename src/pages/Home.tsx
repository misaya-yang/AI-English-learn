import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Menu,
  MessageSquare,
  Target,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      title: isZh ? 'IELTS 词汇练习' : 'IELTS vocabulary practice',
      subtitle: isZh
        ? '到期词先复习，新词学几个，再做一组短练。'
        : 'Review due words, add a few new ones, then do one short set.',
      primaryCta: isZh ? '开始练习' : 'Start practice',
      secondaryCta: isZh ? '看样课' : 'Sample lesson',
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
      icon: BookOpen,
      title: copy.workflow.steps[0].title,
      body: copy.workflow.steps[0].body,
      className: 'bg-primary/[0.07] md:row-span-2',
    },
    {
      icon: Target,
      title: copy.workflow.steps[1].title,
      body: copy.workflow.steps[1].body,
      className: 'bg-[hsl(var(--surface-raised))]/42',
    },
    {
      icon: MessageSquare,
      title: copy.workflow.steps[2].title,
      body: copy.workflow.steps[2].body,
      className: 'bg-[hsl(var(--accent-memory)/0.07)]',
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
      <header className="z-40 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between sm:h-20">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-primary/10 text-primary shadow-[inset_0_1px_0_hsl(var(--glass-highlight)/0.24)]">
              <BookOpen className="h-6 w-6" />
            </span>
            <span className="text-2xl font-bold tracking-normal">VocabDaily</span>
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
            <Button asChild size="sm" className="hidden h-10 rounded-lg px-4 sm:inline-flex">
              <Link to={continuePath}>
                {copy.nav.auth}
              </Link>
            </Button>
            <button
              type="button"
              className="glass-icon-button flex h-11 w-11 items-center justify-center rounded-lg text-foreground md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={copy.nav.menu}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="liquid-glass-panel mx-auto mt-2 max-w-6xl p-2 md:hidden">
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
              <div className="mt-2 flex items-center gap-1 pt-2">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </header>

      <main id="main-content">
        <section>
          <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.74fr)] lg:items-start lg:py-16">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                {isZh ? '每日 IELTS 练习' : 'Daily IELTS practice'}
              </div>
              <h1
                aria-label={copy.hero.title}
                className="mt-8 max-w-xl text-[2.7rem] font-bold leading-[1.02] text-foreground sm:text-[3.65rem] lg:text-[4.15rem]"
              >
                {copy.hero.title}
              </h1>
              <p className="mt-7 max-w-xl text-xl leading-9 text-muted-foreground">
                {copy.hero.subtitle}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-12 rounded-xl px-6 text-sm font-semibold">
                  <Link to={primaryCtaPath}>
                    {copy.hero.primaryCta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="h-12 rounded-xl px-5 text-sm font-semibold">
                  <Link to="/demo">
                    {copy.hero.secondaryCta}
                  </Link>
                </Button>
              </div>

              <div className="mt-10 space-y-1 sm:max-w-xl">
                {copy.today.items.map((item) => (
                  <div key={item.title} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-xl bg-[hsl(var(--paper-muted)/0.26)] px-3 py-3">
                    <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="truncate text-sm font-medium text-foreground">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-xl bg-[hsl(var(--paper-muted)/0.30)] p-5 lg:mt-8">
              <p className="text-sm font-semibold text-muted-foreground">{copy.today.label}</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-foreground">{copy.today.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.today.subtitle}</p>
              <div className="mt-7 space-y-1">
                {copy.today.items.map((item, index) => (
                  <div key={item.title} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-[hsl(var(--paper-muted)/0.26)] px-3 py-3">
                    <span className="study-number text-xl text-primary">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{item.subtitle}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.duration}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="bg-[hsl(var(--surface-raised)/0.16)]">
          <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-foreground">{copy.examplesLabel}</h2>
              <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2">
              {sampleWords.map((w) => (
                <article key={w.word} className="min-w-[240px] snap-start rounded-xl bg-[hsl(var(--paper-muted)/0.28)] px-4 py-3 sm:min-w-0 sm:flex-1">
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
                <article key={step.title} className={`workbook-surface p-5 ${step.className}`}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
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

      <footer className="bg-[hsl(var(--surface-raised)/0.52)]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
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

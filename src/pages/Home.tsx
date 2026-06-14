import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, Calendar, Menu, MessageSquare, Target, X } from 'lucide-react';
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
      workflow: isZh ? '如何运作' : 'How it works',
      wordOfTheDay: isZh ? '每日单词' : 'Word of the day',
      membership: isZh ? '定价' : 'Pricing',
      auth: isAuthenticated ? (isZh ? '继续学习' : 'Continue') : (isZh ? '登录' : 'Sign in'),
      menu: isZh ? '切换菜单' : 'Toggle menu',
    },
    hero: {
      title: isZh ? '今天练什么，一目了然。' : "See today's practice at a glance.",
      subtitle: isZh
        ? '复习到期词，学几个新词，再做一小段练习。'
        : 'Review due words, add a few new ones, then do one short drill.',
      primaryCta: isZh ? '开始学习' : 'Start learning',
      secondaryCta: isZh ? '试样课' : 'Try sample',
      evidence: [
        isZh ? '到期复习' : 'Due review',
        isZh ? '新词' : 'New words',
        isZh ? '听说读写' : 'Practice',
      ],
    },
    today: {
      label: isZh ? '今日计划' : "Today's plan",
      title: isZh ? '15 分钟' : '15 minutes',
      subtitle: isZh ? '登录后按你的词库和错题更新' : 'Updates from your words and mistakes after sign-in',
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
          title: isZh ? '做 1 个练习' : 'Do 1 practice task',
          subtitle: isZh ? '听力或写作' : 'Listening or writing',
          duration: isZh ? '4 分钟' : '4 min',
        },
      ],
      summary: isZh ? '先完成这三件事' : 'Finish these three first',
    },
    examplesLabel: isZh ? '今日示例词' : 'Sample words',
    workflow: {
      title: isZh ? '一次学习怎么走' : 'How one session works',
      subtitle: isZh ? '复习，学习，练习。每天保持同一套顺序。' : 'Review, learn, practice. Same order every day.',
      steps: [
        {
          title: isZh ? '复习到期词' : 'Review due words',
          body: isZh ? '只处理今天该复习的词。' : 'Only work through words due today.',
        },
        {
          title: isZh ? '补几个新词' : 'Add a few words',
          body: isZh ? '新词会进入后续复习。' : 'New words enter later review sessions.',
        },
        {
          title: isZh ? '做一个小练习' : 'Do one short drill',
          body: isZh ? '用刚学过的词写一句、听一段或答一道题。' : 'Use recent words in a sentence, a clip, or one question.',
        },
      ],
    },
    footerCta: {
      title: isZh ? '今天先练 15 分钟。' : 'Start with 15 minutes today.',
      subtitle: isZh ? '先做完今日计划，再决定要不要继续。' : 'Finish the daily plan first, then decide whether to continue.',
      button: isZh ? '开始学习' : 'Start learning',
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
    <div className="study-premium-bg min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-[hsl(var(--surface-raised))]/92 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/20 bg-primary text-primary-foreground">
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
          <div className="premium-panel-soft border-t border-border bg-card md:hidden">
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
        <section className="border-b border-border/70">
          <div className="mx-auto grid min-h-[calc(100dvh-3.5rem)] max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:items-center lg:py-16">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-border bg-[hsl(var(--surface-raised))]/88 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                VocabDaily
              </div>
              <h1 className="max-w-2xl text-4xl font-semibold leading-[1.06] text-foreground sm:text-5xl md:text-[3.5rem]">
                {isZh ? (
                  <>
                    <span className="block">今天练什么，</span>
                    <span className="block">一目了然。</span>
                  </>
                ) : (
                  copy.hero.title
                )}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                {copy.hero.subtitle}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-11 rounded-md px-5 text-sm font-medium">
                  <Link to={primaryCtaPath}>
                    {copy.hero.primaryCta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Link
                  to="/demo"
                  className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {copy.hero.secondaryCta}
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-2 text-sm text-muted-foreground">
                {copy.hero.evidence.map((item) => (
                  <span key={item} className="rounded-md border border-border/80 bg-[hsl(var(--surface-raised))]/70 px-3 py-1">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg border border-border/85 bg-[hsl(var(--surface-raised))] p-5 shadow-[0_1px_1px_hsl(var(--shadow-studio)/0.035),0_18px_40px_-32px_hsl(var(--shadow-studio)/0.28)] sm:p-6">
              <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
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
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border/80 bg-muted/50 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                </span>
              </div>

              <ul className="mt-5 divide-y divide-border/70" aria-label="Example daily learning queue">
                <li className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Calendar className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{copy.today.items[0].title}</p>
                      <p className="text-xs text-muted-foreground">{copy.today.items[0].subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{copy.today.items[0].duration}</span>
                </li>
                <li className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--accent-practice)/0.1)] text-[hsl(var(--accent-practice))]">
                      <BookOpen className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{copy.today.items[1].title}</p>
                      <p className="text-xs text-muted-foreground">{copy.today.items[1].subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{copy.today.items[1].duration}</span>
                </li>
                <li className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--accent-coach)/0.1)] text-[hsl(var(--accent-coach))]">
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

              <div className="mt-4 border-t border-border/70 pt-4">
                <p className="text-xs text-muted-foreground">
                  {copy.today.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Sample word strip */}
          <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-14">
            <p className="text-xs font-medium text-muted-foreground">
              {copy.examplesLabel}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {sampleWords.map((w) => (
                <div key={w.word} className="rounded-lg border border-border/85 bg-[hsl(var(--surface-raised))]/88 p-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold tracking-tight">{w.word}</span>
                    <span className="text-xs text-muted-foreground">{w.pos}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.example}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="border-b border-border/70 bg-[hsl(var(--surface-raised))]/34">
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
                <div key={i} className="rounded-lg border border-border/85 bg-[hsl(var(--surface-raised))] p-5">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground"
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

      <footer className="border-t border-border/70 bg-[hsl(var(--surface-raised))]/88">
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

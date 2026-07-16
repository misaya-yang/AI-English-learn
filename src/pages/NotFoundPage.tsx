import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpenText,
  Dumbbell,
  Library,
  Search,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { BrandMark } from '@/features/marketing/BrandMark';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function NotFoundPage() {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh') ?? false;
  const destinations = [
    {
      to: '/dashboard/today',
      icon: BookOpenText,
      title: isZh ? '今日学习' : 'Today',
      description: isZh ? '继续今天的新词和学习任务。' : 'Continue today’s words and learning tasks.',
    },
    {
      to: '/dashboard/practice',
      icon: Dumbbell,
      title: isZh ? '主动练习' : 'Practice',
      description: isZh ? '进入拼写、听力与选择练习。' : 'Start spelling, listening, or quiz practice.',
    },
    {
      to: '/dashboard/vocabulary',
      icon: Library,
      title: isZh ? '我的词典' : 'Vocabulary',
      description: isZh ? '查找已学词汇和学习记录。' : 'Find saved words and learning history.',
    },
    {
      to: '/pricing',
      icon: Sparkles,
      title: isZh ? '查看方案' : 'Plans',
      description: isZh ? '了解可用功能和学习方案。' : 'Explore available features and learning plans.',
    },
  ];

  return (
    <div className="study-premium-bg min-h-[100dvh] text-foreground">
      <header className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4 sm:px-6">
        <BrandMark />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-5xl px-4 pb-12 pt-4 sm:px-6 sm:pt-10">
        <section className="workbook-surface overflow-hidden">
          <div className="grid gap-6 border-b border-[hsl(var(--paper-line)/0.72)] p-6 sm:p-8 lg:grid-cols-[96px_minmax(0,1fr)] lg:items-center lg:p-10">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Search className="h-8 w-8" aria-hidden="true" />
            </div>
            <div>
              <p className="focus-kicker">404</p>
              <h1 className="focus-page-title mt-3 text-3xl sm:text-4xl">
                {isZh ? '这个页面不存在' : 'This page does not exist'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {isZh
                  ? '链接可能已经变化。可以返回首页，也可以从下面直接进入常用页面。'
                  : 'The link may have changed. Return home or jump directly to a common destination below.'}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild>
                  <Link to="/">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    {isZh ? '返回首页' : 'Back home'}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/login">{isZh ? '前往登录' : 'Go to sign in'}</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-5">
              <p className="study-label">{isZh ? '常用入口' : 'Common destinations'}</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">
                {isZh ? '从这里继续' : 'Continue from here'}
              </h2>
            </div>
            <nav
              aria-label={isZh ? '常用页面' : 'Common pages'}
              className="grid gap-3 sm:grid-cols-2"
            >
              {destinations.map(({ to, icon: Icon, title, description }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex min-h-28 items-start gap-4 rounded-xl border border-[hsl(var(--paper-line)/0.72)] bg-[hsl(var(--paper-muted)/0.24)] p-4 transition-colors hover:border-primary/35 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-foreground">{title}</span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{description}</span>
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </section>
      </main>
    </div>
  );
}

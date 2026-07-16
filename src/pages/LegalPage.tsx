import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BrandMark } from '@/features/marketing/BrandMark';
import { GlassSurface } from '@/components/ui/glass-surface';
import { cn } from '@/lib/utils';

interface LegalSection {
  title: string;
  titleZh: string;
  body: string[];
  bodyZh: string[];
}

const EFFECTIVE_DATE = '2026-06-13';
const SUPPORT_EMAIL = 'support@uuedu.online';

const TERMS_SECTIONS: LegalSection[] = [
  {
    title: 'Product status',
    titleZh: '产品状态',
    body: [
      'VocabDaily is an English-learning application for vocabulary review, daily practice, AI-assisted coaching, and exam preparation workflows.',
      'Some paid or Pro features shown in the product are not yet available. Checkout must stay disabled until a real payment provider, pricing configuration, and release checklist are complete.',
    ],
    bodyZh: [
      'VocabDaily 是一款英语学习应用，覆盖词汇复习、每日练习、智能反馈和考试备考流程。',
      '产品中展示的部分付费或 Pro 功能尚未开放。只有在真实支付服务、价格配置和发布检查完成后，结账入口才可以开启。',
    ],
  },
  {
    title: 'Account responsibilities',
    titleZh: '账号责任',
    body: [
      'You are responsible for keeping your login credentials secure and for using the app in a lawful, respectful way.',
      'You should not upload content that you do not have permission to use, or use the app to generate abusive, deceptive, or unlawful material.',
    ],
    bodyZh: [
      '你需要妥善保管登录凭据，并以合法、尊重他人的方式使用本应用。',
      '请不要上传无权使用的内容，也不要使用本应用生成攻击性、欺骗性或违法内容。',
    ],
  },
  {
    title: 'Learning and AI output',
    titleZh: '学习与 AI 输出',
    body: [
      'AI feedback is intended to support learning. It may be incomplete or incorrect, so learners should use judgment and verify important language or exam claims.',
      'Progress, review timing, and recommendation features depend on available learner data and may change as the product improves.',
    ],
    bodyZh: [
      'AI 反馈用于辅助学习，可能不完整或不准确。涉及重要语言表达或考试判断时，学习者应自行判断并核实。',
      '进度、复习时间和推荐结果会依赖已有学习数据，并可能随产品迭代而调整。',
    ],
  },
  {
    title: 'Subscriptions and cancellation',
    titleZh: '订阅与取消',
    body: [
      'Free access remains available while paid plans are being prepared.',
      'When paid plans launch, subscription price, renewal period, cancellation method, refund handling, and plan limits must be shown before checkout.',
      `Subscription and billing questions can be sent to ${SUPPORT_EMAIL}. If paid checkout is unavailable, VocabDaily will not create a subscription or charge a payment method.`,
    ],
    bodyZh: [
      '在付费方案准备期间，免费版仍可使用。',
      '付费方案上线后，订阅价格、续费周期、取消方式、退款处理和方案限制必须在结账前清楚展示。',
      `订阅和账单问题可以发送至 ${SUPPORT_EMAIL}。如果付费结账不可用，VocabDaily 不会创建订阅，也不会扣款。`,
    ],
  },
];

const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: 'Data we use',
    titleZh: '我们使用的数据',
    body: [
      'VocabDaily may use account information, profile settings, learning goals, word-book data, review history, practice answers, mistakes, and AI coaching conversations to provide the learning experience.',
      'Imported vocabulary, generated practice items, and local offline data may be used to personalize review queues and recommendations.',
    ],
    bodyZh: [
      'VocabDaily 可能使用账号信息、个人设置、学习目标、词书数据、复习记录、练习答案、错题和答疑对话来提供学习体验。',
      '导入词汇、生成练习内容和本地离线数据可能用于个性化复习队列和推荐。',
    ],
  },
  {
    title: 'Why we use it',
    titleZh: '使用目的',
    body: [
      'Data is used to authenticate users, preserve progress, schedule spaced repetition, recommend next actions, provide AI feedback, troubleshoot reliability issues, and support product safety.',
      'Payment-related data should only be handled by the configured payment provider once paid checkout is enabled.',
    ],
    bodyZh: [
      '数据用于用户认证、保存进度、安排间隔重复、推荐下一步行动、提供 AI 反馈、排查可靠性问题以及支持产品安全。',
      '付费结账开启后，支付相关数据应只由已配置的支付服务商处理。',
    ],
  },
  {
    title: 'Storage and control',
    titleZh: '存储与控制',
    body: [
      'The app supports local/offline learning data as well as cloud-backed account data where configured.',
      `Learners can clear local learning data from settings. For account data access, export, or deletion requests, contact ${SUPPORT_EMAIL}.`,
    ],
    bodyZh: [
      '本应用支持本地/离线学习数据，也可能在配置后使用云端账号数据。',
      `学习者可以在设置中清除本地学习数据。如需访问、导出或删除账号数据，请联系 ${SUPPORT_EMAIL}。`,
    ],
  },
  {
    title: 'Contact and requests',
    titleZh: '联系方式与请求',
    body: [
      `Privacy requests can be sent to ${SUPPORT_EMAIL}. Include the account email and the type of request so the team can route it correctly.`,
      'VocabDaily keeps only the data needed to provide learning, safety, account, and reliability features, subject to the product configuration available to your account.',
    ],
    bodyZh: [
      `隐私请求可以发送至 ${SUPPORT_EMAIL}。请包含账号邮箱和请求类型，方便团队正确处理。`,
      'VocabDaily 仅在账号可用的产品配置范围内，保留提供学习、安全、账号和可靠性功能所需的数据。',
    ],
  },
];

export default function LegalPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');
  const isTerms = location.pathname !== '/privacy';
  const sections = isTerms ? TERMS_SECTIONS : PRIVACY_SECTIONS;
  const title = isTerms
    ? isZh ? '服务条款' : 'Terms of Service'
    : isZh ? '隐私政策' : 'Privacy Policy';
  const subtitle = isTerms
    ? isZh
      ? '本条款说明账号、学习内容、AI 反馈和未来订阅功能的使用边界。'
      : 'These terms explain the boundaries for accounts, learning content, AI feedback, and future subscriptions.'
    : isZh
      ? '本政策说明学习数据的用途、存储方式，以及你可以提出的访问或删除请求。'
      : 'This policy explains how learning data is used and stored, and how to request access or deletion.';
  const otherDocument = isTerms
    ? { href: '/privacy', label: isZh ? '阅读隐私政策' : 'Read the Privacy Policy' }
    : { href: '/terms', label: isZh ? '阅读服务条款' : 'Read the Terms of Service' };

  const handleBack = () => {
    if (location.key !== 'default' || window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/', { replace: true });
  };

  const renderParagraph = (paragraph: string) => {
    const emailIndex = paragraph.indexOf(SUPPORT_EMAIL);
    if (emailIndex < 0) return paragraph;

    return (
      <>
        {paragraph.slice(0, emailIndex)}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
        >
          {SUPPORT_EMAIL}
        </a>
        {paragraph.slice(emailIndex + SUPPORT_EMAIL.length)}
      </>
    );
  };

  return (
    <div className="study-premium-bg min-h-screen bg-background text-foreground">
      <header className="sticky top-3 z-30 px-3 sm:px-4">
        <GlassSurface variant="bar" className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-5">
          <BrandMark />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </GlassSurface>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Button
          type="button"
          variant="ghost"
          className="-ml-3 mb-7 h-9 rounded-lg px-3"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {isZh ? '返回' : 'Back'}
        </Button>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
          <div className="min-w-0">
            <div className="max-w-3xl border-b border-border/25 pb-8">
              <Badge variant="secondary" className="mb-4 rounded-md">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {isZh ? '当前版本' : 'Current version'}
              </Badge>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{subtitle}</p>
            </div>

            <article className="mt-9 space-y-10">
              {sections.map((section, index) => (
                <section
                  key={section.title}
                  className="grid gap-3 border-b border-border/20 pb-9 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-5"
                >
                  <p className="study-number pt-0.5 text-sm text-primary" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <div>
                    <h2 className="text-xl font-semibold sm:text-2xl">
                      {isZh ? section.titleZh : section.title}
                    </h2>
                    <div className="mt-4 space-y-4 text-[15px] leading-7 text-muted-foreground">
                      {(isZh ? section.bodyZh : section.body).map((paragraph) => (
                        <p key={paragraph}>{renderParagraph(paragraph)}</p>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </article>

            <div className="mt-9 rounded-lg bg-[hsl(var(--surface-raised))]/35 px-4 py-4 text-sm leading-6 text-muted-foreground">
              {isZh
                ? '如本页面与应用内功能说明不一致，请以本页面和结账前显示的具体说明为准。'
                : 'If this page differs from in-app feature descriptions, this page and the specific pre-checkout disclosures control.'}
            </div>

            <Link
              to={otherDocument.href}
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {otherDocument.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl bg-[hsl(var(--paper-muted)/0.26)] px-5 py-5">
              <dl className="space-y-5 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {isZh ? '产品' : 'Product'}
                  </dt>
                  <dd className="mt-1.5 font-medium text-foreground">VocabDaily</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {isZh ? '生效日期' : 'Effective date'}
                  </dt>
                  <dd className="mt-1.5 text-foreground">{EFFECTIVE_DATE}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {isZh ? '联系邮箱' : 'Contact email'}
                  </dt>
                  <dd className="mt-1.5 break-words">
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </dd>
                </div>
              </dl>

              <nav
                className="mt-6 border-t border-border/25 pt-5"
                aria-label={isZh ? '法律文档' : 'Legal documents'}
              >
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {isZh ? '文档' : 'Documents'}
                </p>
                <div className="grid gap-1">
                  {[
                    { href: '/terms', label: isZh ? '服务条款' : 'Terms of Service' },
                    { href: '/privacy', label: isZh ? '隐私政策' : 'Privacy Policy' },
                  ].map((item) => {
                    const isCurrent = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={cn(
                          'rounded-md px-3 py-2 text-sm transition-colors',
                          isCurrent
                            ? 'bg-primary/10 font-semibold text-primary'
                            : 'text-muted-foreground hover:bg-muted/35 hover:text-foreground',
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

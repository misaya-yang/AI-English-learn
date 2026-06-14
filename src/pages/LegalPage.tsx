import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BrandMark } from '@/features/marketing/BrandMark';

interface LegalSection {
  title: string;
  titleZh: string;
  body: string[];
  bodyZh: string[];
}

const EFFECTIVE_DATE = '2026-06-13';
const CONTACT_PLACEHOLDER = '[support contact pending legal review]';

const TERMS_SECTIONS: LegalSection[] = [
  {
    title: 'Product status',
    titleZh: '产品状态',
    body: [
      'VocabDaily is an English-learning application for vocabulary review, daily practice, AI-assisted coaching, and exam preparation workflows.',
      'Some paid or Pro features shown in the product are not yet available. Checkout must stay disabled until a real payment provider, pricing configuration, and release checklist are complete.',
    ],
    bodyZh: [
      'VocabDaily 是一款英语学习应用，覆盖词汇复习、每日练习、AI 教练反馈和考试备考流程。',
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
      `Until final billing support text is approved, subscription questions should route to the contact placeholder: ${CONTACT_PLACEHOLDER}.`,
    ],
    bodyZh: [
      '在付费方案准备期间，免费版仍可使用。',
      '付费方案上线后，订阅价格、续费周期、取消方式、退款处理和方案限制必须在结账前清楚展示。',
      `在最终账单支持文案通过前，订阅问题应指向联系占位：${CONTACT_PLACEHOLDER}。`,
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
      'VocabDaily 可能使用账号信息、个人设置、学习目标、词书数据、复习记录、练习答案、错题和 AI 教练对话来提供学习体验。',
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
      'Learners should be able to clear local learning data from settings. Cloud deletion and export workflows require final operational ownership before production launch.',
    ],
    bodyZh: [
      '本应用支持本地/离线学习数据，也可能在配置后使用云端账号数据。',
      '学习者应能在设置中清除本地学习数据。云端删除和导出流程需要在生产发布前明确最终运营负责人。',
    ],
  },
  {
    title: 'Contact and review status',
    titleZh: '联系方式与复核状态',
    body: [
      `Privacy requests should route to the contact placeholder until a final support channel is approved: ${CONTACT_PLACEHOLDER}.`,
      'This policy is a product-ready draft and remains a release blocker until legal, security, and operations owners approve it.',
    ],
    bodyZh: [
      `隐私请求在最终支持渠道获批前，应指向联系占位：${CONTACT_PLACEHOLDER}。`,
      '本政策是产品可用草稿，在法务、安全和运营负责人批准前仍属于发布阻断项。',
    ],
  },
];

export default function LegalPage() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');
  const isTerms = location.pathname !== '/privacy';
  const sections = isTerms ? TERMS_SECTIONS : PRIVACY_SECTIONS;
  const title = isTerms
    ? isZh ? '服务条款' : 'Terms of Service'
    : isZh ? '隐私政策' : 'Privacy Policy';
  const subtitle = isZh
    ? '这是一份上线前可读草稿，用来替换注册流程中的占位链接。正式发布前仍需法务复核。'
    : 'This is a readable pre-launch draft replacing placeholder registration links. It still requires legal review before production release.';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-[hsl(var(--surface-raised))]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Button asChild variant="ghost" className="-ml-3 mb-6 h-9 rounded-md px-3">
          <Link to="/register">
            <ArrowLeft className="h-4 w-4" />
            {isZh ? '返回注册' : 'Back to register'}
          </Link>
        </Button>

        <Badge variant="secondary" className="mb-4 rounded-md">
          <ShieldCheck className="h-3.5 w-3.5" />
          {isZh ? '发布前需复核' : 'Pre-launch review required'}
        </Badge>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>

        <dl className="mt-6 grid gap-3 rounded-lg border border-border bg-[hsl(var(--surface-raised))] p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-foreground">{isZh ? '产品' : 'Product'}</dt>
            <dd className="mt-1 text-muted-foreground">VocabDaily</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">{isZh ? '生效日期' : 'Effective date'}</dt>
            <dd className="mt-1 text-muted-foreground">{EFFECTIVE_DATE}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-medium text-foreground">{isZh ? '联系占位' : 'Contact placeholder'}</dt>
            <dd className="mt-1 break-words text-muted-foreground">{CONTACT_PLACEHOLDER}</dd>
          </div>
        </dl>

        <article className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold tracking-tight">
                {isZh ? section.titleZh : section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
                {(isZh ? section.bodyZh : section.body).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </article>

        <div className="mt-10 rounded-lg border border-amber-300/70 bg-amber-50/70 p-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/[0.08] dark:text-amber-100">
          {isZh
            ? '发布阻断：这份文本必须在生产发布前由法务、安全和运营负责人复核。'
            : 'Release blocker: this copy must be reviewed by legal, security, and operations owners before production launch.'}
        </div>
      </main>
    </div>
  );
}

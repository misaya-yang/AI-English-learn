import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Lock, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  canUseContentCommercially,
  getBuiltInWordBookContentManifest,
} from '@/services/contentLicensing';
import {
  requireEnterpriseFeature,
  type EnterpriseFeature,
} from '@/services/enterpriseAccess';
import { isEnterpriseUiEnabled } from '@/features/enterprise/enterpriseUi';

const sections = [
  {
    id: 'members',
    label: 'Members',
    labelZh: '成员',
    body: 'Owners, admins, teachers, and learners.',
    bodyZh: '管理负责人、管理员、教师与学习者。',
  },
  {
    id: 'cohorts',
    label: 'Cohorts',
    labelZh: '班级',
    body: 'Teacher-led groups and roster boundaries.',
    bodyZh: '查看教师负责的学习组与成员范围。',
  },
  {
    id: 'assignments',
    label: 'Assignments',
    labelZh: '作业',
    body: 'Assigned packs, due dates, and evidence collection.',
    bodyZh: '管理已分配内容、截止时间与学习证据。',
  },
  {
    id: 'content',
    label: 'Content Packs',
    labelZh: '内容包',
    body: 'Licensed word books and future reading/listening packs.',
    bodyZh: '查看已授权词书及阅读、听力内容包。',
  },
  {
    id: 'audit',
    label: 'Audit',
    labelZh: '审计',
    body: 'Sensitive admin actions and entitlement changes.',
    bodyZh: '追踪敏感管理操作和权限变更。',
  },
] as const;

const lockedFeatures: Array<{ feature: EnterpriseFeature; label: string; labelZh: string }> = [
  { feature: 'assignments', label: 'Assignments', labelZh: '作业' },
  { feature: 'evidence_reports', label: 'Evidence reports', labelZh: '证据报告' },
  { feature: 'content_packs', label: 'Content packs', labelZh: '内容包' },
  { feature: 'audit', label: 'Audit', labelZh: '审计' },
  { feature: 'sso', label: 'SSO', labelZh: 'SSO' },
  { feature: 'scim', label: 'SCIM', labelZh: 'SCIM' },
];

const copy = {
  en: {
    title: 'Organization Workbench',
    summary: 'Enterprise operations start here: members, cohorts, assignments, licensed content, and audit readiness.',
    preview: 'Enterprise workspace',
    disabledTitle: 'Organization workspace is not available',
    disabledBody: 'This account is not connected to an organization workspace. You can continue individual learning or ask an organization administrator for access.',
    backToday: 'Continue individual learning',
    available: 'Available',
    requiresAccess: 'Requires organization access',
    featureState: 'Feature state',
    contentProvenance: 'Content provenance',
    commercialSafe: 'Commercial-safe packs',
    evidenceTitle: 'Learning evidence',
    evidenceBody: 'Review attempts, weak signals, and recovery work when evidence reporting is included for this workspace.',
    openEvidence: 'Open evidence',
  },
  zh: {
    title: '组织工作台',
    summary: '企业运营入口：成员、班级、作业、授权内容和审计准备。',
    preview: '企业工作区',
    disabledTitle: '当前账号暂未开放组织工作台',
    disabledBody: '当前账号尚未加入组织工作区。你仍可继续个人学习，或联系组织管理员申请访问权限。',
    backToday: '继续个人学习',
    available: '可用',
    requiresAccess: '需要组织授权',
    featureState: '功能状态',
    contentProvenance: '内容来源',
    commercialSafe: '可商用内容包',
    evidenceTitle: '学习证据',
    evidenceBody: '工作区包含证据报告权限时，可查看尝试记录、薄弱信号和补救任务。',
    openEvidence: '查看学习证据',
  },
} as const;

export default function OrganizationPage() {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh') ?? false;
  const t = copy[isZh ? 'zh' : 'en'];
  const enabled = isEnterpriseUiEnabled();
  const manifest = getBuiltInWordBookContentManifest();
  const safePacks = manifest.filter(canUseContentCommercially);

  if (!enabled) {
    return (
      <section
        className="max-w-2xl rounded-xl border border-border/70 bg-card px-5 py-6 sm:px-6 sm:py-7"
        aria-labelledby="organization-unavailable-title"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Building2 className="h-5 w-5" aria-hidden="true" />
        </div>
        <Badge variant="outline" className="mt-4 rounded-md">{t.preview}</Badge>
        <h1 id="organization-unavailable-title" className="mt-3 text-2xl font-semibold tracking-normal text-foreground">
          {t.disabledTitle}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{t.disabledBody}</p>
        <Button asChild className="mt-5">
          <Link to="/dashboard/today">{t.backToday}</Link>
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <header className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-3xl">
          <Badge variant="outline" className="rounded-md">
            {t.preview}
          </Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">{t.title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.summary}</p>
        </div>
        <div className="rounded-md border border-border/70 bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">{t.commercialSafe}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{safePacks.length} / {manifest.length}</p>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {sections.map((section) => (
          <article key={section.id} className="rounded-md border border-border/70 bg-card px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">{isZh ? section.labelZh : section.label}</h2>
                {isZh ? <p className="mt-0.5 text-xs text-muted-foreground">{section.label}</p> : null}
              </div>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm leading-5 text-muted-foreground">
              {isZh ? section.bodyZh : section.body}
            </p>
          </article>
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <section className="rounded-md border border-border/70 bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold text-foreground">{t.featureState}</h2>
          </div>
          <div className="divide-y divide-border">
            {lockedFeatures.map((item) => {
              const decision = requireEnterpriseFeature(item.feature, []);
              return (
                <div key={item.feature} className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{isZh ? item.labelZh : item.label}</p>
                    {isZh ? <p className="mt-0.5 text-xs text-muted-foreground">{item.label}</p> : null}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {decision.allowed ? t.available : t.requiresAccess}
                    </p>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {decision.allowed ? t.available : t.requiresAccess}
                  </Badge>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-md border border-border/70 bg-card px-4 py-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">{t.contentProvenance}</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {safePacks.length} / {manifest.length} {t.commercialSafe}
            </p>
            <div className="mt-3 space-y-2">
              {manifest.slice(0, 4).map((entry) => (
                <div key={entry.contentId} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-muted-foreground">{entry.name}</span>
                  <Badge variant={canUseContentCommercially(entry) ? 'secondary' : 'outline'}>
                    {entry.licenseId}
                  </Badge>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-border/70 bg-muted/25 px-4 py-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">{t.evidenceTitle}</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.evidenceBody}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/dashboard/evidence">{t.openEvidence}</Link>
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}

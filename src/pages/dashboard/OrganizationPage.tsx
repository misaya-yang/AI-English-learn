import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Building2, Lock, ShieldCheck } from 'lucide-react';
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
  { id: 'members', label: 'Members', labelZh: '成员', body: 'Owners, admins, teachers, and learners.' },
  { id: 'cohorts', label: 'Cohorts', labelZh: '班级', body: 'Teacher-led groups and roster boundaries.' },
  { id: 'assignments', label: 'Assignments', labelZh: '作业', body: 'Assigned packs, due dates, and evidence collection.' },
  { id: 'content', label: 'Content Packs', labelZh: '内容包', body: 'Licensed word books and future reading/listening packs.' },
  { id: 'audit', label: 'Audit', labelZh: '审计', body: 'Sensitive admin actions and entitlement changes.' },
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
    preview: 'Enterprise UI preview',
    disabledTitle: 'Enterprise workspace preview is disabled',
    disabledBody: 'Set VITE_ENTERPRISE_UI_ENABLED=true to expose this shell in local or staging navigation.',
    backToday: 'Back to Today',
    locked: 'Locked by server entitlement',
    featureState: 'Feature state',
    contentProvenance: 'Content provenance',
    commercialSafe: 'Commercial-safe packs',
    next: 'Next implementation cut',
    nextBody: 'Connect this shell to organization membership, assignment APIs, and evidence reports after the P0 migration is deployed.',
  },
  zh: {
    title: '组织工作台',
    summary: '企业运营入口：成员、班级、作业、授权内容和审计准备。',
    preview: '企业 UI 预览',
    disabledTitle: '企业工作台预览已关闭',
    disabledBody: '设置 VITE_ENTERPRISE_UI_ENABLED=true 后，可在本地或 staging 导航中展示这个壳。',
    backToday: '返回今日',
    locked: '由服务端授权锁定',
    featureState: '功能状态',
    contentProvenance: '内容来源',
    commercialSafe: '可商用内容包',
    next: '下一步实现',
    nextBody: 'P0 migration 部署后，把这个壳接到组织成员、作业 API 和证据报告。',
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
      <section className="max-w-2xl rounded-md border border-border/70 bg-card px-5 py-6">
        <Badge variant="outline">{t.preview}</Badge>
        <h1 className="mt-4 text-2xl font-semibold tracking-normal text-foreground">{t.disabledTitle}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.disabledBody}</p>
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
            <p className="mt-3 text-sm leading-5 text-muted-foreground">{section.body}</p>
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
                    <p className="mt-1 text-sm text-muted-foreground">{t.locked}</p>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {decision.allowed ? 'available' : decision.reason}
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
              <h2 className="text-base font-semibold text-foreground">{t.next}</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.nextBody}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/dashboard/evidence">
                {isZh ? '查看证据' : 'Open Evidence'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}

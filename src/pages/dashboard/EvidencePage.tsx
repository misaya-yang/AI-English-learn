import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2, ClipboardList, RotateCcw, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isEnterpriseUiEnabled } from '@/features/enterprise/enterpriseUi';
import { getLearningEvents, type LearningEventRecord } from '@/services/learningEvents';
import {
  buildRemediationFromAttempt,
  learningEventToSkillAttempt,
  type LearningRemediation,
  type SkillAttempt,
} from '@/services/skillAttempts';

const copy = {
  en: {
    title: 'Learning Evidence',
    summary: 'Attempts, weak signals, and recovery work generated from the current learning event stream.',
    attempts: 'Attempts',
    weakSignals: 'Weak signals',
    remediation: 'Recovery queue',
    orgEvidence: 'Org-scoped',
    noEvidence: 'No learning evidence yet',
    noEvidenceBody: 'Complete Today, Review, or Practice once and this report will start showing real evidence.',
    openToday: 'Open Today',
    openReview: 'Open Review',
    recentAttempts: 'Recent attempts',
    recoveryWork: 'Recovery work',
    noRecovery: 'No recovery items right now.',
    loading: 'Loading evidence...',
    failed: 'Evidence could not be loaded.',
    disabledLabel: 'Organization feature',
    disabledTitle: 'Learning evidence is not available for this workspace',
    disabledBody: 'This workspace does not currently include organization evidence reports. You can keep learning individually or ask your organization administrator about access.',
    backToday: 'Continue individual learning',
  },
  zh: {
    title: '学习证据',
    summary: '从当前学习事件流生成的尝试记录、薄弱信号和补救任务。',
    attempts: '尝试记录',
    weakSignals: '薄弱信号',
    remediation: '补救队列',
    orgEvidence: '组织范围',
    noEvidence: '还没有学习证据',
    noEvidenceBody: '完成一次今日、复习或练习后，这里会显示真实学习证据。',
    openToday: '打开今日',
    openReview: '打开复习',
    recentAttempts: '最近记录',
    recoveryWork: '补救任务',
    noRecovery: '现在没有补救项。',
    loading: '正在加载学习证据...',
    failed: '学习证据加载失败。',
    disabledLabel: '组织功能',
    disabledTitle: '当前工作区暂未开放学习证据',
    disabledBody: '当前工作区尚未包含组织级证据报告。你仍可继续个人学习，或联系组织管理员了解访问权限。',
    backToday: '继续个人学习',
  },
} as const;

const isAttemptSnapshot = (value: unknown): value is SkillAttempt => {
  if (!value || typeof value !== 'object') return false;
  const attempt = value as Partial<SkillAttempt>;
  return Boolean(
    attempt.id &&
    attempt.userId &&
    attempt.surface &&
    attempt.skill &&
    attempt.contentRefType &&
    attempt.contentRefId,
  );
};

const attemptFromEvent = (event: LearningEventRecord): SkillAttempt | null => {
  const snapshot = event.payload?.skillAttempt;
  if (isAttemptSnapshot(snapshot)) return snapshot;
  return learningEventToSkillAttempt(event);
};

const isWeakAttempt = (attempt: SkillAttempt): boolean =>
  (typeof attempt.accuracy === 'number' && attempt.accuracy < 0.75) || attempt.mistakeTags.length > 0;

const metricClass = 'rounded-md border border-border/70 bg-card px-4 py-3';
const EMPTY_EVENTS: LearningEventRecord[] = [];

type EvidenceState = {
  userId: string;
  status: 'loading' | 'ready' | 'failed';
  events: LearningEventRecord[];
};

function EvidenceMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof ClipboardList;
}) {
  return (
    <div className={metricClass}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-normal text-foreground">{value}</p>
    </div>
  );
}

export default function EvidencePage() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isZh = i18n.language?.startsWith('zh') ?? false;
  const t = copy[isZh ? 'zh' : 'en'];
  const enabled = isEnterpriseUiEnabled();
  const userId = user?.id || '';
  const [evidenceState, setEvidenceState] = useState<EvidenceState>({
    userId,
    status: 'loading',
    events: [],
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    getLearningEvents(userId, 30)
      .then((rows) => {
        if (!cancelled) {
          setEvidenceState({ userId, status: 'ready', events: rows });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEvidenceState({ userId, status: 'failed', events: [] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, userId]);

  const events = evidenceState.userId === userId ? evidenceState.events : EMPTY_EVENTS;
  const loading = evidenceState.userId !== userId || evidenceState.status === 'loading';
  const failed = evidenceState.userId === userId && evidenceState.status === 'failed';
  const attempts = useMemo(
    () => events.map(attemptFromEvent).filter((attempt): attempt is SkillAttempt => Boolean(attempt)),
    [events],
  );
  const weakAttempts = useMemo(() => attempts.filter(isWeakAttempt), [attempts]);
  const remediations = useMemo(
    () => attempts.map((attempt) => buildRemediationFromAttempt(attempt)).filter((item): item is LearningRemediation => Boolean(item)),
    [attempts],
  );
  const orgAttempts = attempts.filter((attempt) => attempt.scope === 'org').length;

  if (!enabled) {
    return (
      <section
        className="max-w-2xl rounded-xl border border-border/70 bg-card px-5 py-6 sm:px-6 sm:py-7"
        aria-labelledby="evidence-unavailable-title"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <Badge variant="outline" className="mt-4 rounded-md">{t.disabledLabel}</Badge>
        <h1 id="evidence-unavailable-title" className="mt-3 text-2xl font-semibold tracking-normal text-foreground">
          {t.disabledTitle}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{t.disabledBody}</p>
        <Button asChild className="mt-5">
          <Link to="/dashboard/today">{t.backToday}</Link>
        </Button>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="rounded-md border border-border/70 bg-card px-5 py-5 text-sm text-muted-foreground">
        {t.loading}
      </section>
    );
  }

  if (failed) {
    return (
      <section className="rounded-md border border-destructive/30 bg-destructive/5 px-5 py-5 text-sm text-destructive">
        {t.failed}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <header className="max-w-3xl">
        <p className="text-sm font-medium text-muted-foreground">VocabDaily Enterprise</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">{t.title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.summary}</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <EvidenceMetric label={t.attempts} value={attempts.length} icon={ClipboardList} />
        <EvidenceMetric label={t.weakSignals} value={weakAttempts.length} icon={AlertCircle} />
        <EvidenceMetric label={t.remediation} value={remediations.length} icon={RotateCcw} />
        <EvidenceMetric label={t.orgEvidence} value={orgAttempts} icon={CheckCircle2} />
      </section>

      {attempts.length === 0 ? (
        <section className="rounded-md border border-dashed border-border bg-muted/25 px-5 py-6">
          <h2 className="text-lg font-semibold text-foreground">{t.noEvidence}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t.noEvidenceBody}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/dashboard/today">{t.openToday}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/dashboard/review">{t.openReview}</Link>
            </Button>
          </div>
        </section>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <section className="rounded-md border border-border/70 bg-card">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-base font-semibold text-foreground">{t.recentAttempts}</h2>
            </div>
            <div className="divide-y divide-border">
              {attempts.slice(0, 8).map((attempt) => (
                <div key={attempt.id} className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{attempt.contentRefId}</p>
                      <Badge variant="outline">{attempt.surface}</Badge>
                      <Badge variant="secondary">{attempt.skill}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{attempt.subskill || attempt.contentRefType}</p>
                    {attempt.mistakeTags.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {attempt.mistakeTags.map((tag) => (
                          <span key={tag} className="rounded-md bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {typeof attempt.accuracy === 'number' ? `${Math.round(attempt.accuracy * 100)}%` : '-'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{attempt.scope}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-border/70 bg-card">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-base font-semibold text-foreground">{t.recoveryWork}</h2>
            </div>
            {remediations.length === 0 ? (
              <p className="px-4 py-5 text-sm text-muted-foreground">{t.noRecovery}</p>
            ) : (
              <div className="divide-y divide-border">
                {remediations.slice(0, 6).map((item) => (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-foreground">{item.contentRefId}</p>
                      <Badge variant="outline">{item.targetSurface}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-muted-foreground">{item.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

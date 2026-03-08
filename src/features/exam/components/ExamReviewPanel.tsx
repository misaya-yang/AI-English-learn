import { BookOpen, Brain } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ISSUE_LABELS } from '@/features/exam/constants';
import { EmptyKickoffCard, ScoreCell } from '@/features/exam/components/ExamPrepShared';
import { cn } from '@/lib/utils';
import type { AiFeedback } from '@/types/examContent';

interface ExamReviewPanelProps {
  feedback: AiFeedback | null;
  feedbackLatencyMs: number | null;
  latestNextActions: string[];
  isBusy: boolean;
  onGenerateMicroLesson: () => Promise<void>;
  onJumpToVocabulary: () => void;
  onReturnToDraft: () => void;
  onQuickStart: () => Promise<void>;
}

export function ExamReviewPanel({
  feedback,
  feedbackLatencyMs,
  latestNextActions,
  isBusy,
  onGenerateMicroLesson,
  onJumpToVocabulary,
  onReturnToDraft,
  onQuickStart,
}: ExamReviewPanelProps) {
  if (!feedback) {
    return <EmptyKickoffCard onQuickStart={() => void onQuickStart()} />;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[22px] border border-border/70 bg-background/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">Latest feedback</p>
            <h3 className="mt-2 text-lg font-semibold">Overall Band {feedback.scores.overallBand.toFixed(1)}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full">Provider: {feedback.provider}</Badge>
            {(feedbackLatencyMs || feedback.latencyMs) && (
              <Badge
                variant="outline"
                className={cn(
                  'rounded-full',
                  (feedbackLatencyMs || feedback.latencyMs)! > 8000 ? 'border-amber-400/60 text-amber-500' : 'border-emerald-400/60 text-emerald-500',
                )}
              >
                Latency {(feedbackLatencyMs || feedback.latencyMs)}ms
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-5">
          <ScoreCell title="Task" value={feedback.scores.taskResponse} />
          <ScoreCell title="Coherence" value={feedback.scores.coherenceCohesion} />
          <ScoreCell title="Lexical" value={feedback.scores.lexicalResource} />
          <ScoreCell title="Grammar" value={feedback.scores.grammaticalRangeAccuracy} />
          <ScoreCell title="Overall" value={feedback.scores.overallBand} highlight />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-[22px] border border-border/70 bg-background/35 p-4">
          <p className="text-sm font-semibold">核心问题</p>
          <div className="mt-3 space-y-2">
            {feedback.issues.length === 0 ? (
              <p className="text-sm text-muted-foreground">未发现明显问题，建议继续做下一次模拟巩固稳定性。</p>
            ) : (
              feedback.issues.map((issue, index) => (
                <div key={`${issue.tag}-${index}`} className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <p className="text-sm font-medium">[{ISSUE_LABELS[issue.tag] || issue.tag}] {issue.message}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{issue.suggestion}</p>
                </div>
              ))
            )}
          </div>

          {feedback.rewrites.length > 0 && (
            <>
              <Separator className="my-4" />
              <p className="text-sm font-semibold">句级改写建议</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                {feedback.rewrites.map((rewrite, index) => (
                  <li key={`${rewrite}-${index}`}>{rewrite}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[22px] border border-border/70 bg-background/35 p-4">
            <p className="text-sm font-semibold">下一步动作</p>
            <div className="mt-3 space-y-2">
              {latestNextActions.length === 0 ? (
                <p className="text-sm text-muted-foreground">完成更多评分后，这里会给出更具体的下一步动作。</p>
              ) : (
                latestNextActions.map((action, index) => (
                  <div key={`${action}-${index}`} className="rounded-xl border border-border/60 bg-background/50 px-3 py-2 text-sm text-muted-foreground">
                    {action}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[22px] border border-emerald-500/20 bg-emerald-500/[0.08] p-4">
            <p className="text-sm font-semibold text-emerald-500">把这次错因立即转成动作</p>
            <div className="mt-3 grid gap-2">
              <Button onClick={() => void onGenerateMicroLesson()} disabled={isBusy || !feedback}>
                <Brain className="mr-1.5 h-4 w-4" /> 一键错题转课程
              </Button>
              <Button variant="outline" onClick={onJumpToVocabulary}>
                <BookOpen className="mr-1.5 h-4 w-4" /> 跳转词库补强
              </Button>
              <Button variant="ghost" onClick={onReturnToDraft}>
                返回草稿再练一轮
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

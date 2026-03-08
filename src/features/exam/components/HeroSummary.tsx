import { ArrowUpRight, BookOpen, Crown, Flame, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuotaRing, WorkspaceLead } from '@/features/exam/components/ExamPrepShared';
import { cn } from '@/lib/utils';
import type { PlanTier } from '@/types/examContent';
import type { TaskType } from '@/features/exam/types';

interface HeroSummaryProps {
  plan: PlanTier;
  streakDays: number;
  thisWeekRuns: number;
  currentBand: number;
  targetBand: number;
  targetProgress: number;
  nextActionLabel: string;
  selectedTrackTitle: string | null;
  selectedUnitTitle: string | null;
  selectedUnitProgress: number;
  taskType: TaskType;
  remainingQuota: {
    aiAdvancedFeedbackPerDay: number;
    simItemsPerDay: number;
    microLessonsPerDay: number;
  };
  quotaTotal: {
    aiAdvancedFeedbackPerDay: number;
    simItemsPerDay: number;
    microLessonsPerDay: number;
  };
  onContinueWriting: () => void;
  onStartSimulation: () => void;
  onShowWeakness: () => void;
  isBusy: boolean;
}

export function HeroSummary({
  plan,
  streakDays,
  thisWeekRuns,
  currentBand,
  targetBand,
  targetProgress,
  nextActionLabel,
  selectedTrackTitle,
  selectedUnitTitle,
  selectedUnitProgress,
  taskType,
  remainingQuota,
  quotaTotal,
  onContinueWriting,
  onStartSimulation,
  onShowWeakness,
  isBusy,
}: HeroSummaryProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[28px] border border-border/70 bg-card/90 p-4 sm:p-5 lg:p-6"
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[28%] bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(34,211,238,0.02))] xl:block" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn('rounded-full border px-2.5 py-1 text-xs', plan === 'pro' ? 'bg-emerald-600 text-white' : '')}>
              {plan === 'pro' ? <Crown className="mr-1 h-3.5 w-3.5" /> : <BookOpen className="mr-1 h-3.5 w-3.5" />}
              Plan {plan.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              <Flame className="mr-1 h-3.5 w-3.5" /> 连续学习 {streakDays} 天
            </Badge>
            <Badge variant="outline" className="rounded-full">
              <TrendingUp className="mr-1 h-3.5 w-3.5" /> 本周模拟 {thisWeekRuns} 次
            </Badge>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_300px]">
            <div className="rounded-[24px] border border-border/70 bg-background/40 p-5">
              <WorkspaceLead
                eyebrow="Premium IELTS workspace"
                title="考试冲分 · IELTS Exam Prep"
                body="这不是功能墙，而是一条完整冲分路径：先确定当前回合，再进入写作工作台，最后根据反馈做补救和再练。"
              />

              <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">Target band</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums">
                        {currentBand ? currentBand.toFixed(1) : '0.0'}
                        <span className="mx-2 text-muted-foreground">/</span>
                        {targetBand.toFixed(1)}
                      </p>
                    </div>
                    <span className="rounded-full border border-emerald-500/25 bg-emerald-500/[0.12] px-3 py-1 text-sm font-semibold text-emerald-500">
                      {targetProgress}%
                    </span>
                  </div>
                  <Progress value={targetProgress} className="mt-4 h-2 [&>[data-slot=progress-indicator]]:bg-emerald-500" />
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{nextActionLabel}</p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">Current route</p>
                  <p className="mt-2 text-base font-semibold">{selectedTrackTitle || '先选择一个目标轨道'}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedUnitTitle || '选择单元后，会在这里给出本轮训练重点。'}
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>当前单元完成度</span>
                      <span className="font-medium text-foreground">{selectedUnitProgress}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>本轮建议任务</span>
                      <span className="font-medium text-foreground">{taskType === 'task1' ? 'Task 1' : 'Task 2'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={onContinueWriting} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  继续今日写作
                </Button>
                <Button variant="outline" onClick={onStartSimulation} disabled={isBusy}>
                  <Target className="mr-1.5 h-4 w-4" /> 开始一次完整仿真
                </Button>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={onShowWeakness}>
                  查看弱项图谱
                </Button>
              </div>
            </div>

            <div className="rounded-[24px] border border-border/70 bg-background/30 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">Quota HUD</p>
              <div className="mt-4 space-y-3">
                <QuotaRing
                  label="高级评分反馈"
                  remaining={remainingQuota.aiAdvancedFeedbackPerDay}
                  total={quotaTotal.aiAdvancedFeedbackPerDay}
                  hint="结构化四维评分会写入你的 Band 轨迹。"
                />
                <QuotaRing
                  label="仿真题生成"
                  remaining={remainingQuota.simItemsPerDay}
                  total={quotaTotal.simItemsPerDay}
                  hint="优先把配额用在完整写作回合，而不是零散试题。"
                />
                <QuotaRing
                  label="错因补救微课"
                  remaining={remainingQuota.microLessonsPerDay}
                  total={quotaTotal.microLessonsPerDay}
                  hint="把评分结果直接转成 5 分钟补救动作。"
                />
              </div>

              <Link to="/pricing" className="mt-4 block">
                <Button variant="outline" className="w-full justify-between">
                  升级会员解锁完整冲分能力
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

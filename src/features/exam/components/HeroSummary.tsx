import { ArrowUpRight, BookOpen, Crown, Flame, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
      className="relative overflow-hidden rounded-xl border border-border bg-card text-card-foreground p-4 sm:p-5 lg:p-6"
    >
      <div className="space-y-4">
        {/* Status badges row */}
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

        {/* Page title */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">考试冲分 · IELTS Exam Prep</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            先确定当前回合，再进入写作工作台，最后根据反馈做补救和再练。
          </p>
        </div>

        {/* Key metrics row */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Band progress */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">目标 Band</p>
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

          {/* Current route */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">当前路线</p>
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

        {/* Quota pill strip */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">今日用量：</span>
          <QuotaPill
            label="评分反馈"
            remaining={remainingQuota.aiAdvancedFeedbackPerDay}
            total={quotaTotal.aiAdvancedFeedbackPerDay}
          />
          <QuotaPill
            label="仿真题"
            remaining={remainingQuota.simItemsPerDay}
            total={quotaTotal.simItemsPerDay}
          />
          <QuotaPill
            label="补救微课"
            remaining={remainingQuota.microLessonsPerDay}
            total={quotaTotal.microLessonsPerDay}
          />
          <Link to="/pricing">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
              升级会员 <ArrowUpRight className="ml-0.5 h-3 w-3" />
            </Button>
          </Link>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
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
    </motion.header>
  );
}

function QuotaPill({ label, remaining, total }: { label: string; remaining: number; total: number }) {
  const safeTotal = Math.max(1, total);
  const isEmpty = remaining === 0;
  return (
    <span
      className={cn(
        'rounded-full border px-2.5 py-0.5 text-xs font-medium',
        isEmpty
          ? 'border-rose-400/40 bg-rose-500/[0.08] text-rose-500'
          : 'border-emerald-400/40 bg-emerald-500/[0.08] text-emerald-600',
      )}
    >
      {label} {remaining}/{safeTotal}
    </span>
  );
}

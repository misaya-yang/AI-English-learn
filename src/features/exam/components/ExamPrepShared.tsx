import { useMemo } from 'react';
import { Loader2, PlayCircle } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { AiFeedback } from '@/types/examContent';
import type { LoadingStage } from '@/features/exam/types';

const scoreColor = (value: number): string => {
  if (value >= 7) return 'text-[hsl(var(--success))]';
  if (value >= 6) return 'text-[hsl(var(--warning))]';
  return 'text-[hsl(var(--danger))]';
};

export function QuotaRing({
  label,
  remaining,
  total,
  hint,
}: {
  label: string;
  remaining: number;
  total: number;
  hint: string;
}) {
  const safeTotal = Math.max(1, total);
  const percent = Math.max(0, Math.min(100, Math.round((remaining / safeTotal) * 100)));

  return (
    <div className="rounded-lg border border-border/70 bg-background/40 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground/80">{label}</p>
          <p className="mt-1 text-lg font-semibold">
            {remaining}
            <span className="ml-1 text-xs font-normal text-muted-foreground">/ {safeTotal}</span>
          </p>
        </div>
        <span className="rounded-md border border-[hsl(var(--accent-exam)/0.28)] bg-[hsl(var(--accent-exam)/0.12)] px-2 py-1 text-[11px] font-medium text-foreground">
          {percent}%
        </span>
      </div>
      <Progress value={percent} className="mt-3 h-1.5 bg-muted/70 [&>[data-slot=progress-indicator]]:bg-[hsl(var(--accent-exam))]" />
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{hint}</p>
    </div>
  );
}

export function ScoreCell({
  title,
  value,
  highlight = false,
}: {
  title: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-md border border-border/70 bg-card/60 px-3 py-2 text-center',
        highlight && 'border-[hsl(var(--accent-exam)/0.45)] bg-[hsl(var(--accent-exam)/0.10)]',
      )}
    >
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className={cn('text-xl font-semibold tabular-nums', scoreColor(value))}>{value.toFixed(1)}</p>
    </div>
  );
}

export function EmptyKickoffCard({ onQuickStart }: { onQuickStart: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-primary/30 bg-primary/[0.05] p-4 text-sm">
      <p className="font-semibold text-primary">还没有问题记录</p>
      <p className="mt-1 text-muted-foreground">先做 1 次写作反馈，这里会显示主要问题和下一组练习。</p>
      <Button className="mt-3" size="sm" onClick={onQuickStart}>
        <PlayCircle className="mr-1.5 h-4 w-4" />
        开始第一次练习
      </Button>
    </div>
  );
}

export function LoadingPipeline({ stage }: { stage: LoadingStage }) {
  if (stage === 'idle') return null;

  const steps: Array<{ id: LoadingStage; label: string; detail: string }> = [
    { id: 'simulating', label: '准备题目中', detail: '正在准备 IELTS 风格题目...' },
    { id: 'outlining', label: '构建提纲中', detail: '正在整理段落结构...' },
    { id: 'vocab', label: '词汇改写中', detail: '正在识别低阶表达并整理替换词...' },
    { id: 'tutoring', label: '整理修改点中', detail: '正在根据你的草稿整理修改点...' },
    { id: 'grading', label: '评分中', detail: '正在按 IELTS 标准评分...' },
    { id: 'micro', label: '准备练习中', detail: '正在根据问题准备 5 分钟练习...' },
  ];

  const activeIndex = Math.max(0, steps.findIndex((item) => item.id === stage));
  const progress = Math.round(((activeIndex + 1) / steps.length) * 100);

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/[0.06] p-4">
      <div className="flex items-start gap-3">
        <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium text-primary">{steps[activeIndex]?.label ?? '处理中'}</p>
          <p className="text-sm text-muted-foreground">{steps[activeIndex]?.detail ?? '正在处理请求...'}</p>
          <Progress value={progress} className="mt-3 h-2 bg-primary/[0.15] [&>[data-slot=progress-indicator]]:bg-primary" />
        </div>
      </div>
    </div>
  );
}

export function MiniTrendChart({ history }: { history: AiFeedback[] }) {
  const trendData = useMemo(() => {
    return [...history]
      .slice(0, 7)
      .reverse()
      .map((item, index) => ({
        round: index + 1,
        band: Number(item.scores.overallBand.toFixed(1)),
      }));
  }, [history]);

  if (trendData.length < 2) {
    return <p className="text-xs text-muted-foreground">完成 2 次以上反馈后展示 Band 趋势。</p>;
  }

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
          <XAxis dataKey="round" tickLine={false} axisLine={false} />
          <YAxis domain={[4.5, 9]} tickCount={5} tickLine={false} axisLine={false} width={30} />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              borderColor: 'hsl(var(--accent-exam) / 0.35)',
              background: 'hsl(var(--background))',
            }}
          />
          <Line
            type="monotone"
            dataKey="band"
            stroke="hsl(var(--accent-exam))"
            strokeWidth={2.4}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WorkspaceLead({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground/80">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

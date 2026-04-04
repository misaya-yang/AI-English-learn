import { useMemo } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { AiFeedback } from '@/types/examContent';
import type { LoadingStage } from '@/features/exam/types';

const scoreColor = (value: number): string => {
  if (value >= 7) return 'text-emerald-500';
  if (value >= 6) return 'text-amber-500';
  return 'text-rose-500';
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
    <div className="rounded-2xl border border-border/70 bg-background/40 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">{label}</p>
          <p className="mt-1 text-lg font-semibold">
            {remaining}
            <span className="ml-1 text-xs font-normal text-muted-foreground">/ {safeTotal}</span>
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/[0.10] px-2 py-1 text-[11px] font-medium text-emerald-500">
          {percent}%
        </span>
      </div>
      <Progress value={percent} className="mt-3 h-1.5 bg-muted/70 [&>[data-slot=progress-indicator]]:bg-emerald-500" />
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
        'rounded-xl border border-border/70 bg-card/60 px-3 py-2 text-center',
        highlight && 'border-emerald-400/60 bg-emerald-500/10',
      )}
    >
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className={cn('text-xl font-semibold tabular-nums', scoreColor(value))}>{value.toFixed(1)}</p>
    </div>
  );
}

export function EmptyKickoffCard({ onQuickStart }: { onQuickStart: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-emerald-400/40 bg-emerald-500/[0.06] p-4 text-sm">
      <p className="font-semibold text-emerald-500">还没有错因图谱</p>
      <p className="mt-1 text-muted-foreground">先做 1 次写作反馈，我们会自动生成你的四维弱项分析和下一步冲分建议。</p>
      <Button className="mt-3" size="sm" onClick={onQuickStart}>
        <Sparkles className="mr-1.5 h-4 w-4" />
        立即开始首次冲分
      </Button>
    </div>
  );
}

export function LoadingPipeline({ stage }: { stage: LoadingStage }) {
  if (stage === 'idle') return null;

  const steps: Array<{ id: LoadingStage; label: string; detail: string }> = [
    { id: 'simulating', label: '生成题目中', detail: '正在构造 IELTS 官方风格仿真题...' },
    { id: 'outlining', label: '构建提纲中', detail: '正在梳理可执行的段落结构...' },
    { id: 'vocab', label: '词汇升级中', detail: '正在识别低阶表达并给出替换建议...' },
    { id: 'tutoring', label: '教练响应中', detail: '正在结合你的草稿生成可执行建议...' },
    { id: 'grading', label: '评分分析中', detail: '正在按 IELTS 四维标准评分并生成证据...' },
    { id: 'micro', label: '生成补救课中', detail: '正在根据错因生成 5 分钟微课...' },
  ];

  const activeIndex = Math.max(0, steps.findIndex((item) => item.id === stage));
  const progress = Math.round(((activeIndex + 1) / steps.length) * 100);

  return (
    <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/[0.08] p-4">
      <div className="flex items-start gap-3">
        <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-emerald-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-emerald-500">{steps[activeIndex]?.label ?? '处理中'}</p>
          <p className="text-sm text-muted-foreground">{steps[activeIndex]?.detail ?? '正在处理请求...'}</p>
          <Progress value={progress} className="mt-3 h-2 bg-emerald-500/20 [&>[data-slot=progress-indicator]]:bg-emerald-500" />
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
              borderColor: 'hsl(161 84% 40% / 0.35)',
              background: 'var(--background)',
            }}
          />
          <Line
            type="monotone"
            dataKey="band"
            stroke="#10b981"
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
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

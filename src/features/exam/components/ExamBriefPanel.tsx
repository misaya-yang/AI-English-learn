import { Gauge, RefreshCw, Target, Timer } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getExamUnitTitle } from '@/features/exam/examDisplayCopy';
import type { PromptDifficulty, TaskType } from '@/features/exam/types';
import type { ContentUnit, ExamItem } from '@/types/examContent';

interface ExamBriefPanelProps {
  promptTopic: string;
  onPromptTopicChange: (value: string) => void;
  promptDifficulty: PromptDifficulty;
  onPromptDifficultyChange: (value: PromptDifficulty) => void;
  onGeneratePrompt: () => void;
  onGenerateSimulation: () => Promise<void>;
  onOpenDraft: () => void;
  isBusy: boolean;
  simItem: ExamItem | null;
  writingPrompt: string;
  taskType: TaskType;
  selectedUnit: ContentUnit | null;
  selectedTrackTitle: string | null;
  unitObjectives: string[];
  isSimulationMode: boolean;
  simulationTotalSec: number;
  simulationRemainingSec: number;
  formatSeconds: (seconds: number) => string;
}

export function ExamBriefPanel({
  promptTopic,
  onPromptTopicChange,
  promptDifficulty,
  onPromptDifficultyChange,
  onGeneratePrompt,
  onGenerateSimulation,
  onOpenDraft,
  isBusy,
  simItem,
  writingPrompt,
  taskType,
  selectedUnit,
  selectedTrackTitle,
  unitObjectives,
  isSimulationMode,
  simulationTotalSec,
  simulationRemainingSec,
  formatSeconds,
}: ExamBriefPanelProps) {
  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            value={promptTopic}
            onChange={(event) => onPromptTopicChange(event.target.value)}
            placeholder="输入话题，可留空"
            className="h-10 rounded-xl bg-background/60 md:flex-1"
          />
          <Select value={promptDifficulty} onValueChange={(value) => onPromptDifficultyChange(value as PromptDifficulty)}>
            <SelectTrigger className="liquid-glass-control h-10 md:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">基础</SelectItem>
              <SelectItem value="medium">标准</SelectItem>
              <SelectItem value="hard">进阶</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onGeneratePrompt} disabled={isBusy} variant="glass" className="h-10 rounded-full md:w-[130px]">
            <RefreshCw className="mr-1.5 h-4 w-4" /> 随机题
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void onGenerateSimulation()} disabled={isBusy} variant="glassPrimary" className="rounded-full">
            <Target className="mr-1.5 h-4 w-4" /> 准备仿真题
          </Button>
          <Button variant="glass" className="rounded-full" onClick={onOpenDraft}>
            开始写作
          </Button>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground/80">当前题目</p>
              <p className="mt-2 text-base font-semibold">{simItem ? '当前为仿真题模式' : '当前为手动训练模式'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-md">
                <Gauge className="mr-1 h-3 w-3" />
                {taskType === 'task1' ? '小作文' : '大作文'}
              </Badge>
              {simItem?.attribution && <Badge variant="outline" className="rounded-md">{simItem.attribution}</Badge>}
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-foreground/90">{simItem?.prompt || writingPrompt || '先准备题目或选择单元。'}</p>
        </div>

        {isSimulationMode && (
          <div className="rounded-2xl border border-[hsl(var(--accent-exam)/0.32)] bg-[hsl(var(--accent-exam)/0.08)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">仿真计时进行中</p>
                <p className="text-xs text-muted-foreground">{taskType === 'task1' ? '小作文 20 分钟' : '大作文 40 分钟'}</p>
              </div>
              <Badge className="rounded-md bg-[hsl(var(--accent-exam)/0.16)] text-foreground hover:bg-[hsl(var(--accent-exam)/0.20)]">
                <Timer className="mr-1 h-3.5 w-3.5" /> {formatSeconds(simulationRemainingSec)}
              </Badge>
            </div>
            <Progress
              value={simulationTotalSec ? Math.round(((simulationTotalSec - simulationRemainingSec) / simulationTotalSec) * 100) : 0}
              className="mt-3 h-2 [&>[data-slot=progress-indicator]]:bg-[hsl(var(--accent-exam))]"
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/35 p-4">
        <p className="text-[11px] font-medium text-muted-foreground/80">本轮目标</p>
        <p className="mt-2 text-base font-semibold">{selectedUnit ? getExamUnitTitle(selectedUnit) : '先从左侧选择一个单元'}</p>
        <p className="mt-1 text-sm text-muted-foreground">{selectedTrackTitle || '系统会按目标 Band 自动关联轨道。'}</p>
        {unitObjectives.length > 0 && (
          <div className="mt-4 space-y-2">
            {unitObjectives.map((objective, index) => (
              <div key={`${objective}-${index}`} className="rounded-md border border-border/60 bg-background/50 px-3 py-2 text-sm text-muted-foreground">
                {objective}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

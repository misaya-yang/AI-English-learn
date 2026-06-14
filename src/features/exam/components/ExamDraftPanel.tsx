import { Bot, ClipboardCheck, ListChecks, Loader2, PenLine } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { LoadingStage, TaskType, ToolPanel } from '@/features/exam/types';
import type { VocabUpgradeSuggestion, WritingOutlineResult } from '@/services/aiExamCoach';

interface ExamDraftPanelProps {
  taskType: TaskType;
  activeWordCount: number;
  autosavedAt: string | null;
  writingPrompt: string;
  writingAnswer: string;
  onWritingAnswerChange: (value: string) => void;
  onSubmitWriting: () => Promise<void>;
  isBusy: boolean;
  loadingStage: LoadingStage;
  toolPanel?: ToolPanel;
  onToolPanelChange: (value: ToolPanel | undefined) => void;
  outline: WritingOutlineResult | null;
  onBuildOutline: () => void;
  vocabSuggestions: VocabUpgradeSuggestion[];
  onEnhanceVocabulary: () => void;
  tutorQuestion: string;
  onTutorQuestionChange: (value: string) => void;
  tutorReply: string;
  onAskTutor: () => Promise<void>;
  onBackToBrief: () => void;
}

export function ExamDraftPanel({
  taskType,
  activeWordCount,
  autosavedAt,
  writingPrompt,
  writingAnswer,
  onWritingAnswerChange,
  onSubmitWriting,
  isBusy,
  loadingStage,
  toolPanel,
  onToolPanelChange,
  outline,
  onBuildOutline,
  vocabSuggestions,
  onEnhanceVocabulary,
  tutorQuestion,
  onTutorQuestionChange,
  tutorReply,
  onAskTutor,
  onBackToBrief,
}: ExamDraftPanelProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border/70 bg-background/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground/80">题目已就绪</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {taskType === 'task1' ? '小作文目标 >=150 词' : '大作文目标 >=250 词'} · {activeWordCount} 词 · {autosavedAt ? `自动保存 ${autosavedAt}` : '未保存'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onBuildOutline} disabled={isBusy}>
              <ListChecks className="mr-1.5 h-4 w-4" /> 提纲
            </Button>
            <Button variant="outline" onClick={onEnhanceVocabulary} disabled={isBusy}>
              <PenLine className="mr-1.5 h-4 w-4" /> 词汇改写
            </Button>
            <Button variant="outline" onClick={() => onToolPanelChange('coach')}>
              <Bot className="mr-1.5 h-4 w-4" /> 答疑
            </Button>
          </div>
        </div>
        <Separator className="my-4" />
        <p className="text-sm leading-7 text-foreground/90">{writingPrompt || '先回到策略面板准备题目或选择单元。'}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>正文</Label>
          <span className="text-xs text-muted-foreground">Ctrl/Cmd + Enter 快速提交评分</span>
        </div>
        <Textarea
          value={writingAnswer}
          onChange={(event) => onWritingAnswerChange(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !isBusy) {
              event.preventDefault();
              void onSubmitWriting();
            }
          }}
          className="min-h-[320px] bg-background/70 leading-8"
          placeholder="在这里写 IELTS 作文正文..."
        />
      </div>

      <Accordion
        type="single"
        collapsible
        value={toolPanel}
        onValueChange={(value) => onToolPanelChange((value || undefined) as ToolPanel | undefined)}
        className="rounded-lg border border-border/70 bg-background/35 px-4"
      >
        <AccordionItem value="outline" className="border-border/60">
          <AccordionTrigger className="py-4 text-base">提纲</AccordionTrigger>
          <AccordionContent>
            {outline ? (
              <div className="space-y-3">
                <div className="rounded-md border border-border/60 bg-background/50 p-3 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">Intro:</span> {outline.intro}</p>
                  <p className="mt-2"><span className="font-medium text-foreground">Body 1:</span> {outline.body1}</p>
                  <p className="mt-2"><span className="font-medium text-foreground">Body 2:</span> {outline.body2}</p>
                  <p className="mt-2"><span className="font-medium text-foreground">Conclusion:</span> {outline.conclusion}</p>
                </div>
                <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                  {outline.checklist.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">先根据当前题目整理一版可执行提纲。</p>
                <Button size="sm" onClick={onBuildOutline} disabled={isBusy}>
                  整理提纲
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="vocab" className="border-border/60">
          <AccordionTrigger className="py-4 text-base">词汇改写</AccordionTrigger>
          <AccordionContent>
            {vocabSuggestions.length > 0 ? (
              <div className="space-y-2">
                {vocabSuggestions.map((item, index) => (
                  <div key={`${item.from}-${index}`} className="rounded-md border border-border/60 bg-background/50 p-3">
                    <p className="text-sm">
                      <span className="font-medium">{item.from}</span>
                      <span className="mx-1.5 text-muted-foreground">→</span>
                      <span className="font-medium text-emerald-500">{item.to}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.rationale}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.example}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">先写出草稿，再抽取低阶表达做改写建议。</p>
                <Button size="sm" onClick={onEnhanceVocabulary} disabled={isBusy}>
                  词汇改写
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="coach" className="border-none">
          <AccordionTrigger className="py-4 text-base">写作答疑</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <Textarea
              value={tutorQuestion}
              onChange={(event) => onTutorQuestionChange(event.target.value)}
              className="min-h-[96px] bg-background/70"
              placeholder="例如：我的论证不够深入，如何改到 6.5+？"
            />
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => void onAskTutor()} disabled={isBusy}>
                {loadingStage === 'tutoring' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                提交问题
              </Button>
            </div>
            {tutorReply && (
              <div className="whitespace-pre-wrap rounded-md border border-border/60 bg-background/50 px-3 py-3 text-sm leading-7 text-foreground/90">
                {tutorReply}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => void onSubmitWriting()}
          disabled={isBusy}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {loadingStage === 'grading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardCheck className="mr-2 h-4 w-4" />}
          查看评分反馈
        </Button>
        <Button variant="outline" onClick={onBackToBrief}>
          回到策略
        </Button>
      </div>
    </div>
  );
}

import { Bot, Loader2, Sparkles, WandSparkles } from 'lucide-react';

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
      <div className="rounded-[22px] border border-border/70 bg-background/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] tracking-wide text-muted-foreground/80">题目已就绪</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {taskType === 'task1' ? 'Task 1 目标 >=150 词' : 'Task 2 目标 >=250 词'} · {activeWordCount} words · {autosavedAt ? `自动保存 ${autosavedAt}` : '未保存'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onBuildOutline} disabled={isBusy}>
              <WandSparkles className="mr-1.5 h-4 w-4" /> 提纲
            </Button>
            <Button variant="outline" onClick={onEnhanceVocabulary} disabled={isBusy}>
              <Sparkles className="mr-1.5 h-4 w-4" /> 词汇升级
            </Button>
            <Button variant="outline" onClick={() => onToolPanelChange('coach')}>
              <Bot className="mr-1.5 h-4 w-4" /> 问教练
            </Button>
          </div>
        </div>
        <Separator className="my-4" />
        <p className="text-sm leading-7 text-foreground/90">{writingPrompt || '先回到策略面板生成题目或选择单元。'}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Your Answer</Label>
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
          placeholder="Write your IELTS response here..."
        />
      </div>

      <Accordion
        type="single"
        collapsible
        value={toolPanel}
        onValueChange={(value) => onToolPanelChange((value || undefined) as ToolPanel | undefined)}
        className="rounded-[22px] border border-border/70 bg-background/35 px-4"
      >
        <AccordionItem value="outline" className="border-border/60">
          <AccordionTrigger className="py-4 text-base">Outline Builder</AccordionTrigger>
          <AccordionContent>
            {outline ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-border/60 bg-background/50 p-3 text-sm text-muted-foreground">
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
                <p className="text-sm text-muted-foreground">先根据当前题目生成一版可执行提纲。</p>
                <Button size="sm" onClick={onBuildOutline} disabled={isBusy}>
                  生成提纲
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="vocab" className="border-border/60">
          <AccordionTrigger className="py-4 text-base">Vocabulary Enhancer</AccordionTrigger>
          <AccordionContent>
            {vocabSuggestions.length > 0 ? (
              <div className="space-y-2">
                {vocabSuggestions.map((item, index) => (
                  <div key={`${item.from}-${index}`} className="rounded-xl border border-border/60 bg-background/50 p-3">
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
                <p className="text-sm text-muted-foreground">先写出草稿，再抽取低阶表达做升级建议。</p>
                <Button size="sm" onClick={onEnhanceVocabulary} disabled={isBusy}>
                  词汇升级
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="coach" className="border-none">
          <AccordionTrigger className="py-4 text-base">AI Writing Tutor</AccordionTrigger>
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
                问教练
              </Button>
            </div>
            {tutorReply && (
              <div className="whitespace-pre-wrap rounded-xl border border-border/60 bg-background/50 px-3 py-3 text-sm leading-7 text-foreground/90">
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
          {loadingStage === 'grading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          获取结构化评分反馈
        </Button>
        <Button variant="outline" onClick={onBackToBrief}>
          回到策略
        </Button>
      </div>
    </div>
  );
}

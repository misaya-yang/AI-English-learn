import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Send, Loader2, RefreshCw, BookOpen, Briefcase, PenLine, Notebook, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { motionPresets } from '@/lib/motion';
import {
  type WritingType,
  type WritingGradeResult,
  countWords,
  gradeWithAi,
  gradeLocally,
} from '@/services/writingAnalytics';

const WRITING_DRAFT_STORAGE_KEY = 'vocabdaily-writing-drafts-v1';
const EMPTY_DRAFTS: Record<WritingType, string> = {
  free: '',
  ielts: '',
  business: '',
  journal: '',
};

const WRITING_TYPES: {
  id: WritingType;
  label: string;
  labelZh: string;
  icon: typeof FileText;
  prompt: string;
  promptZh: string;
  targetWords: number;
}[] = [
  { id: 'free', label: 'Free Writing', labelZh: '自由写作', icon: PenLine, prompt: 'Write about any topic you like.', promptZh: '随心写作，不限主题。', targetWords: 80 },
  { id: 'ielts', label: 'IELTS Task 2', labelZh: 'IELTS 大作文', icon: BookOpen, prompt: 'Some people think that the best way to learn a language is to live in the country where it is spoken. To what extent do you agree or disagree?', promptZh: '有人认为学语言最好的方式是住在使用该语言的国家。你在多大程度上同意或不同意？', targetWords: 250 },
  { id: 'business', label: 'Business Email', labelZh: '商务邮件', icon: Briefcase, prompt: 'Write a professional email requesting a meeting to discuss project progress.', promptZh: '写一封专业邮件，请求开会讨论项目进度。', targetWords: 120 },
  { id: 'journal', label: 'Daily Journal', labelZh: '日记', icon: Notebook, prompt: 'Describe something interesting that happened today.', promptZh: '描述今天发生的一件有趣的事。', targetWords: 80 },
];

const readStoredDrafts = (): Record<WritingType, string> => {
  if (typeof window === 'undefined') return { ...EMPTY_DRAFTS };
  try {
    const parsed = JSON.parse(localStorage.getItem(WRITING_DRAFT_STORAGE_KEY) || '{}') as Partial<Record<WritingType, unknown>>;
    return {
      free: typeof parsed.free === 'string' ? parsed.free : '',
      ielts: typeof parsed.ielts === 'string' ? parsed.ielts : '',
      business: typeof parsed.business === 'string' ? parsed.business : '',
      journal: typeof parsed.journal === 'string' ? parsed.journal : '',
    };
  } catch {
    return { ...EMPTY_DRAFTS };
  }
};

const applyWritingTarget = (
  result: WritingGradeResult,
  text: string,
  targetWords: number,
): WritingGradeResult => {
  if (result.hasAiFeedback) return result;
  const targetScore = Math.min(100, Math.round((countWords(text) / targetWords) * 100));
  const priorTargetScore = result.dimensions.taskAchievement.score;
  const overallScore = Math.min(
    100,
    Math.max(0, Math.round(result.overallScore + (targetScore - priorTargetScore) * 0.2)),
  );

  return {
    ...result,
    overallScore,
    dimensions: {
      ...result.dimensions,
      taskAchievement: {
        ...result.dimensions.taskAchievement,
        score: targetScore,
        feedback: `Aim for at least ${targetWords} words for this task type.`,
        feedbackZh: `该任务建议至少完成 ${targetWords} 词。`,
      },
    },
  };
};

export default function WritingPage() {
  const { i18n } = useTranslation();
  const isZh = i18n.language.startsWith('zh');
  const [writingType, setWritingType] = useState<WritingType>('free');
  const [drafts, setDrafts] = useState<Record<WritingType, string>>(readStoredDrafts);
  const lastSavedDraftsRef = useRef<Record<WritingType, string>>({ ...drafts });
  const [autosavedAt, setAutosavedAt] = useState<string | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResults, setGradeResults] = useState<Partial<Record<WritingType, WritingGradeResult>>>({});

  const currentType = WRITING_TYPES.find((t) => t.id === writingType) ?? WRITING_TYPES[0];
  const CurrentTypeIcon = currentType.icon;
  const content = drafts[writingType];
  const gradeResult = gradeResults[writingType] ?? null;
  const wordCount = countWords(content);
  const targetWords = currentType.targetWords;
  const wordProgress = Math.min(100, Math.round((wordCount / targetWords) * 100));
  const isDirty = content !== lastSavedDraftsRef.current[writingType];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const serialized = JSON.stringify(drafts);
      const previous = JSON.stringify(lastSavedDraftsRef.current);
      if (serialized === previous) return;

      try {
        localStorage.setItem(WRITING_DRAFT_STORAGE_KEY, serialized);
        lastSavedDraftsRef.current = { ...drafts };
        setAutosavedAt(new Date().toISOString());
      } catch {
        toast.error(isZh ? '草稿无法保存到当前浏览器' : 'This browser could not save the draft');
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [drafts, isZh]);

  const handleContentChange = useCallback((value: string) => {
    setDrafts((previous) => ({ ...previous, [writingType]: value }));
    setGradeResults((previous) => {
      if (!previous[writingType]) return previous;
      const next = { ...previous };
      delete next[writingType];
      return next;
    });
  }, [writingType]);

  const handleGrade = useCallback(async () => {
    if (wordCount < 10) return;
    setIsGrading(true);
    try {
      const result = await gradeWithAi(content, writingType, currentType.prompt);
      setGradeResults((previous) => ({
        ...previous,
        [writingType]: applyWritingTarget(result, content, targetWords),
      }));
    } catch {
      const result = gradeLocally(content, writingType);
      setGradeResults((previous) => ({
        ...previous,
        [writingType]: applyWritingTarget(result, content, targetWords),
      }));
      toast.info(isZh ? '在线批改暂时不可用，已切换到本地评分' : 'Online grading unavailable. Using local scoring.');
    } finally {
      setIsGrading(false);
    }
  }, [content, writingType, currentType.prompt, wordCount, isZh, targetWords]);

  const handleReset = () => {
    setDrafts((previous) => ({ ...previous, [writingType]: '' }));
    setGradeResults((previous) => {
      const next = { ...previous };
      delete next[writingType];
      return next;
    });
  };

  return (
    <div className="learning-open-route mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
      <motion.section {...motionPresets.fadeIn} className="learning-open-hero pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{isZh ? '写作' : 'Writing'}</p>
            <h1 className="mt-1 text-2xl font-bold">{isZh ? '写作练习' : 'Writing Practice'}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {isZh
                ? '选择任务后直接写作，草稿会按类型保存在当前浏览器。'
                : 'Choose a task and start writing. Each task keeps its own local draft.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-md">
              <CurrentTypeIcon className="mr-1 h-3.5 w-3.5" />
              {isZh ? currentType.labelZh : currentType.label}
            </Badge>
            <Badge variant="secondary" className="rounded-md">
              {targetWords}+ {isZh ? '词' : 'words'}
            </Badge>
            <Badge variant="outline" className="rounded-md">
              {writingType === 'ielts'
                ? (isZh ? '在线或本地批改' : 'Online or local grading')
                : (isZh ? '本地分析' : 'Local analysis')}
            </Badge>
          </div>
        </div>

        <div className="learning-open-panel mt-3 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{isZh ? '写作题目' : 'Writing prompt'}</p>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-foreground">
                {isZh ? currentType.promptZh : currentType.prompt}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground" role="status" aria-live="polite">
              {isDirty
                ? (isZh ? '正在自动保存…' : 'Autosaving…')
                : autosavedAt
                  ? (isZh ? '草稿已保存' : 'Draft saved')
                  : (isZh ? '本地草稿已就绪' : 'Local draft ready')}
            </span>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{isZh ? '当前词数' : 'Current words'}</span>
              <span>{wordCount}/{targetWords}</span>
            </div>
            <Progress value={wordProgress} className="h-2" />
          </div>
        </div>
      </motion.section>

      {/* Writing type selector */}
      <Tabs value={writingType} onValueChange={(value) => setWritingType(value as WritingType)}>
        <TabsList className="liquid-glass-control grid h-auto w-full grid-cols-2 rounded-lg p-1 sm:grid-cols-4">
          {WRITING_TYPES.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="flex-1 text-xs sm:text-sm">
              {isZh ? t.labelZh : t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={writingType}>
          {/* Editor */}
          <div className="mt-3 space-y-2">
            <Label htmlFor="writing-editor">
              {isZh ? `${currentType.labelZh}草稿` : `${currentType.label} draft`}
            </Label>
            <Textarea
              id="writing-editor"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={isZh ? '在这里开始写作...' : 'Start writing here...'}
              className="min-h-[320px] resize-y sm:min-h-[360px]"
              disabled={isGrading}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{wordCount} {isZh ? '词' : 'words'}</span>
              <span className={wordCount >= targetWords ? 'text-success' : 'text-warning'}>
                {isZh ? `目标 ${targetWords}+ 词` : `Aim for ${targetWords}+ words`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleGrade}
              disabled={wordCount < 10 || isGrading}
              className="flex-1"
            >
              {isGrading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isZh ? '批改中...' : 'Grading...'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {isZh ? '提交评分' : 'Submit for Grading'}
                </>
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={!content && !gradeResult}>
                  <RefreshCw className="mr-1 h-4 w-4" />
                  {isZh ? '重写' : 'Reset'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {isZh ? `清空${currentType.labelZh}草稿？` : `Clear the ${currentType.label} draft?`}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isZh
                      ? '只会清空当前类型的草稿，其他写作类型仍会保留。'
                      : 'Only this task draft will be cleared. Your other writing drafts will remain saved.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{isZh ? '保留草稿' : 'Keep draft'}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    {isZh ? '清空当前草稿' : 'Clear current draft'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {wordCount < 10 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {isZh ? '至少写满 10 词后才能提交评分。' : 'Write at least 10 words before submitting for grading.'}
            </p>
          ) : null}

          {/* Grading skeleton */}
          {isGrading && (
            <div className="mt-6 space-y-4">
              <Card><CardContent className="pt-6 space-y-3 text-center"><Skeleton className="mx-auto h-10 w-20" /><Skeleton className="mx-auto h-4 w-32" /></CardContent></Card>
              <Card><CardContent className="pt-4 space-y-3"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-2 w-full" /><Skeleton className="h-2 w-full" /><Skeleton className="h-2 w-4/5" /></CardContent></Card>
            </div>
          )}

          {/* Grade results */}
          <AnimatePresence>
            {gradeResult && !isGrading && (
              <motion.div {...motionPresets.fadeInUp} className="mt-6 space-y-4">
                {/* Dimensions */}
                <Card>
                  <CardHeader className="gap-3 pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          {isZh ? '写作结果' : 'Writing result'}
                        </p>
                        <CardTitle className="mt-1 text-lg">
                          {isZh
                            ? `本轮写作 ${gradeResult.overallScore}/100`
                            : `Writing score ${gradeResult.overallScore}/100`}
                        </CardTitle>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary">{gradeResult.wordCount} {isZh ? '词' : 'words'}</Badge>
                        <Badge variant="secondary">{gradeResult.sentenceCount} {isZh ? '句' : 'sentences'}</Badge>
                        {gradeResult.bandScore !== null ? (
                          <Badge variant="outline">IELTS Band {gradeResult.bandScore}</Badge>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {gradeResult.overallScore >= 80
                        ? (isZh ? '草稿已经比较完整，下一步精修最低分维度。' : 'The draft is well developed. Refine the lowest scoring dimension next.')
                        : gradeResult.overallScore >= 60
                          ? (isZh ? '结构已有基础，优先处理评分最低的一项。' : 'The structure is workable. Start with the lowest scoring dimension.')
                          : (isZh ? '先补足核心内容和段落结构，再做语言精修。' : 'Add the core content and paragraph structure before polishing language.')}
                    </p>
                    <CardTitle className="text-sm">{isZh ? '评分维度' : 'Score breakdown'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.values(gradeResult.dimensions).map((dim) => (
                      <div key={dim.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{isZh ? dim.labelZh : dim.label}</span>
                          <span className="font-medium">{dim.score}</span>
                        </div>
                        <Progress value={dim.score} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {isZh ? dim.feedbackZh : dim.feedback}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Suggestions */}
                {gradeResult.suggestions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{isZh ? '修改点' : 'Suggestions'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {gradeResult.suggestions.map((s) => (
                        <div key={s.id} className="rounded-lg border p-3 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">{s.type}</Badge>
                          </div>
                          <p className="line-through text-muted-foreground">{s.original}</p>
                          <p className="mt-1 text-success">{s.suggested}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isZh ? s.reasonZh : s.reason}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {!gradeResult.hasAiFeedback && (
                  <p className="text-xs text-muted-foreground text-center">
                    {isZh ? '在线反馈不可用，仅显示本地分析' : 'Online feedback unavailable. Showing local analysis only.'}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}

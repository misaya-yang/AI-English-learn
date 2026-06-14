import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Send, Loader2, RefreshCw, BookOpen, Briefcase, PenLine, Notebook, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { motionPresets } from '@/lib/motion';
import {
  type WritingType,
  type WritingGradeResult,
  countWords,
  gradeWithAi,
  gradeLocally,
} from '@/services/writingAnalytics';
import { LearningCompletionState } from '@/features/learning/components/LearningWorkspace';

const WRITING_TYPES: { id: WritingType; label: string; labelZh: string; icon: typeof FileText; prompt: string; promptZh: string }[] = [
  { id: 'free', label: 'Free Writing', labelZh: '自由写作', icon: PenLine, prompt: 'Write about any topic you like.', promptZh: '随心写作，不限主题。' },
  { id: 'ielts', label: 'IELTS Task 2', labelZh: 'IELTS 大作文', icon: BookOpen, prompt: 'Some people think that the best way to learn a language is to live in the country where it is spoken. To what extent do you agree or disagree?', promptZh: '有人认为学语言最好的方式是住在使用该语言的国家。你在多大程度上同意或不同意？' },
  { id: 'business', label: 'Business Email', labelZh: '商务邮件', icon: Briefcase, prompt: 'Write a professional email requesting a meeting to discuss project progress.', promptZh: '写一封专业邮件，请求开会讨论项目进度。' },
  { id: 'journal', label: 'Daily Journal', labelZh: '日记', icon: Notebook, prompt: 'Describe something interesting that happened today.', promptZh: '描述今天发生的一件有趣的事。' },
];

export default function WritingPage() {
  const { i18n } = useTranslation();
  const isZh = i18n.language.startsWith('zh');
  const [writingType, setWritingType] = useState<WritingType>('free');
  const [content, setContent] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<WritingGradeResult | null>(null);

  const currentType = WRITING_TYPES.find((t) => t.id === writingType) ?? WRITING_TYPES[0];
  const CurrentTypeIcon = currentType.icon;
  const wordCount = countWords(content);
  const targetWords = writingType === 'ielts' ? 250 : writingType === 'business' ? 120 : 80;
  const wordProgress = Math.min(100, Math.round((wordCount / targetWords) * 100));
  const rubricPreview = [
    { label: isZh ? '任务回应' : 'Task response', value: writingType === 'ielts' ? 'Band' : 'Focus' },
    { label: isZh ? '结构连贯' : 'Coherence', value: isZh ? '段落' : 'Flow' },
    { label: isZh ? '词汇资源' : 'Lexical range', value: isZh ? '表达' : 'Range' },
    { label: isZh ? '语法准确' : 'Grammar', value: isZh ? '准确' : 'Accuracy' },
  ];

  const handleGrade = useCallback(async () => {
    if (wordCount < 10) return;
    setIsGrading(true);
    try {
      const result = await gradeWithAi(content, writingType, currentType.prompt);
      setGradeResult(result);
    } catch {
      setGradeResult(gradeLocally(content, writingType));
      toast.info(isZh ? '在线批改暂时不可用，已切换到本地评分' : 'Online grading unavailable. Using local scoring.');
    } finally {
      setIsGrading(false);
    }
  }, [content, writingType, currentType.prompt, wordCount, isZh]);

  const handleReset = () => {
    setContent('');
    setGradeResult(null);
  };

  const writingRecap = gradeResult && !isGrading ? (
    <LearningCompletionState
      icon={CheckCircle2}
      eyebrow={isZh ? '写作复盘' : 'Writing recap'}
      title={isZh ? `本轮写作 ${gradeResult.overallScore}/100` : `Writing score ${gradeResult.overallScore}/100`}
      description={
        gradeResult.overallScore >= 80
          ? (isZh ? '表达已经比较稳，下一轮重点是精修句式和更高级词汇。' : 'The draft is strong. Next, polish sentence variety and lexical range.')
          : gradeResult.overallScore >= 60
            ? (isZh ? '结构和表达有基础，建议优先处理评分维度里最低的一项。' : 'The structure is workable. Start with the lowest scoring dimension.')
            : (isZh ? '先把核心观点和段落结构稳住，再做语言层面的修饰。' : 'Stabilize the core idea and paragraph structure before polishing language.')
      }
      metrics={[
        { label: isZh ? '总分' : 'Score', value: `${gradeResult.overallScore}/100`, accent: gradeResult.overallScore >= 80 ? 'emerald' : gradeResult.overallScore >= 60 ? 'warm' : undefined },
        { label: isZh ? '词数' : 'Words', value: gradeResult.wordCount },
        { label: isZh ? '句数' : 'Sentences', value: gradeResult.sentenceCount },
        ...(gradeResult.bandScore !== null ? [{ label: isZh ? 'IELTS Band' : 'IELTS Band', value: gradeResult.bandScore }] : []),
      ]}
      actions={
        <>
          <Button variant="outline" onClick={() => setGradeResult(null)} className="rounded-md border-border bg-card">
            {isZh ? '回到草稿修改' : 'Revise this draft'}
          </Button>
          <Button onClick={handleReset} className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
            <RefreshCw className="mr-2 h-4 w-4" />
            {isZh ? '重新写一篇' : 'Start a new draft'}
          </Button>
        </>
      }
    />
  ) : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      {writingRecap}

      <motion.section
        {...motionPresets.fadeIn}
        className="rounded-md border border-border bg-card p-4 sm:p-5"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] lg:items-stretch">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {isZh ? '写作' : 'Writing'}
              </p>
              <h1 className="mt-2 text-2xl font-bold">
                {isZh ? '写作练习' : 'Writing Practice'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {isZh ? '写一版，按维度改一版。' : 'Draft once, then revise by score dimension.'}
              </p>
            </div>

            <div className="rounded-md border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                  <CurrentTypeIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{isZh ? currentType.labelZh : currentType.label}</p>
                  <p className="text-xs text-muted-foreground">{targetWords}+ {isZh ? '词目标' : 'word target'}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {isZh ? currentType.promptZh : currentType.prompt}
              </p>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{isZh ? '当前字数' : 'Current words'}</span>
                  <span>{wordCount}/{targetWords}</span>
                </div>
                <Progress value={wordProgress} className="h-2" />
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-xs font-medium text-muted-foreground">
              {isZh ? '修改维度' : 'Revision dimensions'}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {rubricPreview.map((item) => (
                <div key={item.label} className="rounded-md border border-border bg-card p-3">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-md border border-primary/20 bg-primary/10 p-4">
              <p className="text-sm font-semibold text-foreground">
                {gradeResult
                  ? (isZh ? `当前得分 ${gradeResult.overallScore}/100` : `Current score ${gradeResult.overallScore}/100`)
                  : (isZh ? '提交后查看修改建议' : 'Submit to review edits')}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {isZh
                  ? '结果页会列出分数、句子替换和下一次重点。'
                  : 'Results list the score, sentence replacements, and next focus.'}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Writing type selector */}
      <Tabs value={writingType} onValueChange={(v) => { setWritingType(v as WritingType); setGradeResult(null); }}>
        <TabsList className="w-full">
          {WRITING_TYPES.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="flex-1 text-xs sm:text-sm">
              {isZh ? t.labelZh : t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={writingType}>
          {/* Prompt */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CurrentTypeIcon className="h-4 w-4" />
                {isZh ? '写作题目' : 'Writing Prompt'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {isZh ? currentType.promptZh : currentType.prompt}
              </p>
            </CardContent>
          </Card>

          {/* Editor */}
          <div className="mt-4 space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isZh ? '在这里开始写作...' : 'Start writing here...'}
              className="min-h-[200px] resize-y"
              disabled={isGrading}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{wordCount} {isZh ? '词' : 'words'}</span>
              {writingType === 'ielts' && (
                <span className={wordCount >= 250 ? 'text-green-500' : 'text-orange-500'}>
                  {isZh ? '建议至少 250 词' : 'Aim for 250+ words'}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
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
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-1" />
              {isZh ? '重写' : 'Reset'}
            </Button>
          </div>

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
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{isZh ? '评分维度' : 'Score Breakdown'}</CardTitle>
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
                      <CardTitle className="text-sm">{isZh ? '修改建议' : 'Suggestions'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {gradeResult.suggestions.map((s) => (
                        <div key={s.id} className="rounded-lg border p-3 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">{s.type}</Badge>
                          </div>
                          <p className="line-through text-muted-foreground">{s.original}</p>
                          <p className="text-green-700 mt-1">{s.suggested}</p>
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

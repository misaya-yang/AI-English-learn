import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Send, Loader2, RefreshCw, BookOpen, Briefcase, PenLine, Notebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { motionPresets } from '@/lib/motion';
import {
  type WritingType,
  type WritingGradeResult,
  countWords,
  gradeWithAi,
  gradeLocally,
} from '@/services/writingAnalytics';

const WRITING_TYPES: { id: WritingType; label: string; labelZh: string; icon: typeof FileText; prompt: string; promptZh: string }[] = [
  { id: 'free', label: 'Free Writing', labelZh: '自由写作', icon: PenLine, prompt: 'Write about any topic you like.', promptZh: '随心写作，不限主题。' },
  { id: 'ielts', label: 'IELTS Task 2', labelZh: 'IELTS 大作文', icon: BookOpen, prompt: 'Some people think that the best way to learn a language is to live in the country where it is spoken. To what extent do you agree or disagree?', promptZh: '有人认为学语言最好的方式是住在使用该语言的国家。你在多大程度上同意或不同意？' },
  { id: 'business', label: 'Business Email', labelZh: '商务邮件', icon: Briefcase, prompt: 'Write a professional email requesting a meeting to discuss project progress.', promptZh: '写一封专业邮件，请求开会讨论项目进度。' },
  { id: 'journal', label: 'Daily Journal', labelZh: '日记', icon: Notebook, prompt: 'Describe something interesting that happened today.', promptZh: '描述今天发生的一件有趣的事。' },
];

export default function WritingPage() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [writingType, setWritingType] = useState<WritingType>('free');
  const [content, setContent] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<WritingGradeResult | null>(null);

  const currentType = WRITING_TYPES.find((t) => t.id === writingType)!;
  const wordCount = countWords(content);

  const handleGrade = useCallback(async () => {
    if (wordCount < 10) return;
    setIsGrading(true);
    try {
      const result = await gradeWithAi(content, writingType, currentType.prompt);
      setGradeResult(result);
    } catch {
      // Fallback to local
      setGradeResult(gradeLocally(content, writingType));
    } finally {
      setIsGrading(false);
    }
  }, [content, writingType, currentType.prompt, wordCount]);

  const handleReset = () => {
    setContent('');
    setGradeResult(null);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <motion.div {...motionPresets.fadeIn}>
        <h1 className="text-2xl font-bold tracking-tight">
          {isZh ? '写作练习' : 'Writing Practice'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isZh ? '练习写作，获得 AI 详细批改和评分' : 'Practice writing and get detailed AI feedback'}
        </p>
      </motion.div>

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
                <currentType.icon className="h-4 w-4" />
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
                  {isZh ? '提交批改' : 'Submit for Grading'}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-1" />
              {isZh ? '重写' : 'Reset'}
            </Button>
          </div>

          {/* Grade results */}
          <AnimatePresence>
            {gradeResult && (
              <motion.div {...motionPresets.fadeInUp} className="mt-6 space-y-4">
                {/* Overall score */}
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl font-bold">{gradeResult.overallScore}</div>
                    <p className="text-sm text-muted-foreground">/ 100</p>
                    {gradeResult.bandScore !== null && (
                      <Badge className="mt-2">
                        IELTS Band {gradeResult.bandScore}
                      </Badge>
                    )}
                    <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{gradeResult.wordCount} {isZh ? '词' : 'words'}</span>
                      <span>{gradeResult.sentenceCount} {isZh ? '句' : 'sentences'}</span>
                    </div>
                  </CardContent>
                </Card>

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
                          <p className="text-green-600 dark:text-green-400 mt-1">{s.suggested}</p>
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
                    {isZh ? 'AI 反馈不可用——仅显示本地分析' : 'AI feedback unavailable — showing local analysis only'}
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

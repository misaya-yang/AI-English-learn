import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motionPresets, motionStagger } from '@/lib/motion';
import { learningPaths, type LearningPath, type LessonItem } from '@/data/learningPaths';
import {
  getLearningPathProgress,
  getPathCompletionPercent,
  setLearningPathActivePath,
  toggleLearningPathLesson,
} from '@/services/learningPathProgress';
import { LearningCockpitShell } from '@/features/learning/components/LearningCockpitShell';

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const lessonTypeIcon: Record<LessonItem['type'], string> = {
  vocabulary: '📖',
  grammar: '📝',
  practice: '🎯',
  conversation: '💬',
  review: '🔄',
};

const getLessonIds = (path: LearningPath): string[] =>
  path.stages.flatMap((stage) => stage.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id)));

const getInitialProgressState = (userId: string) => {
  const progress = getLearningPathProgress(userId);
  const activePathId = progress.activePathId && learningPaths.some((path) => path.id === progress.activePathId)
    ? progress.activePathId
    : null;

  return {
    activePathId,
    completedLessonIds: progress.completedLessonIds,
  };
};

export default function LearningPathPage() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isZh = i18n.language === 'zh';
  const userId = user?.id || 'guest';
  const initialProgress = getInitialProgressState(userId);

  const [selectedPathId, setSelectedPathId] = useState<string | null>(initialProgress.activePathId);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(initialProgress.completedLessonIds);

  const completedLessonSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);

  const selectedPath = useMemo(
    () => learningPaths.find((path) => path.id === selectedPathId) || null,
    [selectedPathId],
  );

  const pathProgressMap = useMemo(() => {
    return new Map(
      learningPaths.map((path) => [
        path.id,
        getPathCompletionPercent(completedLessonIds, getLessonIds(path)),
      ]),
    );
  }, [completedLessonIds]);

  const handleSelectPath = (pathId: string | null) => {
    setSelectedPathId(pathId);
    setLearningPathActivePath(userId, pathId);
  };

  const handleToggleLesson = (lessonId: string) => {
    const next = toggleLearningPathLesson(userId, lessonId);
    setCompletedLessonIds(next.completedLessonIds);
  };

  const nextLesson = useMemo(() => {
    if (!selectedPath) return null;

    return selectedPath.stages
      .flatMap((stage) => stage.units.flatMap((unit) => unit.lessons))
      .find((lesson) => !completedLessonSet.has(lesson.id)) || null;
  }, [completedLessonSet, selectedPath]);

  if (!selectedPath) {
    // Pick the path with the highest existing progress (first non-zero).
    // Falls back to the first path so the primary CTA always lands somewhere.
    const recommendedPath =
      learningPaths.find((path) => (pathProgressMap.get(path.id) || 0) > 0) ||
      learningPaths[0];
    const recommendedTitle = isZh ? recommendedPath?.titleZh : recommendedPath?.title;

    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <LearningCockpitShell
          language={i18n.language}
          eyebrow={isZh ? '学习路径' : 'Learning Paths'}
          mission={{
            title: isZh ? '挑一条路径，让今天的努力沿着一个方向累积。' : 'Pick a path so today\'s effort stacks toward one outcome.',
            description: isZh
              ? '选择一条路径，系统化提升你的英语能力。每条路径都把词汇、语法和练习串成可追踪的进度。'
              : 'Choose a path to systematically improve your English. Each one stitches vocabulary, grammar, and practice into trackable progress.',
            primaryAction: recommendedPath
              ? {
                  label: isZh ? `继续：${recommendedTitle}` : `Continue: ${recommendedTitle}`,
                  onClick: () => handleSelectPath(recommendedPath.id),
                }
              : undefined,
            secondaryActions: [
              { label: isZh ? '回到 Today' : 'Back to Today', href: '/dashboard/today', variant: 'outline' },
            ],
          }}
          metrics={[
            {
              label: isZh ? '可选路径' : 'Available paths',
              value: learningPaths.length,
              accent: 'emerald',
            },
            {
              label: isZh ? '已开启' : 'In progress',
              value: learningPaths.filter((path) => (pathProgressMap.get(path.id) || 0) > 0).length,
            },
          ]}
        >
          <div className="grid gap-4">
          {learningPaths.map((path, index) => {
            const percent = pathProgressMap.get(path.id) || 0;
            const lessonIds = getLessonIds(path);
            const completedCount = lessonIds.filter((lessonId) => completedLessonSet.has(lessonId)).length;

            return (
              <motion.div key={path.id} {...motionStagger(index)}>
                <Card
                  className="cursor-pointer transition-colors hover:border-primary/50"
                  onClick={() => handleSelectPath(path.id)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <span className="text-3xl">{path.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">
                          {isZh ? path.titleZh : path.title}
                        </h3>
                        <span className={`rounded px-1.5 py-0.5 text-xs ${DIFFICULTY_COLORS[path.difficulty]}`}>
                          {path.difficulty}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {isZh ? path.descriptionZh : path.description}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <Progress value={percent} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {completedCount}/{path.totalLessons}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          </div>
        </LearningCockpitShell>
      </div>
    );
  }

  const totalLessons = selectedPath.totalLessons;
  const progressPercent = pathProgressMap.get(selectedPath.id) || 0;
  const doneCount = getLessonIds(selectedPath).filter((lessonId) => completedLessonSet.has(lessonId)).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <motion.div {...motionPresets.fadeIn}>
        <Button variant="ghost" size="sm" onClick={() => handleSelectPath(null)}>
          ← {isZh ? '返回路径列表' : 'Back to paths'}
        </Button>

        <div className="mt-2 flex items-center gap-3">
          <span className="text-2xl">{selectedPath.icon}</span>
          <div>
            <h1 className="text-xl font-bold">
              {isZh ? selectedPath.titleZh : selectedPath.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isZh ? selectedPath.descriptionZh : selectedPath.description}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Progress value={progressPercent} className="flex-1" />
          <span className="text-xs text-muted-foreground">
            {doneCount}/{totalLessons}
          </span>
        </div>
      </motion.div>

      <Card className="border-emerald-500/15 bg-emerald-500/[0.04]">
        <CardContent className="flex items-start gap-3 p-4">
          <Sparkles className="mt-0.5 h-4 w-4 text-emerald-500" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isZh ? '下一步建议' : 'Suggested next step'}
            </p>
            <p className="text-sm text-muted-foreground">
              {nextLesson
                ? `${isZh ? nextLesson.titleZh : nextLesson.title} · ${nextLesson.estimatedMinutes}m`
                : isZh
                  ? '这条路径已经完成，可以切换到下一条更高阶路径。'
                  : 'This path is complete. You can switch to a more advanced path next.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {selectedPath.stages.map((stage) => (
        <div key={stage.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-primary">
              {isZh ? stage.titleZh : stage.title}
            </h2>
          </div>

          {stage.units.map((unit) => (
            <Card key={unit.id}>
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-sm">
                  {isZh ? unit.titleZh : unit.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 pb-3">
                {unit.lessons.map((lesson) => {
                  const done = completedLessonSet.has(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => handleToggleLesson(lesson.id)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted/50"
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="text-sm">{lessonTypeIcon[lesson.type]}</span>
                      <span className={`flex-1 text-sm ${done ? 'text-muted-foreground line-through' : ''}`}>
                        {isZh ? lesson.titleZh : lesson.title}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {lesson.estimatedMinutes}m
                      </span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      ))}

      <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
        <span>{isZh ? '点击课程即可标记完成或取消完成。' : 'Click any lesson to mark it complete or undo it.'}</span>
        <Badge variant="secondary">{progressPercent}%</Badge>
      </div>
    </div>
  );
}

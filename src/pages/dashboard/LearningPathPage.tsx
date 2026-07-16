import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  MapPin,
  MessageSquareText,
  RotateCcw,
  Target,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motionStagger } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { learningPaths, type LearningPath, type LessonItem } from '@/data/learningPaths';
import {
  getLearningPathProgress,
  getPathCompletionPercent,
  setLearningPathActivePath,
} from '@/services/learningPathProgress';
import { LearningCockpitShell } from '@/features/learning/components/LearningCockpitShell';
import { resolveLearningPathLessonTarget } from '@/features/learning/learningPathRouting';

const DIFFICULTY_LABELS = {
  beginner: { zh: '入门', en: 'Beginner' },
  intermediate: { zh: '进阶', en: 'Intermediate' },
  advanced: { zh: '高级', en: 'Advanced' },
};

const lessonTypeMeta: Record<LessonItem['type'], {
  icon: typeof BookOpen;
  labelZh: string;
  labelEn: string;
}> = {
  vocabulary: { icon: BookOpen, labelZh: '词汇', labelEn: 'Vocabulary' },
  grammar: { icon: FileText, labelZh: '语法', labelEn: 'Grammar' },
  practice: { icon: Target, labelZh: '练习', labelEn: 'Practice' },
  conversation: { icon: MessageSquareText, labelZh: '对话', labelEn: 'Conversation' },
  review: { icon: RotateCcw, labelZh: '复习', labelEn: 'Review' },
};

const getLessonIds = (path: LearningPath): string[] =>
  path.stages.flatMap((stage) => stage.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id)));

const cockpitActionClassName =
  '[&_[data-session-action]]:h-auto [&_[data-session-action]]:min-h-11 [&_[data-session-action]]:whitespace-normal [&_[data-session-action]]:py-2.5 [&_[data-session-action]]:text-center [&_[data-session-action]]:leading-5';

const getInitialProgressState = (userId: string) => {
  const progress = getLearningPathProgress(userId);
  const activePathId = progress.activePathId && learningPaths.some((path) => path.id === progress.activePathId)
    ? progress.activePathId
    : null;

  return {
    activePathId,
    completedLessonIds: progress.completedLessonIds,
    lessonEvidence: progress.lessonEvidence,
  };
};

export default function LearningPathPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isZh = i18n.language.startsWith('zh');
  const userId = user?.id || 'guest';
  const initialProgress = useMemo(() => getInitialProgressState(userId), [userId]);

  const [selectedPathId, setSelectedPathId] = useState<string | null>(initialProgress.activePathId);
  const [completedLessonIds] = useState<string[]>(initialProgress.completedLessonIds);
  const [lessonEvidence] = useState(initialProgress.lessonEvidence);

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

  const handleOpenLesson = (path: LearningPath, lesson: LessonItem) => {
    navigate(resolveLearningPathLessonTarget(path, lesson).href);
  };

  const nextLesson = useMemo(() => {
    if (!selectedPath) return null;

    return selectedPath.stages
      .flatMap((stage) => stage.units.flatMap((unit) => unit.lessons))
      .find((lesson) => !completedLessonSet.has(lesson.id)) || null;
  }, [completedLessonSet, selectedPath]);

  const nextLessonTarget = useMemo(
    () => (selectedPath && nextLesson ? resolveLearningPathLessonTarget(selectedPath, nextLesson) : null),
    [nextLesson, selectedPath],
  );

  if (!selectedPath) {
    const recommendedPath = learningPaths.reduce<LearningPath | undefined>((best, path) => {
      if (!best) return path;
      return (pathProgressMap.get(path.id) || 0) > (pathProgressMap.get(best.id) || 0) ? path : best;
    }, undefined);
    const recommendedTitle = isZh ? recommendedPath?.titleZh : recommendedPath?.title;

    return (
      <div className="learning-open-route mx-auto w-full max-w-6xl">
        <LearningCockpitShell
          className={cockpitActionClassName}
          language={i18n.language}
          eyebrow={isZh ? '学习路径' : 'Learning Paths'}
          mission={{
            title: isZh ? '选择一条学习路径' : 'Choose a learning path',
            description: isZh
              ? '选择后会打开已映射的学习入口；完成状态在这里保持只读，直到具体任务回传证据。'
              : 'Choose a path to open its mapped learning entries. Completion stays read-only here until the task reports evidence.',
            primaryAction: recommendedPath
              ? {
                  label: isZh ? `继续${recommendedTitle}` : `Continue ${recommendedTitle}`,
                  onClick: () => handleSelectPath(recommendedPath.id),
                }
              : undefined,
            secondaryActions: [
              { label: isZh ? '返回今日' : 'Back to Today', href: '/dashboard/today', variant: 'outline' },
            ],
          }}
          metrics={[
            {
              label: isZh ? '可选路径' : 'Available paths',
              value: learningPaths.length,
              accent: 'practice',
            },
            {
              label: isZh ? '已开启' : 'In progress',
              value: learningPaths.filter((path) => (pathProgressMap.get(path.id) || 0) > 0).length,
            },
          ]}
        >
          <div className="grid gap-3 md:grid-cols-2">
          {learningPaths.map((path, index) => {
            const percent = pathProgressMap.get(path.id) || 0;
            const lessonIds = getLessonIds(path);
            const completedCount = lessonIds.filter((lessonId) => completedLessonSet.has(lessonId)).length;
            const difficultyLabel = DIFFICULTY_LABELS[path.difficulty];

            return (
              <motion.button
                key={path.id}
                type="button"
                {...motionStagger(index)}
                onClick={() => handleSelectPath(path.id)}
                aria-label={isZh ? `选择学习路径：${path.titleZh}` : `Choose learning path: ${path.title}`}
                className="h-full min-h-11 w-full rounded-xl border border-border bg-card p-4 text-left transition-[border-color,background-color,box-shadow] hover:border-primary/40 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-sm font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {isZh ? path.titleZh : path.title}
                      </span>
                      <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {isZh ? difficultyLabel.zh : difficultyLabel.en}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {isZh ? path.descriptionZh : path.description}
                    </span>
                    <span className="mt-3 flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                      >
                        <span
                          className="block h-full rounded-full bg-primary transition-[width] duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </span>
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {completedCount}/{path.totalLessons}
                      </span>
                    </span>
                  </span>
                </span>
              </motion.button>
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

  const pathTitle = isZh ? selectedPath.titleZh : selectedPath.title;

  return (
    <div className="learning-open-route mx-auto w-full max-w-6xl">
      <LearningCockpitShell
        className={cockpitActionClassName}
        language={i18n.language}
        eyebrow={isZh ? '学习路径' : 'Learning Paths'}
        mission={{
          title: pathTitle,
          description: isZh ? selectedPath.descriptionZh : selectedPath.description,
          primaryAction: nextLesson && nextLessonTarget
            ? {
                label: isZh ? '打开下一课入口' : 'Open next lesson entry',
                onClick: () => navigate(nextLessonTarget.href),
              }
            : undefined,
          secondaryActions: [
            { label: isZh ? '返回今日' : 'Back to Today', href: '/dashboard/today', variant: 'outline' },
          ],
        }}
        metrics={[
          {
            label: isZh ? '课程进度' : 'Progress',
            value: `${doneCount}/${totalLessons}`,
            accent: 'success',
          },
          {
            label: isZh ? '完成率' : 'Completion',
            value: `${progressPercent}%`,
          },
        ]}
      >
        <div className="space-y-6">
          <div>
            <Button variant="ghost" size="sm" className="min-h-11" onClick={() => handleSelectPath(null)}>
              <ChevronLeft className="h-4 w-4" />
              {isZh ? '返回路径列表' : 'Back to paths'}
            </Button>
          </div>

          <Card className="border-[hsl(var(--primary)/0.15)] bg-transparent">
            <CardContent className="flex items-start gap-3 p-4">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isZh ? '下一步' : 'Next step'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {nextLesson
                    ? (isZh
                      ? `${nextLesson.titleZh} · ${nextLesson.estimatedMinutes} 分钟。将打开映射入口“${nextLessonTarget?.labelZh}”；完成证据尚未在本页自动接通。`
                      : `${nextLesson.title} · ${nextLesson.estimatedMinutes} min. Opens the mapped entry “${nextLessonTarget?.label}”; completion evidence is not connected here yet.`)
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
                      const target = resolveLearningPathLessonTarget(selectedPath, lesson);
                      const evidence = lessonEvidence[lesson.id];

                      return (
                        <div
                          key={lesson.id}
                          className="flex w-full items-start gap-2 rounded-lg px-1 py-1 sm:gap-3 sm:px-2"
                        >
                          <span
                            role="img"
                            data-testid={`lesson-status-${lesson.id}`}
                            aria-label={done
                              ? (isZh ? '已有完成记录' : 'Completion recorded')
                              : (isZh ? '尚无完成证据' : 'No completion evidence yet')}
                            className={cn(
                              'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border',
                              done
                                ? 'border-[hsl(var(--success)/0.24)] bg-[hsl(var(--success)/0.08)] text-[hsl(var(--success))]'
                                : 'border-border bg-muted/40 text-muted-foreground',
                            )}
                          >
                            {done ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenLesson(selectedPath, lesson)}
                            aria-label={isZh ? `打开课程入口：${lesson.titleZh}` : `Open lesson entry: ${lesson.title}`}
                            className="min-h-11 min-w-0 flex-1 rounded-lg px-2 py-1 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                          >
                            <span className="flex items-center gap-3">
                              {(() => {
                                const meta = lessonTypeMeta[lesson.type];
                                const LessonIcon = meta.icon;
                                return (
                                  <span
                                    title={isZh ? meta.labelZh : meta.labelEn}
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground"
                                  >
                                    <LessonIcon className="h-3.5 w-3.5" />
                                  </span>
                                );
                              })()}
                              <span className={`min-w-0 flex-1 text-sm ${done ? 'text-muted-foreground line-through' : ''}`}>
                                {isZh ? lesson.titleZh : lesson.title}
                              </span>
                              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {isZh ? `${lesson.estimatedMinutes} 分钟` : `${lesson.estimatedMinutes} min`}
                              </span>
                            </span>
                            <span className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="rounded-md px-2 py-0.5">
                                {isZh ? target.labelZh : target.label}
                              </Badge>
                              <span>
                                {done && evidence
                                  ? (isZh
                                    ? `记录：${evidence.source} · ${new Date(evidence.completedAt).toLocaleDateString('zh-CN')}`
                                    : `Record: ${evidence.source} · ${new Date(evidence.completedAt).toLocaleDateString('en-US')}`)
                                  : done
                                    ? (isZh ? '已有完成记录；来源详情不可用' : 'Completion exists; source details are unavailable')
                                    : (isZh
                                      ? '打开映射入口；自动完成记录尚未接通'
                                      : 'Opens the mapped entry; automatic completion tracking is not connected yet')}
                              </span>
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}

          <div className="rounded-lg bg-[hsl(var(--paper-muted)/0.20)] px-3 py-3 text-sm leading-6 text-muted-foreground">
            {isZh
              ? '课程会打开当前映射的学习入口。本页不再允许手动标记完成；自动完成将在任务证据接通后启用。'
              : 'Lessons open the currently mapped learning entry. Manual completion is disabled here; automatic completion will return when task evidence is connected.'}
          </div>
        </div>
      </LearningCockpitShell>
    </div>
  );
}

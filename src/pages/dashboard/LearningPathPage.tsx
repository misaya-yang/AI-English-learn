import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
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
import { Progress } from '@/components/ui/progress';
import { motionPresets, motionStagger } from '@/lib/motion';
import { learningPaths, type LearningPath, type LessonItem } from '@/data/learningPaths';
import {
  completeLearningPathLesson,
  getLearningPathProgress,
  getPathCompletionPercent,
  setLearningPathActivePath,
} from '@/services/learningPathProgress';
import { LearningCockpitShell } from '@/features/learning/components/LearningCockpitShell';
import { resolveLearningPathLessonTarget } from '@/features/learning/learningPathRouting';
import { createEvidenceEvent, recordEvidence } from '@/services/evidenceEvents';
import { recordEvent } from '@/services/learningEvents';
import { toast } from 'sonner';

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
  const isZh = i18n.language === 'zh';
  const userId = user?.id || 'guest';
  const initialProgress = getInitialProgressState(userId);

  const [selectedPathId, setSelectedPathId] = useState<string | null>(initialProgress.activePathId);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(initialProgress.completedLessonIds);
  const [lessonEvidence, setLessonEvidence] = useState(initialProgress.lessonEvidence);

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

  const handleCompleteLesson = (path: LearningPath, lesson: LessonItem) => {
    if (completedLessonSet.has(lesson.id)) return;

    const target = resolveLearningPathLessonTarget(path, lesson);
    const completedAt = new Date().toISOString();

    void recordEvidence(
      createEvidenceEvent({
        type: 'lesson.completed',
        userId,
        lessonId: lesson.id,
        pathId: path.id,
      }),
    );
    void recordEvent(userId, {
      kind: 'session_ended',
      payload: {
        source: 'learning_path_lesson',
        pathId: path.id,
        lessonId: lesson.id,
        targetHref: target.href,
      },
    });

    const next = completeLearningPathLesson(userId, lesson.id, {
      pathId: path.id,
      targetHref: target.href,
      completedAt,
    });
    setCompletedLessonIds(next.completedLessonIds);
    setLessonEvidence(next.lessonEvidence);
    toast.success(isZh ? '已记录课程完成' : 'Lesson completion recorded');
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
    // Pick the path with the highest existing progress (first non-zero).
    // Falls back to the first path so the primary CTA always lands somewhere.
    const recommendedPath =
      learningPaths.find((path) => (pathProgressMap.get(path.id) || 0) > 0) ||
      learningPaths[0];
    const recommendedTitle = isZh ? recommendedPath?.titleZh : recommendedPath?.title;

    return (
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <LearningCockpitShell
          language={i18n.language}
          eyebrow={isZh ? '学习路径' : 'Learning Paths'}
          mission={{
            title: isZh ? '选择一条学习路径' : 'Choose a learning path',
            description: isZh
              ? '每条路径按词汇、语法和练习推进，完成后会记录到进度里。'
              : 'Each path moves through vocabulary, grammar, and practice with progress recorded as you go.',
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
              <motion.div key={path.id} {...motionStagger(index)}>
                <Card
                  className="h-full cursor-pointer rounded-md transition-colors hover:border-primary/45"
                  onClick={() => handleSelectPath(path.id)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-sm font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">
                          {isZh ? path.titleZh : path.title}
                        </h3>
                        <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          {isZh ? difficultyLabel.zh : difficultyLabel.en}
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

  const pathTitle = isZh ? selectedPath.titleZh : selectedPath.title;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <LearningCockpitShell
        language={i18n.language}
        eyebrow={isZh ? '学习路径' : 'Learning Paths'}
        mission={{
          title: pathTitle,
          description: isZh ? selectedPath.descriptionZh : selectedPath.description,
          primaryAction: nextLesson && nextLessonTarget
            ? {
                label: isZh ? `下一课：${nextLesson.titleZh}` : `Next lesson: ${nextLesson.title}`,
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
          <motion.div {...motionPresets.fadeIn}>
            <Button variant="ghost" size="sm" onClick={() => handleSelectPath(null)}>
              <ChevronLeft className="h-4 w-4" />
              {isZh ? '返回路径列表' : 'Back to paths'}
            </Button>

            <div className="mt-3 flex items-center gap-3">
              <Progress value={progressPercent} className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {doneCount}/{totalLessons}
              </span>
            </div>
          </motion.div>

          <Card className="border-primary/15 bg-primary/5">
            <CardContent className="flex items-start gap-3 p-4">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isZh ? '下一步建议' : 'Suggested next step'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {nextLesson
                    ? `${isZh ? nextLesson.titleZh : nextLesson.title} · ${isZh ? nextLessonTarget?.labelZh : nextLessonTarget?.label} · ${isZh ? `${nextLesson.estimatedMinutes} 分钟` : `${nextLesson.estimatedMinutes} min`}`
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
                          className="flex w-full items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50"
                        >
                          <button
                            type="button"
                            aria-label={done ? (isZh ? '已完成' : 'Completion recorded') : (isZh ? '记录完成' : 'Record completion')}
                            onClick={() => handleCompleteLesson(selectedPath, lesson)}
                            disabled={done}
                            className="mt-1 shrink-0 disabled:cursor-default"
                          >
                            {done ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenLesson(selectedPath, lesson)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <div className="flex items-center gap-3">
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
                            </div>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="rounded-md px-2 py-0.5">
                                {isZh ? target.labelZh : target.label}
                              </Badge>
                              <span>
                                {done && evidence
                                  ? (isZh
                                    ? `记录：${evidence.source} · ${new Date(evidence.completedAt).toLocaleDateString('zh-CN')}`
                                    : `Record: ${evidence.source} · ${new Date(evidence.completedAt).toLocaleDateString('en-US')}`)
                                  : (isZh ? '完成后会记录进度' : 'Completion records progress')}
                              </span>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}

          <div className="flex items-center justify-between rounded-md border bg-card px-4 py-3 text-sm text-muted-foreground">
            <span>{isZh ? '点击课程名称打开具体任务；勾选后会记录课程完成。' : 'Click a lesson to open the exact task; checking it records completion.'}</span>
            <Badge variant="secondary">{progressPercent}%</Badge>
          </div>
        </div>
      </LearningCockpitShell>
    </div>
  );
}

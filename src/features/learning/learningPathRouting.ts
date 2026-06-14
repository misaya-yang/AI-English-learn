import { learningPaths, type LearningPath, type LessonItem } from '@/data/learningPaths';
import {
  getLearningPathProgress,
  getPathCompletionPercent,
  type LearningPathLessonEvidence,
} from '@/services/learningPathProgress';

export interface LearningPathLessonTarget {
  href: string;
  surface: 'today' | 'grammar' | 'practice' | 'chat' | 'review';
  label: string;
  labelZh: string;
  evidenceSource: LearningPathLessonEvidence['source'];
}

const surfaceByType: Record<LessonItem['type'], LearningPathLessonTarget['surface']> = {
  vocabulary: 'today',
  grammar: 'grammar',
  practice: 'practice',
  conversation: 'chat',
  review: 'review',
};

const routeBySurface: Record<LearningPathLessonTarget['surface'], string> = {
  today: '/dashboard/today',
  grammar: '/dashboard/grammar',
  practice: '/dashboard/practice',
  chat: '/dashboard/chat',
  review: '/dashboard/review',
};

const labelBySurface: Record<LearningPathLessonTarget['surface'], { en: string; zh: string }> = {
  today: { en: 'Today vocabulary set', zh: 'Today 词汇任务' },
  grammar: { en: 'Grammar drill', zh: '语法练习' },
  practice: { en: 'Practice drill', zh: '专项练习' },
  chat: { en: 'Coach roleplay', zh: 'Coach 角色练习' },
  review: { en: 'FSRS review round', zh: 'FSRS 复习回合' },
};

const query = (params: Record<string, string>): string =>
  new URLSearchParams(params).toString();

export function resolveLearningPathLessonTarget(
  path: Pick<LearningPath, 'id'>,
  lesson: LessonItem,
): LearningPathLessonTarget {
  const surface = surfaceByType[lesson.type];
  const labels = labelBySurface[surface];
  const href = `${routeBySurface[surface]}?${query({
    pathId: path.id,
    pathLesson: lesson.id,
    lessonType: lesson.type,
  })}`;

  return {
    href,
    surface,
    label: `${labels.en}: ${lesson.title}`,
    labelZh: `${labels.zh}：${lesson.titleZh}`,
    evidenceSource: 'lesson.completed',
  };
}

export interface ActiveLearningPathNextLesson {
  path: LearningPath;
  lesson: LessonItem;
  target: LearningPathLessonTarget;
  progressPercent: number;
}

export function getActiveLearningPathNextLesson(userId: string): ActiveLearningPathNextLesson | null {
  const progress = getLearningPathProgress(userId);
  const path = learningPaths.find((candidate) => candidate.id === progress.activePathId);
  if (!path) return null;

  const completed = new Set(progress.completedLessonIds);
  const lessons = path.stages.flatMap((stage) => stage.units.flatMap((unit) => unit.lessons));
  const lesson = lessons.find((candidate) => !completed.has(candidate.id));
  if (!lesson) return null;

  return {
    path,
    lesson,
    target: resolveLearningPathLessonTarget(path, lesson),
    progressPercent: getPathCompletionPercent(progress.completedLessonIds, lessons.map((item) => item.id)),
  };
}

import { beforeEach, describe, expect, it } from 'vitest';

import { learningPaths } from '@/data/learningPaths';
import {
  completeLearningPathLesson,
  setLearningPathActivePath,
} from '@/services/learningPathProgress';

import {
  getActiveLearningPathNextLesson,
  resolveLearningPathLessonTarget,
} from './learningPathRouting';

describe('learningPathRouting', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('routes a lesson to a concrete target with path context', () => {
    const path = learningPaths[0];
    const lesson = path.stages[0].units[0].lessons[0];
    const target = resolveLearningPathLessonTarget(path, lesson);

    expect(target.href).toBe('/dashboard/today?pathId=daily-english&pathLesson=de-l1&lessonType=vocabulary');
    expect(target.label).toContain(lesson.title);
    expect(target.evidenceSource).toBe('lesson.completed');
  });

  it('returns the next incomplete lesson for the active path', () => {
    setLearningPathActivePath('user-1', 'daily-english');
    completeLearningPathLesson('user-1', 'de-l1', {
      pathId: 'daily-english',
      targetHref: '/dashboard/today?pathLesson=de-l1',
      completedAt: '2026-06-13T00:00:00.000Z',
    });

    const next = getActiveLearningPathNextLesson('user-1');

    expect(next?.path.id).toBe('daily-english');
    expect(next?.lesson.id).toBe('de-l2');
    expect(next?.target.href).toContain('pathLesson=de-l2');
    expect(next?.progressPercent).toBe(6);
  });

  it('returns null when the stored active path is missing', () => {
    setLearningPathActivePath('user-1', 'missing-path');

    expect(getActiveLearningPathNextLesson('user-1')).toBeNull();
  });
});

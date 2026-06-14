import { beforeEach, describe, expect, it } from 'vitest';

import {
  completeLearningPathLesson,
  getLearningPathProgress,
  getPathCompletionPercent,
  setLearningPathActivePath,
  toggleLearningPathLesson,
} from '@/services/learningPathProgress';

describe('learningPathProgress', () => {
  const userId = 'user-learning-path';

  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty default state', () => {
    expect(getLearningPathProgress(userId)).toEqual({
      completedLessonIds: [],
      lessonEvidence: {},
      activePathId: null,
      updatedAt: null,
    });
  });

  it('stores the active path per user', () => {
    const next = setLearningPathActivePath(userId, 'daily-english');

    expect(next.activePathId).toBe('daily-english');
    expect(getLearningPathProgress(userId).activePathId).toBe('daily-english');
  });

  it('toggles lesson completion without duplicating IDs', () => {
    toggleLearningPathLesson(userId, 'lesson-1');
    toggleLearningPathLesson(userId, 'lesson-2');

    expect(getLearningPathProgress(userId).completedLessonIds).toEqual(['lesson-1', 'lesson-2']);
    expect(getLearningPathProgress(userId).lessonEvidence['lesson-1']?.source).toBe('lesson.completed');

    toggleLearningPathLesson(userId, 'lesson-1');
    expect(getLearningPathProgress(userId).completedLessonIds).toEqual(['lesson-2']);
    expect(getLearningPathProgress(userId).lessonEvidence['lesson-1']).toBeUndefined();
  });

  it('stores lesson completion with evidence metadata', () => {
    completeLearningPathLesson(userId, 'lesson-1', {
      pathId: 'daily-english',
      targetHref: '/dashboard/today?pathLesson=lesson-1',
      completedAt: '2026-06-13T00:00:00.000Z',
    });

    expect(getLearningPathProgress(userId)).toEqual(expect.objectContaining({
      completedLessonIds: ['lesson-1'],
      lessonEvidence: {
        'lesson-1': {
          source: 'lesson.completed',
          pathId: 'daily-english',
          targetHref: '/dashboard/today?pathLesson=lesson-1',
          completedAt: '2026-06-13T00:00:00.000Z',
        },
      },
    }));
  });

  it('computes completion percentage', () => {
    expect(getPathCompletionPercent(['a', 'b'], ['a', 'b', 'c', 'd'])).toBe(50);
    expect(getPathCompletionPercent([], [])).toBe(0);
  });
});

import { beforeEach, describe, expect, it } from 'vitest';

import {
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

    toggleLearningPathLesson(userId, 'lesson-1');
    expect(getLearningPathProgress(userId).completedLessonIds).toEqual(['lesson-2']);
  });

  it('computes completion percentage', () => {
    expect(getPathCompletionPercent(['a', 'b'], ['a', 'b', 'c', 'd'])).toBe(50);
    expect(getPathCompletionPercent([], [])).toBe(0);
  });
});


import { describe, it, expect } from 'vitest';
import { learningPaths, getPathById, getLessonById } from './learningPaths';

describe('learningPaths', () => {
  it('has exactly 5 paths', () => {
    expect(learningPaths.length).toBe(5);
  });

  it('each path has at least 12 lessons', () => {
    for (const p of learningPaths) {
      expect(p.totalLessons).toBeGreaterThanOrEqual(12);
    }
  });

  it('all paths have unique IDs', () => {
    const ids = learningPaths.map((p) => p.id);
    expect(new Set(ids).size).toBe(5);
  });

  it('all lessons have unique IDs within their path', () => {
    for (const path of learningPaths) {
      const lessonIds: string[] = [];
      for (const stage of path.stages) {
        for (const unit of stage.units) {
          for (const lesson of unit.lessons) {
            lessonIds.push(lesson.id);
          }
        }
      }
      expect(new Set(lessonIds).size).toBe(lessonIds.length);
    }
  });

  describe('getPathById', () => {
    it('returns path for valid ID', () => {
      expect(getPathById('daily-english')).toBeDefined();
    });

    it('returns undefined for invalid ID', () => {
      expect(getPathById('nonexistent')).toBeUndefined();
    });
  });

  describe('getLessonById', () => {
    it('returns lesson for valid IDs', () => {
      const lesson = getLessonById('daily-english', 'de-l1');
      expect(lesson).toBeDefined();
      expect(lesson?.title).toBe('Basic Greetings');
    });

    it('returns undefined for invalid IDs', () => {
      expect(getLessonById('daily-english', 'nonexistent')).toBeUndefined();
    });
  });
});

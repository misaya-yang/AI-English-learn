import { describe, it, expect } from 'vitest';
import {
  countWords,
  countSentences,
  averageWordLength,
  uniqueWordRatio,
  buildSuggestionsFromFeedback,
  gradeLocally,
  inferIeltsTaskType,
  mapIeltsFeedbackToWritingGradeResult,
} from './writingAnalytics';
import type { AiFeedback } from '@/types/examContent';

describe('writingAnalytics', () => {
  describe('countWords', () => {
    it('counts words correctly', () => {
      expect(countWords('hello world')).toBe(2);
      expect(countWords('  spaced   out  ')).toBe(2);
      expect(countWords('')).toBe(0);
    });
  });

  describe('countSentences', () => {
    it('counts sentences by punctuation', () => {
      expect(countSentences('Hello. World!')).toBe(2);
      expect(countSentences('One sentence')).toBe(1);
      expect(countSentences('A. B. C.')).toBe(3);
    });
  });

  describe('averageWordLength', () => {
    it('computes average', () => {
      expect(averageWordLength('hi me')).toBe(2);
      expect(averageWordLength('')).toBe(0);
    });
  });

  describe('uniqueWordRatio', () => {
    it('returns 1 for all unique', () => {
      expect(uniqueWordRatio('the quick brown fox')).toBe(1);
    });

    it('returns < 1 for repeated words', () => {
      expect(uniqueWordRatio('the the the')).toBeCloseTo(1 / 3);
    });

    it('returns 0 for empty', () => {
      expect(uniqueWordRatio('')).toBe(0);
    });
  });

  describe('gradeLocally', () => {
    it('returns complete grade result', () => {
      const text = 'This is a sample essay about learning English. I study every day because I want to improve my skills. Practice makes perfect and consistency is key.';
      const result = gradeLocally(text, 'free');

      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.sentenceCount).toBeGreaterThan(0);
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.hasAiFeedback).toBe(false);
      expect(result.bandScore).toBeNull();
      expect(result.dimensions.taskAchievement).toBeDefined();
      expect(result.dimensions.lexicalResource).toBeDefined();
    });

    it('returns band score for IELTS type', () => {
      const result = gradeLocally('Some text about a topic.', 'ielts');
      expect(result.bandScore).toBeGreaterThanOrEqual(0);
      expect(result.bandScore).toBeLessThanOrEqual(9);
    });
  });

  describe('inferIeltsTaskType', () => {
    it('detects task 1 prompts', () => {
      expect(inferIeltsTaskType('The chart shows changes in transport usage over time.')).toBe('task1');
    });

    it('defaults to task 2 for opinion essays', () => {
      expect(inferIeltsTaskType('Some people think public transport should receive more funding.')).toBe('task2');
    });
  });

  describe('mapIeltsFeedbackToWritingGradeResult', () => {
    const feedback: AiFeedback = {
      attemptId: 'attempt-1',
      scores: {
        taskResponse: 6.5,
        coherenceCohesion: 6,
        lexicalResource: 6.5,
        grammaticalRangeAccuracy: 5.5,
        overallBand: 6,
      },
      issues: [
        {
          tag: 'grammar',
          severity: 'medium',
          sentence: 'People go to city for work.',
          message: 'Article usage is weak in noun phrases.',
          suggestion: 'Use articles more accurately in singular countable nouns.',
          correction: 'People go to the city for work.',
        },
      ],
      rewrites: ['A clearer thesis statement would make your position easier to follow.'],
      nextActions: ['Add one more concrete example in the second body paragraph.'],
      confidence: 0.7,
      provider: 'edge',
      createdAt: '2026-04-18T00:00:00.000Z',
      summary: 'Solid structure, but grammar accuracy still limits the band score.',
      summaryZh: '整体结构不错，但语法准确度仍然限制了分数。',
    };

    it('converts IELTS feedback into the writing page shape', () => {
      const result = mapIeltsFeedbackToWritingGradeResult(
        feedback,
        'People go to city for work. Public transport matters.',
      );

      expect(result.bandScore).toBe(6);
      expect(result.overallScore).toBeGreaterThan(60);
      expect(result.hasAiFeedback).toBe(true);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.dimensions.grammaticalRange.feedback).toContain('Article usage');
    });

    it('builds suggestions from issues and rewrites', () => {
      const suggestions = buildSuggestionsFromFeedback(feedback);
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].type).toBe('grammar');
      expect(suggestions[1].type).toBe('style');
    });
  });
});

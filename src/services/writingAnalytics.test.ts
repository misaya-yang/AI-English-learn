import { describe, it, expect } from 'vitest';
import {
  countWords,
  countSentences,
  averageWordLength,
  uniqueWordRatio,
  gradeLocally,
} from './writingAnalytics';

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
});

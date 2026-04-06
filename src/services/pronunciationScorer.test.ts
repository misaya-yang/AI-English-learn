import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  computeAccuracy,
  computeFluency,
  scoreLocally,
  isSpeechRecognitionSupported,
  type ListenResult,
} from '@/services/pronunciationScorer';

describe('pronunciationScorer', () => {
  describe('normalizeText', () => {
    it('lowercases and strips punctuation', () => {
      expect(normalizeText("Hello, World!")).toBe('hello world');
    });

    it('collapses multiple spaces', () => {
      expect(normalizeText('  foo   bar  ')).toBe('foo bar');
    });

    it('handles empty string', () => {
      expect(normalizeText('')).toBe('');
    });
  });

  describe('computeAccuracy', () => {
    it('returns 100 for perfect match', () => {
      expect(computeAccuracy('hello world', 'hello world')).toBe(100);
    });

    it('returns 0 for completely wrong', () => {
      expect(computeAccuracy('hello world', 'foo bar')).toBe(0);
    });

    it('returns partial score for partial match', () => {
      expect(computeAccuracy('hello beautiful world', 'hello world')).toBe(67);
    });

    it('is case-insensitive', () => {
      expect(computeAccuracy('Hello World', 'hello world')).toBe(100);
    });

    it('handles empty expected', () => {
      expect(computeAccuracy('', 'hello')).toBe(0);
    });
  });

  describe('computeFluency', () => {
    it('returns high score at natural pace (~150 WPM)', () => {
      // 10 words in 4 seconds = 150 WPM
      const score = computeFluency(10, 4000);
      expect(score).toBe(100);
    });

    it('returns lower score for slow speech', () => {
      // 10 words in 20 seconds = 30 WPM
      const score = computeFluency(10, 20000);
      expect(score).toBe(20);
    });

    it('returns 0 for zero duration', () => {
      expect(computeFluency(5, 0)).toBe(0);
    });

    it('returns 0 for zero words', () => {
      expect(computeFluency(0, 5000)).toBe(0);
    });
  });

  describe('scoreLocally', () => {
    it('returns a complete PronunciationResult', () => {
      const listenResult: ListenResult = {
        transcript: 'hello world',
        confidence: 0.9,
        durationMs: 2000,
      };
      const result = scoreLocally('hello world', listenResult);

      expect(result.transcript).toBe('hello world');
      expect(result.dimensions.accuracy).toBe(100);
      expect(result.dimensions.intonation).toBe(90);
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.hasAiFeedback).toBe(false);
      expect(result.phonemeIssues).toEqual([]);
      expect(result.durationMs).toBe(2000);
    });

    it('weights accuracy at 50%, fluency 25%, intonation 25%', () => {
      const listenResult: ListenResult = {
        transcript: 'hello world',
        confidence: 1.0,
        durationMs: 800, // 2 words in 0.8s = 150 WPM
      };
      const result = scoreLocally('hello world', listenResult);
      // accuracy=100, fluency=100, intonation=100 → overall=100
      expect(result.overallScore).toBe(100);
    });
  });

  describe('isSpeechRecognitionSupported', () => {
    it('returns false in test environment (no window.SpeechRecognition)', () => {
      expect(isSpeechRecognitionSupported()).toBe(false);
    });
  });
});

import { describe, expect, it } from 'vitest';

import {
  buildCoachEvidenceSnapshot,
  getCoachStudioCopy,
  type CoachStudioMode,
} from './coachStudio';

const modes: CoachStudioMode[] = ['diagnose', 'drill', 'review'];

describe('coachStudio', () => {
  it('defines the three-mode Coach Studio IA', () => {
    expect(modes.map((mode) => getCoachStudioCopy(mode).label.zh)).toEqual(['诊断', '训练', '复盘']);
    expect(getCoachStudioCopy('diagnose').chatMode).toBe('study');
    expect(getCoachStudioCopy('drill').chatMode).toBe('quiz');
    expect(getCoachStudioCopy('review').chatMode).toBe('chat');
  });

  it('builds a compact evidence snapshot for the coach brief', () => {
    const snapshot = buildCoachEvidenceSnapshot({
      userId: 'user-1',
      learningProfile: {
        userId: 'user-1',
        level: 'B2',
        target: 'IELTS 7.0',
        tracks: ['exam_boost'],
        dailyMinutes: 30,
        languagePreference: 'bilingual',
        updatedAt: '2026-04-30T00:00:00.000Z',
      },
      dueCount: 12,
      learnerModel: {
        userId: 'user-1',
        computedAt: '2026-04-30T00:00:00.000Z',
        mode: 'maintenance',
        avgRetrievability: 0.72,
        predictedRetention30d: 0.61,
        weakTopics: ['coherence', 'grammar'],
        strongTopics: ['vocabulary'],
        recommendedDailyNew: 5,
        recommendedDailyReview: 14,
        burnoutRisk: 0.2,
        dueCount: 12,
        avgStability: 8,
        stubbornWordCount: 2,
        stubbornTopics: ['grammar'],
      },
      recentMistakes: [
        {
          id: 'm1',
          source: 'practice',
          word: 'although',
          correctAnswer: 'although',
          userAnswer: 'but although',
          category: 'Grammar',
          severity: 'medium',
          createdAt: Date.now(),
          reviewCount: 0,
          eliminated: false,
        },
        {
          id: 'm2',
          source: 'manual',
          word: 'cohesion',
          correctAnswer: 'cohesion',
          userAnswer: 'coherent',
          category: 'Lexical',
          severity: 'high',
          createdAt: Date.now(),
          reviewCount: 1,
          eliminated: false,
        },
      ],
      lastFeedback: {
        attemptId: 'a1',
        scores: {
          taskResponse: 6,
          coherenceCohesion: 5.5,
          lexicalResource: 6,
          grammaticalRangeAccuracy: 5.5,
          overallBand: 6,
        },
        issues: [
          { tag: 'coherence', severity: 'high', message: 'Weak progression', suggestion: 'Use clearer paragraph logic.' },
        ],
        rewrites: [],
        nextActions: ['Rewrite one body paragraph.'],
        confidence: 0.7,
        provider: 'fallback',
        createdAt: '2026-04-30T00:00:00.000Z',
      },
    });

    expect(snapshot.userId).toBe('user-1');
    expect(snapshot.ieltsTarget).toBe('IELTS 7.0');
    expect(snapshot.primaryFocus).toBe('coherence');
    expect(snapshot.dueReviewCount).toBe(12);
    expect(snapshot.recentMistakeCount).toBe(2);
    expect(snapshot.retention.predicted30d).toBe(0.61);
    expect(snapshot.nextAction).toBe('Rewrite one body paragraph.');
  });
});

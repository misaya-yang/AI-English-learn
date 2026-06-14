import { describe, expect, it } from 'vitest';
import type { LearningProfile } from '@/types/examContent';
import { buildMissionCard, deriveWeaknessesFromEvents } from './learningEngine';

const profile = (overrides: Partial<LearningProfile> = {}): LearningProfile => ({
  userId: 'user-1',
  level: 'B1',
  target: 'general_improvement',
  tracks: ['daily_communication'],
  dailyMinutes: 20,
  learningStyle: 'visual',
  languagePreference: 'bilingual',
  updatedAt: '2026-06-13T00:00:00.000Z',
  ...overrides,
});

describe('buildMissionCard CEFR ranking', () => {
  it('uses foundation copy for A1 daily vocabulary work', () => {
    const card = buildMissionCard({
      mission: null,
      profile: profile({ level: 'A1' }),
      dueWordsCount: 0,
      dailyWordsCount: 8,
      learnedTodayCount: 0,
      activeBookName: 'A1 Foundation',
      weaknesses: [],
    });

    expect(card.primaryAction.id).toBe('primary-today');
    expect(card.primaryAction.title).toBe('Build a simple foundation set');
    expect(card.primaryAction.description).toContain('concrete');
    expect(card.primaryAction.titleZh).toBe('先打稳基础高频词');
  });

  it('uses advanced output copy for C1 daily vocabulary work', () => {
    const card = buildMissionCard({
      mission: null,
      profile: profile({ level: 'C1' }),
      dueWordsCount: 0,
      dailyWordsCount: 8,
      learnedTodayCount: 0,
      activeBookName: 'IELTS Academic Core',
      weaknesses: [],
    });

    expect(card.primaryAction.id).toBe('primary-today');
    expect(card.primaryAction.title).toBe('Push advanced vocabulary into output');
    expect(card.primaryAction.description).toContain('collocations');
    expect(card.primaryAction.titleZh).toBe('把高级词推进到输出里');
  });

  it('prioritizes exam-facing work for B2+ IELTS learners when daily words are done', () => {
    const card = buildMissionCard({
      mission: null,
      profile: profile({
        level: 'B2',
        target: 'IELTS 7.0',
        tracks: ['exam_boost'],
      }),
      dueWordsCount: 0,
      dailyWordsCount: 8,
      learnedTodayCount: 8,
      recommendedUnitTitle: 'Task 2 Coherence',
      activeBookName: 'IELTS Academic Core',
      weaknesses: [],
    });

    expect(card.primaryAction.id).toBe('primary-exam-boost');
    expect(card.primaryAction.href).toBe('/dashboard/exam');
    expect(card.primaryAction.reason).toBe('exam_boost');
  });
});

describe('deriveWeaknessesFromEvents recovery signals', () => {
  it('turns unresolved stubborn-word recovery into a retention weakness', () => {
    const weaknesses = deriveWeaknessesFromEvents([
      {
        id: 'event-1',
        userId: 'user-1',
        eventName: 'evidence.review.recovery_marked',
        eventSource: 'web',
        payload: {
          wordId: 'w1',
          outcome: 'still_confusing',
          trigger: 'both',
        },
        createdAt: '2026-06-13T00:00:00.000Z',
      },
    ]);

    expect(weaknesses[0]).toEqual(expect.objectContaining({
      tag: 'retention',
      title: 'Retention recall',
      count: 2,
    }));
  });
});

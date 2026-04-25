import { describe, expect, it } from 'vitest';

import {
  buildSessionRecap,
  type ReviewSessionStats,
  type PracticeSessionStats,
} from './sessionRecap';

const baseReview = (overrides: Partial<ReviewSessionStats> = {}): ReviewSessionStats => ({
  again: 0,
  hard: 0,
  good: 0,
  easy: 0,
  ...overrides,
});

const basePractice = (overrides: Partial<PracticeSessionStats> = {}): PracticeSessionStats => ({
  total: 0,
  correct: 0,
  incorrect: 0,
  ...overrides,
});

describe('buildSessionRecap (review)', () => {
  it('reports nothing improved / needs review when nothing was reviewed', () => {
    const recap = buildSessionRecap({ kind: 'review', stats: baseReview() });
    expect(recap.improved).toBeNull();
    expect(recap.needsReview).toBeNull();
    expect(recap.encouragement.en).toMatch(/no cards reviewed/i);
    expect(recap.nextAction.href).toBe('/dashboard/today');
  });

  it('lists improved + struggling counts and routes to Practice when there is friction', () => {
    const recap = buildSessionRecap({
      kind: 'review',
      stats: baseReview({ good: 4, easy: 1, hard: 2, again: 1 }),
    });
    expect(recap.improved?.count).toBe(5);
    expect(recap.needsReview?.count).toBe(3);
    expect(recap.encouragement.en).toMatch(/5\/8/);
    expect(recap.nextAction.href).toBe('/dashboard/practice');
  });

  it('upgrades the encouragement when accuracy is high', () => {
    const recap = buildSessionRecap({
      kind: 'review',
      stats: baseReview({ good: 8, easy: 1, hard: 1 }),
    });
    expect(recap.encouragement.en).toMatch(/strong retention/i);
  });

  it('downgrades the encouragement when accuracy is low (but never empty praise)', () => {
    const recap = buildSessionRecap({
      kind: 'review',
      stats: baseReview({ again: 5, hard: 4, good: 1 }),
    });
    expect(recap.encouragement.en).toMatch(/Hard set today/);
    expect(recap.encouragement.en).not.toMatch(/great job/i);
  });

  it('routes to coach reviews when the queue has due items', () => {
    const recap = buildSessionRecap({
      kind: 'review',
      stats: baseReview({ good: 3 }),
      coachReviews: { dueCount: 2, topSkills: ['grammar'] },
    });
    expect(recap.nextAction.href).toBe('/dashboard/review');
    expect(recap.nextAction.ctaEn).toContain('coach review');
  });

  it('routes to exam prep on a clean review when the learner is on an IELTS path', () => {
    const recap = buildSessionRecap({
      kind: 'review',
      stats: baseReview({ good: 6, easy: 4 }),
      examType: 'IELTS',
    });
    expect(recap.nextAction.href).toBe('/dashboard/exam');
  });

  it('Chinese phrasing flips on language input', () => {
    const recap = buildSessionRecap({
      kind: 'review',
      stats: baseReview({ good: 3 }),
      language: 'zh-CN',
    });
    expect(recap.improved?.label.zh).toBe('3 张卡评为 Good / Easy');
    expect(recap.encouragement.zh).toBeDefined();
    expect(recap.nextAction.ctaZh).toBeDefined();
  });
});

describe('buildSessionRecap (practice)', () => {
  it('returns a no-op recap for an empty session', () => {
    const recap = buildSessionRecap({ kind: 'practice', stats: basePractice() });
    expect(recap.improved).toBeNull();
    expect(recap.needsReview).toBeNull();
    expect(recap.encouragement.en).toMatch(/no questions answered/i);
    expect(recap.nextAction.href).toBe('/dashboard/today');
  });

  it('routes to chat for Socratic recovery when there are mistakes', () => {
    const recap = buildSessionRecap({
      kind: 'practice',
      stats: basePractice({ total: 5, correct: 3, incorrect: 2 }),
    });
    expect(recap.improved?.count).toBe(3);
    expect(recap.needsReview?.count).toBe(2);
    expect(recap.nextAction.href).toBe('/dashboard/chat');
    expect(recap.nextAction.ctaEn.toLowerCase()).toContain('coach');
  });

  it('routes to coach reviews when the queue has due items even after a mistake-free session', () => {
    const recap = buildSessionRecap({
      kind: 'practice',
      stats: basePractice({ total: 5, correct: 5 }),
      coachReviews: { dueCount: 1 },
    });
    expect(recap.nextAction.href).toBe('/dashboard/review');
  });

  it('routes to exam prep on a clean practice when learner is on an IELTS path', () => {
    const recap = buildSessionRecap({
      kind: 'practice',
      stats: basePractice({ total: 5, correct: 5 }),
      examType: 'IELTS',
    });
    expect(recap.nextAction.href).toBe('/dashboard/exam');
  });

  it('falls back to Today on a clean practice with no coach work and no exam goal', () => {
    const recap = buildSessionRecap({
      kind: 'practice',
      stats: basePractice({ total: 5, correct: 5 }),
    });
    expect(recap.nextAction.href).toBe('/dashboard/today');
  });

  it('encouragement scales with accuracy and stays specific', () => {
    expect(
      buildSessionRecap({ kind: 'practice', stats: basePractice({ total: 10, correct: 9, incorrect: 1 }) })
        .encouragement.en,
    ).toMatch(/9\/10/);
    expect(
      buildSessionRecap({ kind: 'practice', stats: basePractice({ total: 10, correct: 5, incorrect: 5 }) })
        .encouragement.en,
    ).toMatch(/5\/10/);
    expect(
      buildSessionRecap({ kind: 'practice', stats: basePractice({ total: 10, correct: 2, incorrect: 8 }) })
        .encouragement.en,
    ).toMatch(/Tough drill/);
  });
});

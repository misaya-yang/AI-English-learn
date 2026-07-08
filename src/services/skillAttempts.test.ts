import { describe, expect, it } from 'vitest';

import { createEvidenceEvent } from './evidenceEvents';
import type { LearningEventRecord } from './learningEvents';
import {
  buildRemediationFromAttempt,
  createSkillAttempt,
  evidenceEventToSkillAttempt,
  learningEventToSkillAttempt,
} from './skillAttempts';

const NOW = '2026-07-08T12:00:00.000Z';

const persistedRow = (
  eventName: string,
  payload: Record<string, unknown>,
): LearningEventRecord => ({
  id: `event-${eventName}`,
  userId: 'user-1',
  eventName,
  eventSource: 'web',
  payload,
  createdAt: NOW,
});

describe('createSkillAttempt', () => {
  it('defaults to personal scope and user_action source', () => {
    const attempt = createSkillAttempt({
      userId: 'user-1',
      surface: 'practice',
      skill: 'vocabulary',
      contentRefType: 'word',
      contentRefId: 'word-1',
      durationMs: 1200,
      createdAt: NOW,
    });

    expect(attempt).toMatchObject({
      userId: 'user-1',
      scope: 'personal',
      surface: 'practice',
      skill: 'vocabulary',
      source: 'user_action',
      fallbackUsed: false,
      contentRefType: 'word',
      contentRefId: 'word-1',
    });
    expect(attempt.id).toMatch(/^attempt_/);
  });

  it('requires userId and content reference', () => {
    expect(() =>
      createSkillAttempt({
        userId: '',
        surface: 'practice',
        skill: 'vocabulary',
        contentRefType: 'word',
        contentRefId: 'word-1',
      }),
    ).toThrow('userId');

    expect(() =>
      createSkillAttempt({
        userId: 'user-1',
        surface: 'practice',
        skill: 'vocabulary',
        contentRefType: '',
        contentRefId: 'word-1',
      }),
    ).toThrow('contentRefType');
  });
});

describe('evidenceEventToSkillAttempt', () => {
  it('maps practice.incorrect into a scored vocabulary attempt with mistake tags', () => {
    const event = createEvidenceEvent({
      type: 'practice.incorrect',
      userId: 'user-1',
      wordId: 'word-1',
      mode: 'quiz',
      createdAt: NOW,
    });

    const attempt = evidenceEventToSkillAttempt(event, { durationMs: 9000 });

    expect(attempt).toMatchObject({
      userId: 'user-1',
      surface: 'practice',
      skill: 'vocabulary',
      subskill: 'word_meaning',
      contentRefType: 'word',
      contentRefId: 'word-1',
      score: 0,
      maxScore: 1,
      accuracy: 0,
      durationMs: 9000,
      mistakeTags: ['practice_incorrect', 'mode_quiz'],
    });
  });

  it('preserves org context when supplied by an assignment', () => {
    const event = createEvidenceEvent({
      type: 'review.rated',
      userId: 'user-1',
      wordId: 'word-1',
      rating: 'good',
      createdAt: NOW,
    });

    const attempt = evidenceEventToSkillAttempt(event, {
      orgId: 'org-1',
      cohortId: 'cohort-1',
      assignmentId: 'assignment-1',
      source: 'assignment',
    });

    expect(attempt).toMatchObject({
      scope: 'org',
      orgId: 'org-1',
      cohortId: 'cohort-1',
      assignmentId: 'assignment-1',
      source: 'assignment',
      surface: 'review',
      accuracy: 1,
    });
  });
});

describe('learningEventToSkillAttempt', () => {
  it('maps persisted evidence payloads back to canonical attempts', () => {
    const attempt = learningEventToSkillAttempt(
      persistedRow('evidence.review.rated', {
        wordId: 'word-1',
        rating: 'again',
        evidenceCreatedAt: NOW,
      }),
    );

    expect(attempt).toMatchObject({
      userId: 'user-1',
      surface: 'review',
      skill: 'vocabulary',
      contentRefId: 'word-1',
      score: 0,
      accuracy: 0,
      mistakeTags: ['review_again'],
    });
  });

  it('returns null for non-evidence events', () => {
    expect(learningEventToSkillAttempt(persistedRow('chat.message_sent', {}))).toBeNull();
  });
});

describe('buildRemediationFromAttempt', () => {
  it('creates practice remediation for incorrect vocabulary attempts', () => {
    const attempt = evidenceEventToSkillAttempt(
      createEvidenceEvent({
        type: 'practice.incorrect',
        userId: 'user-1',
        wordId: 'word-1',
        mode: 'quiz',
        createdAt: NOW,
      }),
    );

    const remediation = buildRemediationFromAttempt(attempt, {
      dueAt: '2026-07-09T00:00:00.000Z',
    });

    expect(remediation).toMatchObject({
      userId: 'user-1',
      status: 'open',
      targetSurface: 'practice',
      createdBy: 'system',
      dueAt: '2026-07-09T00:00:00.000Z',
      skill: 'vocabulary',
      contentRefId: 'word-1',
    });
  });

  it('does not create remediation for successful attempts', () => {
    const attempt = evidenceEventToSkillAttempt(
      createEvidenceEvent({
        type: 'review.rated',
        userId: 'user-1',
        wordId: 'word-1',
        rating: 'easy',
        createdAt: NOW,
      }),
    );

    expect(buildRemediationFromAttempt(attempt)).toBeNull();
  });
});

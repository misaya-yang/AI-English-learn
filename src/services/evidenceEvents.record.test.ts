import { beforeEach, describe, expect, it, vi } from 'vitest';

import { recordLearningEvent } from './learningEvents';
import { createEvidenceEvent, recordEvidence } from './evidenceEvents';

vi.mock('./learningEvents', () => ({
  recordLearningEvent: vi.fn().mockResolvedValue(undefined),
}));

const NOW = '2026-07-08T12:00:00.000Z';
const recordLearningEventMock = vi.mocked(recordLearningEvent);

describe('recordEvidence canonical skill attempt snapshot', () => {
  beforeEach(() => {
    recordLearningEventMock.mockClear();
  });

  it('adds a canonical skillAttempt snapshot to the learning event payload', async () => {
    await recordEvidence(
      createEvidenceEvent({
        type: 'practice.incorrect',
        userId: 'user-1',
        wordId: 'word-1',
        mode: 'quiz',
        createdAt: NOW,
      }),
      { sessionId: 'session-1' },
    );

    expect(recordLearningEventMock).toHaveBeenCalledWith({
      userId: 'user-1',
      eventName: 'evidence.practice.incorrect',
      payload: expect.objectContaining({
        wordId: 'word-1',
        mode: 'quiz',
        evidenceCreatedAt: NOW,
        skillAttempt: expect.objectContaining({
          userId: 'user-1',
          surface: 'practice',
          skill: 'vocabulary',
          contentRefType: 'word',
          contentRefId: 'word-1',
          accuracy: 0,
          mistakeTags: ['practice_incorrect', 'mode_quiz'],
        }),
      }),
      sessionId: 'session-1',
    });
  });

  it('applies organization context to the skillAttempt snapshot without changing the event name', async () => {
    await recordEvidence(
      createEvidenceEvent({
        type: 'review.rated',
        userId: 'user-1',
        wordId: 'word-1',
        rating: 'good',
        createdAt: NOW,
      }),
      {
        skillAttemptContext: {
          orgId: 'org-1',
          cohortId: 'cohort-1',
          assignmentId: 'assignment-1',
          source: 'assignment',
        },
      },
    );

    expect(recordLearningEventMock).toHaveBeenCalledWith(expect.objectContaining({
      eventName: 'evidence.review.rated',
      payload: expect.objectContaining({
        skillAttempt: expect.objectContaining({
          scope: 'org',
          orgId: 'org-1',
          cohortId: 'cohort-1',
          assignmentId: 'assignment-1',
          source: 'assignment',
        }),
      }),
    }));
  });

  it('does not persist when skipPersist is true', async () => {
    await recordEvidence(
      createEvidenceEvent({
        type: 'vocab.learned',
        userId: 'user-1',
        wordId: 'word-1',
        createdAt: NOW,
      }),
      { skipPersist: true },
    );

    expect(recordLearningEventMock).not.toHaveBeenCalled();
  });
});

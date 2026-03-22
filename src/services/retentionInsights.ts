import type { UserProgress } from '@/data/localStorage';
import type { FSRSState } from '@/types/core';
import { isStubbornWord, retrievability } from '@/services/fsrs';
import { ensureFSRS } from '@/services/fsrsMigration';

type WordLookupEntry = {
  id: string;
  word: string;
  topic?: string;
};

export interface RetentionRiskItem {
  wordId: string;
  word: string;
  topic: string;
  retrievabilityPct: number;
  difficulty: number;
  lapses: number;
  dueAt: string;
  hoursUntilDue: number;
  isOverdue: boolean;
  isStubborn: boolean;
  riskScore: number;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export function computeHighRiskWords(
  progress: UserProgress[],
  words: WordLookupEntry[],
  limit = 10,
  now: Date = new Date(),
): RetentionRiskItem[] {
  const wordMap = new Map(words.map((word) => [word.id, word]));
  const nowMs = now.getTime();

  return progress
    .filter((item) => item.status !== 'mastered')
    .map((item) => {
      const fsrs = ensureFSRS(item as UserProgress & { fsrs?: FSRSState });
      if (!fsrs.lastReviewAt || fsrs.state === 'new') {
        return null;
      }

      const word = wordMap.get(item.wordId);
      const elapsedDays = (nowMs - new Date(fsrs.lastReviewAt).getTime()) / 86_400_000;
      const currentRetrievability = fsrs.stability > 0 ? retrievability(fsrs.stability, elapsedDays) : 0;
      const dueAtMs = new Date(fsrs.dueAt).getTime();
      const hoursUntilDue = (dueAtMs - nowMs) / 3_600_000;
      const duePressure = dueAtMs <= nowMs ? 1 : Math.max(0, 1 - hoursUntilDue / 72);
      const lapsePressure = Math.min(1, fsrs.lapses / 4);
      const difficultyPressure = Math.max(0, (fsrs.difficulty - 6) / 4);
      const riskScore = Math.round(
        clamp(
          ((1 - currentRetrievability) * 0.55 + duePressure * 0.25 + lapsePressure * 0.12 + difficultyPressure * 0.08) * 100,
          0,
          100,
        ),
      );

      return {
        wordId: item.wordId,
        word: word?.word || item.wordId,
        topic: word?.topic || 'general',
        retrievabilityPct: Math.round(currentRetrievability * 100),
        difficulty: Number(fsrs.difficulty.toFixed(1)),
        lapses: fsrs.lapses,
        dueAt: fsrs.dueAt,
        hoursUntilDue,
        isOverdue: dueAtMs <= nowMs,
        isStubborn: isStubbornWord(fsrs),
        riskScore,
      } satisfies RetentionRiskItem;
    })
    .filter((item): item is RetentionRiskItem => item !== null)
    .sort((a, b) => b.riskScore - a.riskScore || a.hoursUntilDue - b.hoursUntilDue)
    .slice(0, limit);
}

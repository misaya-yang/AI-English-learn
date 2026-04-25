// reviewQueue.ts — pure assembly of the FSRS-due review session.
//
// Previously the Review page silently fell back to "today's daily words"
// when there were no actual due cards. That made the surface feel busy
// but also misled the learner about retention pressure: a session that
// claimed "10 reviews" was sometimes 0 reviews and 10 fresh words. The
// LEARN-04 contract explicitly bans the fallback — empty due ⇒ empty
// session.
//
// This helper is the single source of truth for "what cards belong in
// the FSRS review session". Coach-scheduled reviews live in their own
// queue (`src/services/coachReviewQueue.ts`) and are surfaced separately
// by the CoachReviewRail; they are never folded into this list.

import { ensureFSRS } from '@/services/fsrsMigration';
import type { UserProgress } from '@/data/localStorage';
import type { WordData } from '@/data/words';
import type { FSRSState } from '@/types/core';

export interface ReviewSessionItem {
  wordId: string;
  word: WordData;
  reviewCount: number;
  fsrs: FSRSState;
}

interface BuildReviewSessionInput {
  dueWords: UserProgress[];
  /**
   * Words from the active book + the bundled vocabulary. Only used as a
   * lookup table to attach `WordData` to a due-word id; never spliced
   * into the session as fillers.
   */
  wordCatalog: WordData[];
}

export function buildReviewSession({
  dueWords,
  wordCatalog,
}: BuildReviewSessionInput): ReviewSessionItem[] {
  if (!Array.isArray(dueWords) || dueWords.length === 0) return [];

  const wordsById = new Map<string, WordData>();
  for (const word of wordCatalog) {
    if (word && typeof word.id === 'string' && !wordsById.has(word.id)) {
      wordsById.set(word.id, word);
    }
  }

  const out: ReviewSessionItem[] = [];
  for (const dueWord of dueWords) {
    if (!dueWord || typeof dueWord.wordId !== 'string') continue;
    const word = wordsById.get(dueWord.wordId);
    if (!word) continue;
    out.push({
      wordId: dueWord.wordId,
      word,
      reviewCount: dueWord.reviewCount ?? 0,
      fsrs: ensureFSRS(dueWord as UserProgress & { fsrs?: FSRSState }),
    });
  }
  return out;
}

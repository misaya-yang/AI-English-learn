// practiceMistakes.ts — convert a Practice attempt into a MistakeEntry input.
//
// PracticePage submits answers across several modes (quiz, listening,
// roleplay, pronunciation). We want every wrong answer to feed the
// shared mistake collector so it can drive Coach context (COACH-01),
// the Mistakes book, and the future reinforcement queue. This pure
// helper handles the mapping so the page itself does not encode
// mistake-shape rules and the logic is unit-testable.

import type { MistakeSource } from '@/services/mistakeCollector';

export type PracticeMode =
  | 'quiz'
  | 'listening'
  | 'pronunciation'
  | 'roleplay'
  | 'writing'
  | 'reading'
  | 'grammar'
  | (string & { __brand?: never });

export interface PracticeAttemptInput {
  word: { id: string; word: string };
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  mode: PracticeMode;
}

export interface PracticeMistakeRecord {
  source: MistakeSource;
  word: string;
  correctAnswer: string;
  userAnswer: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
}

const SOURCE_BY_MODE: Record<string, MistakeSource> = {
  quiz: 'practice',
  listening: 'practice',
  pronunciation: 'pronunciation',
  roleplay: 'roleplay',
  writing: 'practice',
  reading: 'practice',
  grammar: 'practice',
};

const CATEGORY_BY_MODE: Record<string, string> = {
  quiz: 'Vocabulary',
  listening: 'Listening Dictation',
  pronunciation: 'Pronunciation Drill',
  roleplay: 'Pragmatic Use',
  writing: 'Writing Coherence',
  reading: 'Reading Comprehension',
  grammar: 'Grammar',
};

const safeString = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const computeSeverity = (
  userAnswer: string,
  correctAnswer: string,
): 'low' | 'medium' | 'high' => {
  const submitted = safeString(userAnswer).toLowerCase();
  const expected = safeString(correctAnswer).toLowerCase();
  if (!submitted) return 'high';
  if (submitted === expected) return 'low';
  // If the submitted answer is at least 80% similar (Levenshtein-ish using
  // length difference as a cheap proxy), treat it as a low-severity slip;
  // wildly different answers signal a deeper misunderstanding.
  const minLen = Math.min(submitted.length, expected.length);
  const maxLen = Math.max(submitted.length, expected.length, 1);
  let same = 0;
  for (let i = 0; i < minLen; i += 1) {
    if (submitted[i] === expected[i]) same += 1;
  }
  const ratio = same / maxLen;
  if (ratio >= 0.8) return 'low';
  if (ratio >= 0.4) return 'medium';
  return 'high';
};

/**
 * Build the MistakeEntry-shaped record we should write for a Practice
 * attempt. Returns `null` for correct attempts and for inputs missing
 * the word identity (we never write a mistake for an unknown word).
 */
export function buildPracticeMistakeRecord(
  input: PracticeAttemptInput,
): PracticeMistakeRecord | null {
  if (!input || input.isCorrect) return null;

  const word = safeString(input.word?.word);
  if (!word) return null;

  const mode = (typeof input.mode === 'string' ? input.mode : 'quiz').toLowerCase();
  const source = SOURCE_BY_MODE[mode] ?? 'practice';
  const category = CATEGORY_BY_MODE[mode] ?? 'Practice';

  return {
    source,
    word,
    userAnswer: safeString(input.userAnswer),
    correctAnswer: safeString(input.correctAnswer) || word,
    category,
    severity: computeSeverity(input.userAnswer, input.correctAnswer),
  };
}

export function isPracticeMode(value: string): value is PracticeMode {
  return typeof value === 'string' && value.trim().length > 0;
}

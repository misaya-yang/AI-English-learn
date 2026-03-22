import type { WordData } from '@/data/words';
import type { UserProgress } from '@/data/localStorage';
import { isStubbornWord, retrievability } from '@/services/fsrs';
import { ensureFSRS } from '@/services/fsrsMigration';

export interface PracticeQuestion {
  id: string;
  word: WordData;
  question: string;
  questionZh: string;
  options: string[];
  correctAnswer: string;
  type: 'multiple_choice' | 'fill_blank';
}

export interface PracticeRuntimeOptions {
  progress?: UserProgress[];
  limit?: number;
  now?: Date;
}

const normalizeSeed = (seed: string): number => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) || 1;
};

const seededOrder = <T,>(items: T[], seed: string, pick: (item: T) => string): T[] => {
  const baseSeed = normalizeSeed(seed);
  return [...items].sort((a, b) => {
    const aScore = normalizeSeed(`${baseSeed}:${pick(a)}`);
    const bScore = normalizeSeed(`${baseSeed}:${pick(b)}`);
    return aScore - bScore;
  });
};

const stableOptionOrder = (options: string[], seed: string): string[] =>
  seededOrder(options, seed, (option) => option.toLowerCase().trim());

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);

const overlapScore = (left: string[], right: string[]): number => {
  if (left.length === 0 || right.length === 0) return 0;
  const rightSet = new Set(right);
  let overlap = 0;
  left.forEach((token) => {
    if (rightSet.has(token)) overlap += 1;
  });
  return overlap;
};

const distractorScore = (target: WordData, candidate: WordData): number => {
  const targetDefinitionTokens = tokenize(target.definition);
  const candidateDefinitionTokens = tokenize(candidate.definition);
  const targetCollocationTokens = tokenize(target.collocations.join(' '));
  const candidateCollocationTokens = tokenize(candidate.collocations.join(' '));
  const targetSynonyms = new Set(target.synonyms.map((item) => item.toLowerCase()));
  const candidateSynonyms = new Set(candidate.synonyms.map((item) => item.toLowerCase()));

  let score = 0;

  if (target.topic === candidate.topic) score += 2.4;
  if (target.level === candidate.level) score += 1.2;
  if (target.partOfSpeech === candidate.partOfSpeech) score += 1.1;
  if (targetSynonyms.has(candidate.word.toLowerCase()) || candidateSynonyms.has(target.word.toLowerCase())) {
    score += 2.6;
  }

  score += overlapScore(targetDefinitionTokens, candidateDefinitionTokens) * 0.75;
  score += overlapScore(targetCollocationTokens, candidateCollocationTokens) * 0.45;
  score += Math.max(0, 1.5 - Math.abs(target.word.length - candidate.word.length) * 0.15);

  return score;
};

const progressPriority = (
  wordId: string,
  progressMap: Map<string, UserProgress>,
  now: Date,
): number => {
  const progress = progressMap.get(wordId);
  if (!progress || progress.status === 'new') return 1;
  if (progress.status === 'mastered') return Number.NEGATIVE_INFINITY;

  const fsrs = ensureFSRS(progress);
  const dueAtMs = new Date(progress.nextReview || fsrs.dueAt).getTime();
  const duePressureDays = Math.max(0, now.getTime() - dueAtMs) / 86_400_000;
  const elapsedDays = fsrs.lastReviewAt
    ? Math.max(0, now.getTime() - new Date(fsrs.lastReviewAt).getTime()) / 86_400_000
    : 0;
  const currentRetrievability =
    fsrs.stability > 0 ? retrievability(fsrs.stability, elapsedDays) : 0;
  const incorrectCount = progress.incorrectCount ?? 0;
  const correctCount = progress.correctCount ?? 0;
  const totalAttempts = Math.max(1, incorrectCount + correctCount);
  const errorRate = incorrectCount / totalAttempts;
  const statusWeight =
    progress.status === 'review'
      ? 2.2
      : progress.status === 'learning'
        ? 1.5
        : 1;

  return (
    statusWeight +
    duePressureDays * 2.5 +
    (1 - currentRetrievability) * 2.4 +
    errorRate * 1.8 +
    fsrs.lapses * 0.8 +
    (isStubbornWord(fsrs) ? 2.2 : 0)
  );
};

export const rankDistractorCandidates = (
  target: WordData,
  candidates: WordData[],
  seed = 'vocabdaily-practice',
): WordData[] =>
  seededOrder(
    candidates.filter((candidate) => candidate.id !== target.id),
    `${seed}:${target.id}:distractor-order`,
    (candidate) => candidate.id,
  ).sort((left, right) => distractorScore(target, right) - distractorScore(target, left));

export const buildPracticeWordOrder = (
  words: WordData[],
  seed = 'vocabdaily-practice',
  options: PracticeRuntimeOptions = {},
): WordData[] => {
  const limit = options.limit ?? 10;
  const now = options.now ?? new Date();
  const progressMap = new Map((options.progress || []).map((item) => [item.wordId, item]));
  const ranked = seededOrder(words, `${seed}:base`, (word) => word.id)
    .map((word, index) => ({
      word,
      seededIndex: index,
      priority: progressPriority(word.id, progressMap, now),
    }))
    .filter((entry) => Number.isFinite(entry.priority))
    .sort((left, right) => {
      if (right.priority !== left.priority) return right.priority - left.priority;
      return left.seededIndex - right.seededIndex;
    });

  const remaining = [...ranked];
  const ordered: WordData[] = [];

  while (remaining.length > 0 && ordered.length < limit) {
    const previous = ordered[ordered.length - 1];
    let nextIndex = remaining.findIndex((entry) => entry.word.topic !== previous?.topic);
    if (nextIndex === -1) {
      nextIndex = remaining.findIndex((entry) => entry.word.level !== previous?.level);
    }
    if (nextIndex === -1) nextIndex = 0;
    ordered.push(remaining.splice(nextIndex, 1)[0].word);
  }

  return ordered;
};

export const buildPracticeQuestions = (
  words: WordData[],
  mode: 'quiz' | 'fill_blank',
  seed = 'vocabdaily-practice',
  options: PracticeRuntimeOptions = {},
): PracticeQuestion[] => {
  const orderedWords = buildPracticeWordOrder(words, `${seed}:${mode}`, options);
  const questions: PracticeQuestion[] = [];

  orderedWords.forEach((word, index) => {
    const otherWords = rankDistractorCandidates(
      word,
      orderedWords.filter((candidate) => candidate.id !== word.id),
      `${seed}:${word.id}`,
    );

    if (mode === 'quiz') {
      const distractors = otherWords.slice(0, 3).map((candidate) => candidate.definition);
      questions.push({
        id: `mc-${word.id}-${index}`,
        word,
        question: `What does "${word.word}" mean?`,
        questionZh: `"${word.word}" 是什么意思？`,
        options: stableOptionOrder([word.definition, ...distractors], `${seed}:${word.id}:options`),
        correctAnswer: word.definition,
        type: 'multiple_choice',
      });
      return;
    }

    const example = word.examples[0];
    if (!example) return;
    const blankedSentence = example.en.replace(new RegExp(`\\b${word.word}\\b`, 'gi'), '______');
    if (blankedSentence === example.en) return;

    const distractorWords = otherWords.slice(0, 3).map((candidate) => candidate.word);
    questions.push({
      id: `fb-${word.id}-${index}`,
      word,
      question: `Complete: "${blankedSentence}"`,
      questionZh: `填空: "${example.zh}"`,
      options: stableOptionOrder([word.word, ...distractorWords], `${seed}:${word.id}:fill-options`),
      correctAnswer: word.word,
      type: 'multiple_choice',
    });
  });

  return questions.slice(0, options.limit ?? 10);
};

export const buildListeningQueue = (
  words: WordData[],
  seed = 'vocabdaily-listening',
  options: PracticeRuntimeOptions = {},
): WordData[] => buildPracticeWordOrder(words, seed, options).slice(0, options.limit ?? 10);

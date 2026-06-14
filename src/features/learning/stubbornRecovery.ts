import type { WordData } from '@/data/words';
import {
  isStubbornWord,
  STUBBORN_DIFFICULTY_THRESHOLD,
  STUBBORN_LAPSE_THRESHOLD,
} from '@/services/fsrs';
import type { FSRSState } from '@/types/core';

export type StubbornRecoveryTrigger = 'lapse' | 'difficulty' | 'both';
export type StubbornRecoveryOutcome = 'helped' | 'still_confusing';

export interface StubbornRecoveryPlan {
  wordId: string;
  trigger: StubbornRecoveryTrigger;
  title: string;
  titleZh: string;
  reason: string;
  reasonZh: string;
  mnemonic: string;
  mnemonicZh: string;
  collocationDrill: string;
  collocationDrillZh: string;
  confusingNote: string;
  confusingNoteZh: string;
  productionTask: string;
  productionTaskZh: string;
  coachPrompt: string;
  metrics: {
    lapses: number;
    difficulty: number;
  };
}

interface BuildStubbornRecoveryPlanInput {
  wordId: string;
  word: WordData;
  fsrs: Pick<FSRSState, 'lapses' | 'difficulty'>;
  reviewCount: number;
}

export function getStubbornRecoveryTrigger(
  fsrs: Pick<FSRSState, 'lapses' | 'difficulty'>,
): StubbornRecoveryTrigger | null {
  const lapse = fsrs.lapses >= STUBBORN_LAPSE_THRESHOLD;
  const difficulty = fsrs.difficulty >= STUBBORN_DIFFICULTY_THRESHOLD;
  if (lapse && difficulty) return 'both';
  if (lapse) return 'lapse';
  if (difficulty) return 'difficulty';
  return null;
}

export function buildStubbornRecoveryPlan(
  item: BuildStubbornRecoveryPlanInput,
): StubbornRecoveryPlan | null {
  if (!isStubbornWord(item.fsrs)) return null;

  const trigger = getStubbornRecoveryTrigger(item.fsrs);
  if (!trigger) return null;

  const firstExample = item.word.examples[0]?.en || `I can use ${item.word.word} in a clear sentence.`;
  const firstExampleZh = item.word.examples[0]?.zh || `我可以用 ${item.word.word} 写出一个清楚的句子。`;
  const collocation = item.word.collocations[0] || `${item.word.word} clearly`;
  const synonym = item.word.synonyms[0];
  const antonym = item.word.antonyms[0];
  const contrast = antonym || synonym || 'a nearby word';

  const reason =
    trigger === 'both'
      ? `This card has lapsed ${item.fsrs.lapses} times and its difficulty is ${item.fsrs.difficulty.toFixed(1)}.`
      : trigger === 'lapse'
        ? `This card has lapsed ${item.fsrs.lapses} times, so another flashcard pass is not enough.`
        : `This card is marked high difficulty (${item.fsrs.difficulty.toFixed(1)}), so it needs a clearer hook.`;

  const reasonZh =
    trigger === 'both'
      ? `这张卡已经遗忘 ${item.fsrs.lapses} 次，难度 ${item.fsrs.difficulty.toFixed(1)}，需要换一种练法。`
      : trigger === 'lapse'
        ? `这张卡已经遗忘 ${item.fsrs.lapses} 次，单纯再刷一遍不够。`
        : `这张卡难度较高（${item.fsrs.difficulty.toFixed(1)}），需要更清楚的记忆钩子。`;

  return {
    wordId: item.wordId,
    trigger,
    title: `Recover "${item.word.word}" with one stronger hook`,
    titleZh: `用一个更强的钩子救回「${item.word.word}」`,
    reason,
    reasonZh,
    mnemonic: item.word.memoryTip || item.word.etymology || `Anchor it to this example: ${firstExample}`,
    mnemonicZh: item.word.memoryTip || item.word.etymology || `先把它钉在这个例句里：${firstExampleZh}`,
    collocationDrill: `Say "${collocation}" aloud, then swap it into one new sentence.`,
    collocationDrillZh: `先读出「${collocation}」，再把它替换进一个新句子。`,
    confusingNote: synonym
      ? `"${item.word.word}" is close to "${synonym}", but the useful phrase today is "${collocation}".`
      : `Contrast "${item.word.word}" with "${contrast}" before rating it again.`,
    confusingNoteZh: synonym
      ? `「${item.word.word}」接近「${synonym}」，但今天先抓住固定搭配「${collocation}」。`
      : `再次评分前，先把「${item.word.word}」和「${contrast}」区分开。`,
    productionTask: `Write one sentence about ${item.word.topic} using "${collocation}".`,
    productionTaskZh: `用「${collocation}」写一个关于 ${item.word.topic} 的短句。`,
    coachPrompt: `Help me recover the stubborn word "${item.word.word}" with a mnemonic, one contrast, and one sentence drill.`,
    metrics: {
      lapses: item.fsrs.lapses,
      difficulty: Number(item.fsrs.difficulty.toFixed(1)),
    },
  };
}

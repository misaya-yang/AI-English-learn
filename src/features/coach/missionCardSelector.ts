// UI-03 — Mission card selector.
//
// Pure, side-effect-free selector that maps a learner profile snapshot
// to 3-4 actionable "mission" cards rendered above the chat composer
// when there are no messages yet. Intentionally has no React imports so
// it can be unit-tested in isolation.

export type MissionAccent = 'practice' | 'coach' | 'exam' | 'memory';

export interface MissionCard {
  /** Stable id for React keys / tests. */
  id: string;
  title: string;
  titleZh?: string;
  whyRecommended: string;
  whyRecommendedZh?: string;
  /** Prompt text to seed into the chat composer when launched. */
  prompt: string;
  promptZh?: string;
  accent: MissionAccent;
}

export interface MissionLearnerProfile {
  level?: string | null;
  dueCount?: number;
  weaknessTags?: readonly string[];
  hasExamGoal?: boolean;
  /** 0..1, where >=0.6 indicates the user is showing burnout signals. */
  burnoutRisk?: number;
}

const FALLBACK_CARDS: readonly MissionCard[] = Object.freeze([
  Object.freeze({
    id: 'fallback.short-vocab',
    title: 'Start with a 5-minute vocabulary drill',
    titleZh: '做 5 分钟词汇短练习',
    whyRecommended: 'Great way to ease into today even without any history yet.',
    whyRecommendedZh: '还没有学习记录时，先从短练习开始。',
    prompt: 'Give me a 5-minute vocabulary drill tailored for a beginner.',
    promptZh: '给我一组 5 分钟的英语词汇短练习，适合初学者。',
    accent: 'practice',
  }),
  Object.freeze({
    id: 'fallback.coach',
    title: 'Tell us your goal',
    titleZh: '先说明学习目标',
    whyRecommended: 'A short conversation helps shape the next practice plan.',
    whyRecommendedZh: '先说清目标，后面的练习会更贴合。',
    prompt: 'I am new here. Ask me three questions to understand my English goal.',
    promptZh: '我是新用户。请问我三个问题，了解我的英语学习目标。',
    accent: 'coach',
  }),
  Object.freeze({
    id: 'fallback.memory',
    title: 'Try one quick memory drill',
    titleZh: '做一次记忆小练习',
    whyRecommended: 'A small win unlocks the rest of the dashboard.',
    whyRecommendedZh: '先完成一个小练习，再继续后面的任务。',
    prompt: 'Quiz me on five common high-frequency words and explain each one.',
    promptZh: '用 5 个高频词考我，并解释每个词。',
    accent: 'memory',
  }),
]) as readonly MissionCard[];

const isProfileEmpty = (p: MissionLearnerProfile | null | undefined): boolean => {
  if (!p) return true;
  const hasSignal =
    !!p.level ||
    (typeof p.dueCount === 'number' && p.dueCount > 0) ||
    (Array.isArray(p.weaknessTags) && p.weaknessTags.length > 0) ||
    !!p.hasExamGoal ||
    (typeof p.burnoutRisk === 'number' && p.burnoutRisk > 0);
  return !hasSignal;
};

const WEAKNESS_LABEL_ZH: Record<string, string> = {
  workplace_english: '职场英语',
  daily_communication: '日常沟通',
  grammar_accuracy: '语法准确性',
  lexical_resource: '词汇资源',
  pronunciation: '发音',
  listening_accuracy: '听力准确性',
  coherence: '连贯性',
  collocation: '搭配',
};

const formatWeaknessZh = (value: string): string => {
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return WEAKNESS_LABEL_ZH[normalized] || value.replace(/_/g, ' ');
};

export function selectMissionCards(
  profile: MissionLearnerProfile | null | undefined,
): MissionCard[] {
  if (isProfileEmpty(profile)) {
    return FALLBACK_CARDS.map((card) => ({ ...card }));
  }

  const p = profile as MissionLearnerProfile;
  const cards: MissionCard[] = [];
  const due = typeof p.dueCount === 'number' ? p.dueCount : 0;
  const burnout = typeof p.burnoutRisk === 'number' ? p.burnoutRisk : 0;
  const weakness = (p.weaknessTags || []).filter((tag) => typeof tag === 'string' && tag.length > 0);
  const level = (p.level || '').trim();

  if (burnout >= 0.6) {
    cards.push({
      id: 'mission.lighten',
      title: 'Lighten today and recover',
      titleZh: '今天轻一点',
      whyRecommended: 'You have been pushing hard. A low-pressure session protects momentum.',
      whyRecommendedZh: '最近练得比较满，今天降低压力更容易坚持。',
      prompt: 'I am feeling burnt out. Plan a gentle 10-minute review session for today.',
      promptZh: '我有点累。帮我安排一个轻量的 10 分钟复习。',
      accent: 'coach',
    });
  }

  if (due > 0) {
    cards.push({
      id: 'mission.review',
      title: `Clear ${due} due review${due === 1 ? '' : 's'}`,
      titleZh: `完成 ${due} 个到期复习`,
      whyRecommended: 'Reviews due today are the highest-leverage minutes you can spend.',
      whyRecommendedZh: '到期复习优先级最高，先做完最稳。',
      prompt: `I have ${due} words due for review. Quiz me on them one at a time with hints.`,
      promptZh: `我有 ${due} 个词到期复习。请一个一个考我，必要时给提示。`,
      accent: 'memory',
    });
  }

  if (weakness.length > 0) {
    const focus = weakness.slice(0, 2).join(', ');
    const focusZh = weakness.slice(0, 2).map(formatWeaknessZh).join('、');
    cards.push({
      id: 'mission.weakness',
      title: `Practice your weak spot: ${focus}`,
      titleZh: `练习薄弱点：${focusZh}`,
      whyRecommended: 'Targeting recent mistake patterns compounds faster than random drills.',
      whyRecommendedZh: '最近的错误集中在这里，先针对练。',
      prompt: `Help me practice ${focus}. Give me three tailored exercises with feedback.`,
      promptZh: `帮我练习${focusZh}。给我 3 个针对练习，并在我回答后反馈。`,
      accent: 'practice',
    });
  }

  if (p.hasExamGoal) {
    cards.push({
      id: 'mission.exam',
      title: 'Run an exam-style mini drill',
      titleZh: '做一次考试短练习',
      whyRecommended: 'Short timed reps keep your test stamina sharp.',
      whyRecommendedZh: '短计时练习可以保持考试手感。',
      prompt: 'Run a 5-minute exam-style drill in my target test format and grade my answers.',
      promptZh: '按我的目标考试形式，给我一组 5 分钟短练习，并给出评分反馈。',
      accent: 'exam',
    });
  }

  if (cards.length < 3) {
    cards.push({
      id: 'mission.coach',
      title: level ? `Plan today around ${level} level` : 'Plan today',
      titleZh: level ? `按 ${level} 水平安排今天` : '安排今天的练习',
      whyRecommended: 'A two-minute plan beats an hour of unfocused practice.',
      whyRecommendedZh: '先定下一步，比随便练更省时间。',
      prompt: level
        ? `I am at ${level}. Plan the next 20 minutes for me.`
        : 'Plan the next 20 minutes of study for me with concrete steps.',
      promptZh: level
        ? `我的水平是 ${level}。请帮我安排接下来 20 分钟的练习。`
        : '请帮我安排接下来 20 分钟的英语练习，要有具体步骤。',
      accent: 'coach',
    });
  }

  if (cards.length < 3) {
    cards.push({
      id: 'mission.memory',
      title: 'Quick memory boost',
      titleZh: '快速记忆练习',
      whyRecommended: 'Five flashcards now, durable recall later.',
      whyRecommendedZh: '先练 5 张卡，后面复习更轻松。',
      prompt: 'Quiz me on five words I should know at my level.',
      promptZh: '用 5 个符合我水平的单词考我。',
      accent: 'memory',
    });
  }

  if (cards.length < 3) {
    cards.push({
      id: 'mission.practice',
      title: 'Five-minute practice sprint',
      titleZh: '5 分钟短练习',
      whyRecommended: 'A short, focused rep beats no rep at all.',
      whyRecommendedZh: '先做一小组，比空着不练更好。',
      prompt: 'Run a five-minute mixed practice sprint and grade my answers.',
      promptZh: '给我一组 5 分钟混合练习，并批改我的答案。',
      accent: 'practice',
    });
  }

  return cards.slice(0, 4);
}

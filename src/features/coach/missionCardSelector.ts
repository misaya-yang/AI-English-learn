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
  whyRecommended: string;
  /** Prompt text to seed into the chat composer when launched. */
  prompt: string;
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
    id: 'fallback.warmup',
    title: 'Warm up with a 5-minute vocab sprint',
    whyRecommended: 'Great way to ease into today even without any history yet.',
    prompt: 'Give me a 5-minute vocabulary warm-up tailored for a beginner.',
    accent: 'practice',
  }),
  Object.freeze({
    id: 'fallback.coach',
    title: 'Tell the coach your goal',
    whyRecommended: 'A short conversation lets me build a plan around you.',
    prompt: 'I am new here. Ask me three questions to understand my English goal.',
    accent: 'coach',
  }),
  Object.freeze({
    id: 'fallback.memory',
    title: 'Try one quick memory drill',
    whyRecommended: 'A small win unlocks the rest of the dashboard.',
    prompt: 'Quiz me on five common high-frequency words and explain each one.',
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
      whyRecommended: 'You have been pushing hard — a low-pressure session protects momentum.',
      prompt: 'I am feeling burnt out. Plan a gentle 10-minute review session for today.',
      accent: 'coach',
    });
  }

  if (due > 0) {
    cards.push({
      id: 'mission.review',
      title: `Clear ${due} due review${due === 1 ? '' : 's'}`,
      whyRecommended: 'Reviews due today are the highest-leverage minutes you can spend.',
      prompt: `I have ${due} words due for review. Quiz me on them one at a time with hints.`,
      accent: 'memory',
    });
  }

  if (weakness.length > 0) {
    const focus = weakness.slice(0, 2).join(', ');
    cards.push({
      id: 'mission.weakness',
      title: `Practice your weak spot: ${focus}`,
      whyRecommended: 'Targeting recent mistake patterns compounds faster than random drills.',
      prompt: `Help me practice ${focus}. Give me three tailored exercises with feedback.`,
      accent: 'practice',
    });
  }

  if (p.hasExamGoal) {
    cards.push({
      id: 'mission.exam',
      title: 'Run an exam-style mini drill',
      whyRecommended: 'Short timed reps keep your test stamina sharp.',
      prompt: 'Run a 5-minute exam-style drill in my target test format and grade my answers.',
      accent: 'exam',
    });
  }

  if (cards.length < 3) {
    cards.push({
      id: 'mission.coach',
      title: level ? `Plan today around ${level} level` : 'Plan today with the coach',
      whyRecommended: 'A two-minute plan beats an hour of unfocused practice.',
      prompt: level
        ? `I am at ${level}. Plan the next 20 minutes for me.`
        : 'Plan the next 20 minutes of study for me with concrete steps.',
      accent: 'coach',
    });
  }

  if (cards.length < 3) {
    cards.push({
      id: 'mission.memory',
      title: 'Quick memory boost',
      whyRecommended: 'Five flashcards now, durable recall later.',
      prompt: 'Quiz me on five words I should know at my level.',
      accent: 'memory',
    });
  }

  if (cards.length < 3) {
    cards.push({
      id: 'mission.practice',
      title: 'Five-minute practice sprint',
      whyRecommended: 'A short, focused rep beats no rep at all.',
      prompt: 'Run a five-minute mixed practice sprint and grade my answers.',
      accent: 'practice',
    });
  }

  return cards.slice(0, 4);
}

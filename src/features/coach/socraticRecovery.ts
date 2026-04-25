// socraticRecovery.ts — turn a wrong quiz attempt into a coach prompt that
// triggers a Socratic recovery turn instead of an answer dump.
//
// The COACHING_POLICY already mandates "ask before you tell" on every reply,
// but the model needs a signal that the learner JUST got something wrong
// for the rule to actually fire on the right turn. This helper builds the
// structured API-side prompt (what the model sees) and the matching short
// visible message (what the learner sees) so the chat history stays
// readable while the model gets enough context to produce a hint.
//
// Pure module — no React imports.

export interface SocraticRecoveryInput {
  question: string;
  userAnswer: string;
  /**
   * Optional. We deliberately do NOT serialise the correctAnswer into the
   * model prompt — letting the model decide how much to reveal is the
   * whole point of Socratic recovery. Callers that have it can still pass
   * it; the helper just ignores it for the API string.
   */
  correctAnswer?: string;
  /** Free-form skill / category label ("grammar", "vocab", ...). */
  skill?: string;
  /** Word the question targeted, when known. */
  targetWord?: string;
  language?: string;
}

export interface SocraticRecoveryPrompt {
  /** Short bilingual visible string — appears as a normal user message. */
  visible: string;
  /**
   * Long structured prompt fed to the model via apiContentOverride. Carries
   * the question + the learner's wrong choice + an explicit Socratic
   * instruction. Excludes the correct answer.
   */
  api: string;
}

const isZh = (lang?: string): boolean => Boolean(lang && lang.startsWith('zh'));

const truncate = (value: string, max: number): string => {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
};

const safeString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

/**
 * Build the chat send payload for a Socratic recovery turn. Returns null
 * when there is no question text to anchor the prompt — without a question
 * the model has nothing concrete to ask about.
 */
export function buildSocraticRecoveryPrompt(
  input: SocraticRecoveryInput,
): SocraticRecoveryPrompt | null {
  const question = truncate(safeString(input.question), 480);
  if (!question) return null;

  const userAnswer = truncate(safeString(input.userAnswer), 240);
  const skill = safeString(input.skill);
  const targetWord = safeString(input.targetWord);
  const lang = input.language;

  const skillTag = skill ? `[skill=${skill}]` : '';
  const wordTag = targetWord ? `[word=${targetWord}]` : '';
  const tagSuffix = [skillTag, wordTag].filter(Boolean).join(' ');

  if (isZh(lang)) {
    return {
      visible: '我刚刚答错了这道题，请你按 COACHING_POLICY 用 Socratic 方式带我复盘。',
      api: `LEARNER_INCORRECT_ANSWER ${tagSuffix}\n` +
           `Question: ${question}\n` +
           `My answer: ${userAnswer || '(no answer captured)'}\n` +
           '先不要直接给出正确答案。请：\n' +
           '1. 用一个简短的 Socratic 提问，引导我想清楚错在哪里；\n' +
           '2. 给我一个具体的小提示（不要直接说出答案）；\n' +
           '3. 邀请我立刻重试一次；\n' +
           '4. 在 coaching_actions 中输出 retry_with_hint，并视情况附带 schedule_review。\n' +
           '回复用中文，控制在三段以内。',
    };
  }

  return {
    visible: 'I just got that one wrong — guide me Socratically per COACHING_POLICY.',
    api: `LEARNER_INCORRECT_ANSWER ${tagSuffix}\n` +
         `Question: ${question}\n` +
         `My answer: ${userAnswer || '(no answer captured)'}\n` +
         'Do NOT reveal the correct answer yet. Instead:\n' +
         '1. Ask one short Socratic question that helps me locate the error.\n' +
         '2. Give one concrete hint (no full answer).\n' +
         '3. Invite me to retry now.\n' +
         '4. Emit a retry_with_hint action in coaching_actions, plus schedule_review if it makes sense.\n' +
         'Keep the reply under three short paragraphs.',
  };
}

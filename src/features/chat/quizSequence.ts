const QUIZ_INTENT_RE = /(quiz|测验|測驗|测试|測試|选择题|選擇題|四选一|四選一|考我|考考|questions?)/i;
const QUIZ_REQUEST_ACTION_RE = /(给我|給我|出|來|来|生成|做|做一|出题|出題|考我|测验|測驗|测试|測試|quiz|question)/i;
const QUIZ_SUMMARY_SUPPRESS_RE =
  /(总结|總結|复盘|復盤|分析|建议|建議|改进|改進|回顾|回顧|review|summary|summarize|feedback|plan|建议我|建議我)/i;
const ARABIC_QUIZ_COUNT_RE =
  /(\d{1,2})\s*(?:道|题|題|个|個)?\s*(?:题|題|questions?|question|道|quiz|quizzes|单词|詞彙|vocab|words?)/i;
const HYPHENATED_EN_QUIZ_COUNT_RE =
  /(\d{1,2})\s*[-–—]\s*(?:question|questions|quiz|quizzes|q(?:uestion)?s?)/i;
const FLEX_QUIZ_COUNT_RE =
  /(\d{1,2})\s*(?:道|题|題|个|個)[^\n\r]{0,16}?(?:题|題|question|questions|quiz|测验|測驗|测试|測試|单词|詞彙|vocab|words?)/i;
const ZH_NUMBER_RE = /([零一二三四五六七八九十两兩]{1,3})\s*(?:道|题|題|个|個)[^\n\r]{0,12}?(?:题|題|question|questions|quiz|测验|測驗|测试|測試|单词|詞彙|vocab|words?)/i;
const ZH_SIMPLE_QUIZ_COUNT_RE = /([零一二三四五六七八九十两兩]{1,3})\s*(?:道|题|題)/;
const EN_NUMBER_WORD_RE =
  /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b/i;
const HYPHENATED_EN_WORD_QUIZ_COUNT_RE =
  /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\s*[-–—]\s*(?:question|questions|quiz|quizzes)\b/i;

const EN_WORD_TO_NUMBER: Record<string, number> = {
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
};

const zhNumeralToNumber = (input: string): number | null => {
  const normalized = input.replace(/兩/g, '两');
  const digits = normalized.match(/\d+/);
  if (digits) {
    const parsed = Number(digits[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (normalized === '十') return 10;
  if (normalized.length === 1) {
    return (
      {
        零: 0,
        一: 1,
        二: 2,
        两: 2,
        三: 3,
        四: 4,
        五: 5,
        六: 6,
        七: 7,
        八: 8,
        九: 9,
      } as Record<string, number>
    )[normalized] ?? null;
  }

  if (normalized.includes('十')) {
    const [head, tail] = normalized.split('十');
    const headValue = head ? zhNumeralToNumber(head) ?? 0 : 1;
    const tailValue = tail ? zhNumeralToNumber(tail) ?? 0 : 0;
    return headValue * 10 + tailValue;
  }

  return null;
};

export const parseRequestedQuizCount = (text: string): number | null => {
  const trimmed = text.trim();
  if (!trimmed || !QUIZ_INTENT_RE.test(trimmed)) {
    return null;
  }
  const hasSummaryIntent = QUIZ_SUMMARY_SUPPRESS_RE.test(trimmed);
  const hasQuizRequestAction = QUIZ_REQUEST_ACTION_RE.test(trimmed);
  if (hasSummaryIntent && !hasQuizRequestAction) {
    return null;
  }

  const hyphenatedArabicMatch = trimmed.match(HYPHENATED_EN_QUIZ_COUNT_RE);
  if (hyphenatedArabicMatch?.[1]) {
    const parsed = Number(hyphenatedArabicMatch[1]);
    if (Number.isFinite(parsed) && parsed >= 2) {
      return Math.min(20, parsed);
    }
  }

  const hyphenatedWordMatch = trimmed.toLowerCase().match(HYPHENATED_EN_WORD_QUIZ_COUNT_RE)?.[1];
  if (hyphenatedWordMatch) {
    const parsed = EN_WORD_TO_NUMBER[hyphenatedWordMatch];
    if (parsed && parsed >= 2) {
      return Math.min(20, parsed);
    }
  }

  const arabicMatch = trimmed.match(ARABIC_QUIZ_COUNT_RE);
  if (arabicMatch?.[1]) {
    const parsed = Number(arabicMatch[1]);
    if (Number.isFinite(parsed) && parsed >= 2) {
      return Math.min(20, parsed);
    }
  }

  const flexMatch = trimmed.match(FLEX_QUIZ_COUNT_RE);
  if (flexMatch?.[1]) {
    const parsed = Number(flexMatch[1]);
    if (Number.isFinite(parsed) && parsed >= 2) {
      return Math.min(20, parsed);
    }
  }

  const zhMatch = trimmed.match(ZH_NUMBER_RE);
  const zhRaw = zhMatch?.[1] || trimmed.match(ZH_SIMPLE_QUIZ_COUNT_RE)?.[1];
  if (zhRaw) {
    const parsed = zhNumeralToNumber(zhRaw);
    if (parsed && parsed >= 2) {
      return Math.min(20, parsed);
    }
  }

  const lower = trimmed.toLowerCase();
  const enWord = lower.match(EN_NUMBER_WORD_RE)?.[1];
  if (enWord && /(quiz|question|questions|vocab|word)/i.test(lower)) {
    const parsed = EN_WORD_TO_NUMBER[enWord.toLowerCase()];
    if (parsed && parsed >= 2) {
      return Math.min(20, parsed);
    }
  }

  return null;
};

export const buildQuizSequencePrompt = (args: {
  language: string;
  seedPrompt: string;
  startIndex: number;
  questionCount: number;
  targetCount: number;
  usedWords: string[];
}): string => {
  const usedWords = args.usedWords.filter((item) => item.length > 0).slice(-10);
  if (args.language.startsWith('zh')) {
    return [
      `请为同一套英语测验生成 ${args.questionCount} 道四选一题（从第 ${args.startIndex} 题开始，总目标 ${args.targetCount} 题）。`,
      `用户原始需求：${args.seedPrompt}`,
      usedWords.length > 0 ? `避免重复这些词：${usedWords.join('、')}。` : '',
      `必须返回 ${args.questionCount} 个 quiz artifact（每题一个）。`,
      'content 只允许一句简短引导语，不要泄露答案，不要在 content 给解析。',
      '每题 explanation 限制在 2 句内（中英混合总计不超过 120 字）。',
      '严格输出结构化 JSON，不要额外代码块包裹，不要输出多余文本。',
      '题目要按序编号并覆盖不同场景。',
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    `Generate ${args.questionCount} multiple-choice quiz questions (starting from #${args.startIndex}, total target ${args.targetCount}).`,
    `Original user intent: ${args.seedPrompt}`,
    usedWords.length > 0 ? `Avoid repeating these target words: ${usedWords.join(', ')}.` : '',
    `Return exactly ${args.questionCount} quiz artifacts (one artifact per question).`,
    'Keep content as one short instruction only. Do not reveal answers in content.',
    'Keep each explanation within 2 short sentences, max 120 characters in total.',
    'Return strict structured JSON only, no markdown fences and no extra prose.',
    'Diversify contexts across questions.',
  ]
    .filter(Boolean)
    .join('\n');
};

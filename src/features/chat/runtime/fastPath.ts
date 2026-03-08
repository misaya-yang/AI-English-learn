import type { ChatFastPathDecision, ChatMode, SendMessageOptions } from '@/types/chatAgent';

const QUIZ_EXPLICIT_REQUEST_PATTERN = /(quiz|mcq|multiple choice|give me .*question|ask me .*question|给我.{0,10}(道|个)?题|出.{0,8}题|来.{0,8}题|下一题|第\s*\d+\s*题|选择题|测验题|再给我.{0,8}题|继续.{0,8}题)/i;
const REFLECTION_REQUEST_PATTERN = /(summary|summarize|plan|roadmap|review|feedback|weakness|strength|next step|总结|复盘|计划|训练计划|薄弱点|优势|下一步|回顾|评估)/i;
const QUIZ_SUPPRESS_PATTERN = /(不要出题|不要测验|只做总结|只总结|复述|停止测验|结束测验|stop quiz|no quiz|don't give (me )?(a )?quiz)/i;
const SIMPLE_GREETING_PATTERN = /^(hi|hello|hey|yo|hello there|你好(?:呀|啊|喔)?|您好|嗨|哈喽|哈囉|早上好|下午好|晚上好|在吗|在嗎|在不在)[!,.?，。！？\s]*$/i;
const FACTUAL_SEARCH_HINT_PATTERN = /(latest|today|news|price|law|policy|research|statistics|官网|来源|出处|citation|web ?search|联网|最新|时效|新闻|数据|查一下|搜一下|检索)/i;
const LOCAL_TUTORING_PATTERN = /(collocation|搭配|grammar|语法|rewrite|改写|translate|翻译|example sentence|例句|pronunciation|发音|词义|意思|difference|区别|用法|造句|quiz|测验|选择题|goal|target|学习目标|目标|speaking|口语|warm-?up|travel)/i;

const SIMPLE_GREETING_TOKENS = new Set([
  'hi',
  'hello',
  'hey',
  'yo',
  'hellothere',
  '你好',
  '你好呀',
  '你好啊',
  '你好喔',
  '您好',
  '嗨',
  '哈喽',
  '哈囉',
  '早上好',
  '下午好',
  '晚上好',
  '在吗',
  '在嗎',
  '在不在',
]);

const isChineseInput = (value: string): boolean => /[\u3400-\u9fff]/.test(value);

export const isSimpleGreetingInput = (value: string): boolean => {
  const input = value.trim();
  if (!input || input.length > 24) return false;
  if (SIMPLE_GREETING_PATTERN.test(input)) return true;

  const compact = input
    .toLowerCase()
    .replace(/[\s"'`~!@#$%^&*()_+\-=[\]{};:\\|,.<>/?，。！？、：；【】（）《》]/g, '');

  return SIMPLE_GREETING_TOKENS.has(compact);
};

export const shouldAllowAutoQuizForInput = (
  mode: ChatMode,
  userInput: string,
  quizRun?: SendMessageOptions['quizRun'],
): boolean => {
  const normalized = userInput.toLowerCase().trim();
  const suppressQuiz = QUIZ_SUPPRESS_PATTERN.test(normalized);
  if (suppressQuiz) return false;
  if (isSimpleGreetingInput(normalized)) return false;
  if (mode === 'quiz' || Boolean(quizRun?.runId)) return true;
  if (mode !== 'study') return false;

  const wantsQuiz = QUIZ_EXPLICIT_REQUEST_PATTERN.test(normalized);
  const wantsReflection = REFLECTION_REQUEST_PATTERN.test(normalized);
  if (wantsReflection && !wantsQuiz) return false;
  return wantsQuiz;
};

export const shouldSuppressQuizForInput = (userInput: string): boolean =>
  QUIZ_SUPPRESS_PATTERN.test(userInput.toLowerCase().trim());

export const shouldDisableAutoSearch = (
  mode: ChatMode,
  userInput: string,
  searchMode: NonNullable<SendMessageOptions['searchMode']>,
): boolean => {
  if (searchMode !== 'auto') return false;
  const normalized = userInput.toLowerCase().trim();
  if (!normalized) return false;
  if (isSimpleGreetingInput(normalized)) return true;
  if (mode === 'quiz' || QUIZ_EXPLICIT_REQUEST_PATTERN.test(normalized)) return true;
  if (FACTUAL_SEARCH_HINT_PATTERN.test(normalized)) return false;
  return LOCAL_TUTORING_PATTERN.test(normalized);
};

export const buildFastGreetingReply = (userInput: string): string =>
  isChineseInput(userInput)
    ? '你好！我在这儿。你今天想先练口语、词汇还是语法？'
    : "Hi! I'm here. What would you like to practice first: speaking, vocabulary, or grammar?";

export const buildFastPathDecision = (args: {
  input: string;
  mode: ChatMode;
  forceQuiz?: boolean;
  quizRun?: SendMessageOptions['quizRun'];
}): ChatFastPathDecision => {
  const shouldUseFastGreetingReply =
    isSimpleGreetingInput(args.input) &&
    !args.quizRun?.runId &&
    !args.forceQuiz;

  return {
    enabled: shouldUseFastGreetingReply,
    reason: shouldUseFastGreetingReply
      ? 'simple_greeting'
      : args.mode === 'canvas'
        ? 'canvas_mode'
        : args.forceQuiz
          ? 'quiz_forced'
          : 'normal',
  };
};

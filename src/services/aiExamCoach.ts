import {
  consumeQuota,
  saveGeneratedMicroLesson,
} from '@/data/examContent';
import type {
  AiFeedback,
  ContentUnit,
  ExamItem,
  FeedbackIssue,
  ItemAttempt,
} from '@/types/examContent';
import { invokeEdgeFunction } from './aiGateway';

const nowIso = (): string => new Date().toISOString();
const FEEDBACK_CACHE_KEY = 'vocabdaily_writing_feedback_cache_v1';
const FEEDBACK_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 3;
const EDGE_FEEDBACK_TIMEOUT_MS = 9000;

const clampBand = (value: number): number => {
  if (!Number.isFinite(value)) return 5.5;
  return Math.min(9, Math.max(0, Math.round(value * 2) / 2));
};

const splitSentences = (text: string): string[] =>
  text
    .split(/[.!?。！？]\s*/)
    .map((item) => item.trim())
    .filter(Boolean);

const lexicalVariety = (text: string): number => {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 0;
  return new Set(words).size / words.length;
};

const analyzeIssues = (answer: string, taskType: 'task1' | 'task2'): FeedbackIssue[] => {
  const issues: FeedbackIssue[] = [];
  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  const sentenceCount = splitSentences(answer).length;

  const minWords = taskType === 'task1' ? 150 : 250;

  if (wordCount < minWords) {
    issues.push({
      tag: 'task_response',
      severity: 'high',
      message: `Word count is below IELTS ${taskType.toUpperCase()} expectation (${wordCount}/${minWords}).`,
      suggestion: 'Add one more developed idea with concrete evidence and clearer conclusion.',
    });
  }

  if (sentenceCount <= 2) {
    issues.push({
      tag: 'coherence',
      severity: 'medium',
      message: 'Argument development is too compressed into very few sentences.',
      suggestion: 'Split into topic sentence, explanation, and example to improve coherence.',
    });
  }

  if (!/(however|therefore|moreover|in contrast|as a result)/i.test(answer)) {
    issues.push({
      tag: 'logic',
      severity: 'medium',
      message: 'Limited connective variety makes progression less explicit.',
      suggestion: 'Use logical connectors such as however, therefore, and in contrast.',
    });
  }

  if (!/(the|a|an)\s+[a-z]+/i.test(answer)) {
    issues.push({
      tag: 'grammar',
      severity: 'medium',
      message: 'Article usage appears weak or missing in several noun phrases.',
      suggestion: 'Review article usage for singular countable nouns in key claims.',
    });
  }

  if (lexicalVariety(answer) < 0.35) {
    issues.push({
      tag: 'lexical',
      severity: 'medium',
      message: 'Lexical range is limited and repetitive.',
      suggestion: 'Replace repeated words with precise synonyms and collocations.',
    });
  }

  return issues;
};

const buildFallbackFeedback = (
  attemptId: string,
  prompt: string,
  answer: string,
  taskType: 'task1' | 'task2',
): AiFeedback => {
  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  const variety = lexicalVariety(answer);
  const issues = analyzeIssues(answer, taskType);

  const base = taskType === 'task1' ? 5.5 : 5.0;
  const taskResponse = clampBand(base + Math.min(2, wordCount / (taskType === 'task1' ? 120 : 180)) - 1);
  const coherenceCohesion = clampBand(5 + Math.min(2, splitSentences(answer).length / 4));
  const lexicalResource = clampBand(5 + variety * 3.5);
  const grammaticalRangeAccuracy = clampBand(5 + Math.min(1.5, Math.max(0, 1.2 - issues.filter((i) => i.tag === 'grammar').length * 0.6)));
  const overallBand = clampBand(
    (taskResponse + coherenceCohesion + lexicalResource + grammaticalRangeAccuracy) / 4,
  );

  const firstSentence = splitSentences(answer)[0] || answer.slice(0, 120);
  const rewrites = [
    `Improved opening: ${firstSentence} This point can be strengthened by adding a concrete example and a clearer linker.`,
    `Higher-band alternative: In my view, ${prompt.slice(0, 80).toLowerCase()} should be evaluated with both social impact and long-term practicality in mind.`,
  ];

  return {
    attemptId,
    scores: {
      taskResponse,
      coherenceCohesion,
      lexicalResource,
      grammaticalRangeAccuracy,
      overallBand,
    },
    issues,
    rewrites,
    nextActions: [
      'Rewrite one body paragraph using claim -> reason -> example structure.',
      'Add at least 3 advanced connectors and 3 collocations relevant to the topic.',
      'Check article and tense accuracy before final submission.',
    ],
    confidence: 0.62,
    provider: 'fallback',
    createdAt: nowIso(),
  };
};

const hashText = (input: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }
  return (hash >>> 0).toString(36);
};

const isBrowser = (): boolean => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const readFeedbackCache = (): Record<string, { feedback: AiFeedback; savedAt: string }> => {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(FEEDBACK_CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, { feedback: AiFeedback; savedAt: string }>;
  } catch {
    return {};
  }
};

const writeFeedbackCache = (cache: Record<string, { feedback: AiFeedback; savedAt: string }>): void => {
  if (!isBrowser()) return;
  localStorage.setItem(FEEDBACK_CACHE_KEY, JSON.stringify(cache));
};

const getCachedFeedback = (key: string): AiFeedback | null => {
  const cache = readFeedbackCache();
  const hit = cache[key];
  if (!hit) return null;
  const age = Date.now() - new Date(hit.savedAt).getTime();
  if (!Number.isFinite(age) || age > FEEDBACK_CACHE_TTL_MS) {
    delete cache[key];
    writeFeedbackCache(cache);
    return null;
  }
  return {
    ...hit.feedback,
    provider: 'cache',
  };
};

const setCachedFeedback = (key: string, feedback: AiFeedback): void => {
  const cache = readFeedbackCache();
  cache[key] = {
    feedback,
    savedAt: nowIso(),
  };
  const keys = Object.keys(cache);
  if (keys.length > 120) {
    keys
      .sort((a, b) => new Date(cache[b].savedAt).getTime() - new Date(cache[a].savedAt).getTime())
      .slice(120)
      .forEach((expiredKey) => {
        delete cache[expiredKey];
      });
  }
  writeFeedbackCache(cache);
};

export interface PromptGenerationInput {
  taskType: 'task1' | 'task2';
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface PromptGenerationOutput {
  prompt: string;
  taskType: 'task1' | 'task2';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface WritingOutlineResult {
  intro: string;
  body1: string;
  body2: string;
  conclusion: string;
  checklist: string[];
}

export interface VocabUpgradeSuggestion {
  from: string;
  to: string;
  rationale: string;
  example: string;
}

const TASK2_TEMPLATES: Record<'easy' | 'medium' | 'hard', string[]> = {
  easy: [
    'Some people think {{topic}} should receive more public funding than other priorities. To what extent do you agree or disagree?',
    'In many places, people debate whether {{topic}} is the best way to improve daily life. Discuss both views and give your opinion.',
  ],
  medium: [
    'Governments face limited budgets. Should they prioritize {{topic}} over long-term infrastructure? Discuss both sides and give your view.',
    'Some argue that focusing on {{topic}} brings immediate benefits, while others believe it creates long-term risks. To what extent do you agree?',
  ],
  hard: [
    'To what extent should policymakers treat {{topic}} as a strategic investment rather than a social expense? Give reasons and relevant examples.',
    'Critically evaluate whether prioritizing {{topic}} improves equity and productivity simultaneously. Discuss both views and present your position.',
  ],
};

const TASK1_TEMPLATES: Record<'easy' | 'medium' | 'hard', string[]> = {
  easy: [
    'The chart compares changes in {{topic}} from 2010 to 2025 in three groups. Summarize the main features and make comparisons where relevant.',
    'The line graph shows trends in {{topic}} over a 15-year period. Summarize key information and report major changes.',
  ],
  medium: [
    'The table and bar chart illustrate data about {{topic}} in five cities. Summarize the main features and compare significant differences.',
    'The charts present how {{topic}} changed across age groups between 2005 and 2025. Summarize key trends and notable contrasts.',
  ],
  hard: [
    'The diagrams and data table show changes in {{topic}} before and after a policy intervention. Summarize key features and compare outcomes precisely.',
    'The multi-source visuals describe shifts in {{topic}} by region and time. Summarize critical trends and highlight outliers.',
  ],
};

const pickOne = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export const generateRandomIeltsPrompt = (input: PromptGenerationInput): PromptGenerationOutput => {
  const topic = input.topic.trim() || 'urban transport';
  const templates = input.taskType === 'task1' ? TASK1_TEMPLATES : TASK2_TEMPLATES;
  const template = pickOne(templates[input.difficulty]);
  const prompt = template.replace(/\{\{topic\}\}/g, topic);
  return {
    prompt,
    taskType: input.taskType,
    topic,
    difficulty: input.difficulty,
  };
};

export const buildQuickOutline = (args: {
  prompt: string;
  taskType: 'task1' | 'task2';
}): WritingOutlineResult => {
  if (args.taskType === 'task1') {
    return {
      intro: 'Paraphrase the chart/table topic in one sentence and mention the time period.',
      body1: 'Report the main overall trend first (increase/decrease/stable) with one key comparison.',
      body2: 'Add secondary trends and one notable contrast or outlier with precise data language.',
      conclusion: 'Task 1 usually does not need a long conclusion; one brief summary sentence is enough.',
      checklist: [
        'Use past tense if data is historical.',
        'Avoid opinions and personal arguments.',
        'Highlight 2-3 key features, not every number.',
      ],
    };
  }

  return {
    intro: 'State your position clearly and paraphrase the question.',
    body1: 'Main reason 1 -> explanation -> concrete example.',
    body2: 'Main reason 2 (or counterargument + rebuttal) -> explanation -> example.',
    conclusion: 'Restate your position and summarize key reasoning in one concise sentence.',
    checklist: [
      'Keep one main idea per paragraph.',
      'Use connectors naturally: however, therefore, in contrast.',
      'Include specific examples, not abstract claims only.',
    ],
  };
};

const VOCAB_MAP: Array<{ from: string; to: string; rationale: string }> = [
  { from: 'very important', to: 'crucial', rationale: 'More precise academic emphasis.' },
  { from: 'a lot of', to: 'a substantial number of', rationale: 'More formal quantification.' },
  { from: 'good', to: 'beneficial', rationale: 'Avoid vague evaluative adjective.' },
  { from: 'bad', to: 'detrimental', rationale: 'Formal negative evaluation.' },
  { from: 'big problem', to: 'pressing challenge', rationale: 'Higher-band collocation.' },
  { from: 'many people think', to: 'it is widely argued that', rationale: 'Academic reporting phrase.' },
  { from: 'can help', to: 'can facilitate', rationale: 'Formal verb alternative.' },
  { from: 'make better', to: 'enhance', rationale: 'Concise high-frequency academic verb.' },
];

export const enhanceVocabularyDraft = (answer: string): VocabUpgradeSuggestion[] => {
  const lower = answer.toLowerCase();
  const found: VocabUpgradeSuggestion[] = [];
  for (const item of VOCAB_MAP) {
    if (!lower.includes(item.from)) continue;
    found.push({
      from: item.from,
      to: item.to,
      rationale: item.rationale,
      example: `Try replacing "${item.from}" with "${item.to}" in one sentence.`,
    });
    if (found.length >= 8) break;
  }
  return found;
};

export const previewFastWritingFeedback = (args: {
  attemptId: string;
  prompt: string;
  answer: string;
  taskType: 'task1' | 'task2';
}): AiFeedback => buildFallbackFeedback(args.attemptId, args.prompt, args.answer, args.taskType);

interface ChatEdgeResponse {
  content: string;
}

export const askWritingTutor = async (args: {
  userId: string;
  taskType: 'task1' | 'task2';
  prompt: string;
  draft: string;
  question: string;
}): Promise<string> => {
  const userPrompt = [
    `IELTS ${args.taskType.toUpperCase()} writing question: ${args.prompt}`,
    `Student draft (for context): ${args.draft || '(empty draft)'}`,
    `Student asks: ${args.question}`,
    'Respond in concise bilingual coaching style: English first, then Chinese summary.',
  ].join('\n\n');

  try {
    const result = await invokeEdgeFunction<ChatEdgeResponse>('ai-chat', {
      mode: 'study',
      responseStyle: 'concise',
      stream: false,
      messages: [{ role: 'user', content: userPrompt }],
      searchPolicy: {
        mode: 'off',
        alwaysShowSources: false,
        maxSearchCalls: 0,
        maxPerMinute: 4,
      },
      featureFlags: {
        enableQuizArtifacts: false,
        enableStudyArtifacts: true,
        forceQuiz: false,
        allowAutoQuiz: false,
      },
    });
    return result.content?.trim() || 'Tutor is temporarily unavailable.';
  } catch {
    return 'Tutor is temporarily unavailable. 建议先聚焦一个段落：先写清观点，再补一个具体例子。';
  }
};

export const gradeIeltsWriting = async (args: {
  userId: string;
  attemptId: string;
  prompt: string;
  answer: string;
  taskType: 'task1' | 'task2';
  sourceContext?: string;
}): Promise<AiFeedback> => {
  const cacheKey = hashText(`${args.taskType}::${args.prompt}::${args.answer}`);
  const cached = getCachedFeedback(cacheKey);
  if (cached) {
    return cached;
  }

  const fallback = previewFastWritingFeedback({
    attemptId: args.attemptId,
    prompt: args.prompt,
    answer: args.answer,
    taskType: args.taskType,
  });

  const controller = new AbortController();
  const timeoutHandle = window.setTimeout(() => controller.abort(), EDGE_FEEDBACK_TIMEOUT_MS);

  try {
    const result = await invokeEdgeFunction<AiFeedback>('ai-grade-writing', {
      userId: args.userId,
      attemptId: args.attemptId,
      prompt: args.prompt,
      answer: args.answer,
      examType: 'IELTS',
      taskType: args.taskType,
      sourceContext: args.sourceContext,
    }, { signal: controller.signal });

    if (result?.scores?.overallBand) {
      const normalized = {
        ...result,
        provider: result.provider || 'edge',
        createdAt: result.createdAt || nowIso(),
      };
      setCachedFeedback(cacheKey, normalized);
      return normalized;
    }
  } catch {
    // Fall through to local fallback feedback.
  } finally {
    window.clearTimeout(timeoutHandle);
  }

  return fallback;
};

export const generateSimulationItem = async (args: {
  userId: string;
  skill: 'writing' | 'speaking' | 'reading' | 'listening';
  bandTarget: string;
  topic: string;
}): Promise<ExamItem> => {
  try {
    const result = await invokeEdgeFunction<ExamItem>('ai-generate-sim-item', {
      examType: 'IELTS',
      ...args,
    });

    if (result?.id && result?.prompt) {
      return result;
    }
  } catch {
    // Fallback below.
  }

  return {
    id: `sim_item_${Date.now()}`,
    unitId: 'sim_generated_unit',
    examType: 'IELTS',
    skill: 'writing',
    itemType: 'writing_task_2',
    prompt: `Some people believe ${args.topic} should be the top priority for governments. To what extent do you agree or disagree?`,
    referenceAnswer:
      'A strong answer gives a clear stance, balanced reasoning, and one concrete real-world example for each body paragraph.',
    rubricId: 'rubric_ielts_writing',
    source: 'Local simulation fallback',
    license: 'Original generated content',
    attribution: 'Simulation item. Not an official exam item.',
  };
};

const normalizeTagToObjective = (tag: FeedbackIssue['tag']): string => {
  switch (tag) {
    case 'task_response':
      return 'Improve direct task response and address all parts of the question.';
    case 'coherence':
      return 'Improve paragraph flow with clearer topic sentence and linking.';
    case 'lexical':
      return 'Upgrade lexical precision and topic-specific collocations.';
    case 'grammar':
      return 'Fix grammar range and accuracy, especially article and clause errors.';
    case 'logic':
      return 'Strengthen argument logic and evidence structure.';
    case 'collocation':
      return 'Use natural collocations for higher lexical band scores.';
    case 'tense':
      return 'Control tense consistency in academic writing descriptions.';
    default:
      return 'Build a stronger IELTS writing response structure.';
  }
};

export const generateMicroLessonFromErrors = async (args: {
  userId: string;
  errorTags: FeedbackIssue['tag'][];
  targetLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}): Promise<{ unit: ContentUnit; items: ExamItem[] }> => {
  try {
    const result = await invokeEdgeFunction<{ unit: ContentUnit; items: ExamItem[] }>('ai-generate-micro-lesson', {
      userId: args.userId,
      errorTags: args.errorTags,
      targetLevel: args.targetLevel,
      targetExam: 'IELTS',
    });

    if (result?.unit?.id && Array.isArray(result.items) && result.items.length > 0) {
      saveGeneratedMicroLesson(result.unit, result.items);
      return result;
    }
  } catch {
    // Use fallback lesson below.
  }

  const tag = args.errorTags[0] || 'coherence';
  const unitId = `unit_micro_${tag}_${Date.now()}`;
  const itemId = `item_micro_${tag}_${Date.now()}`;

  const unit: ContentUnit = {
    id: unitId,
    trackId: 'track_ielts_writing_foundation',
    title: `Micro Lesson: ${tag}`,
    cefrLevel: args.targetLevel,
    estimatedMinutes: 5,
    learningObjectives: [normalizeTagToObjective(tag)],
    itemIds: [itemId],
    createdAt: nowIso(),
    source: 'AI fallback generator',
    license: 'Original generated content',
    attribution: 'Generated from learner error graph.',
  };

  const items: ExamItem[] = [
    {
      id: itemId,
      unitId,
      examType: 'IELTS',
      skill: 'writing',
      itemType: 'writing_task_2',
      prompt:
        tag === 'task_response'
          ? 'Some people think schools should focus more on life skills than academic subjects. Discuss both views and give your opinion.'
          : tag === 'grammar' || tag === 'tense'
            ? 'The chart shows changes in online shopping in three age groups from 2010 to 2020. Summarize the main trends.'
            : 'Many people believe cities should reduce private car use. To what extent do you agree or disagree?',
      referenceAnswer:
        'Build a focused thesis, maintain paragraph cohesion, and include one concrete example per argument.',
      rubricId: 'rubric_ielts_writing',
      source: 'AI fallback generator',
      license: 'Original generated content',
      attribution: 'Simulation item. Not an official exam item.',
    },
  ];

  saveGeneratedMicroLesson(unit, items);
  return { unit, items };
};

export const consumeExamFeatureQuota = consumeQuota;

export const createAttempt = (args: {
  userId: string;
  itemId: string;
  answer: string;
  skill?: ItemAttempt['skill'];
}): ItemAttempt => {
  return {
    id: `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: args.userId,
    itemId: args.itemId,
    examType: 'IELTS',
    skill: args.skill || 'writing',
    answer: args.answer,
    createdAt: nowIso(),
  };
};

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

export const gradeIeltsWriting = async (args: {
  userId: string;
  attemptId: string;
  prompt: string;
  answer: string;
  taskType: 'task1' | 'task2';
  sourceContext?: string;
}): Promise<AiFeedback> => {
  try {
    const result = await invokeEdgeFunction<AiFeedback>('ai-grade-writing', {
      userId: args.userId,
      attemptId: args.attemptId,
      prompt: args.prompt,
      answer: args.answer,
      examType: 'IELTS',
      taskType: args.taskType,
      sourceContext: args.sourceContext,
    });

    if (result?.scores?.overallBand) {
      return {
        ...result,
        provider: result.provider || 'edge',
        createdAt: result.createdAt || nowIso(),
      };
    }
  } catch {
    // Fall through to local fallback feedback.
  }

  return buildFallbackFeedback(args.attemptId, args.prompt, args.answer, args.taskType);
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

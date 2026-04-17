/**
 * Writing analytics service — local text analysis + AI grading gateway.
 */

import { invokeEdgeFunction } from '@/services/aiGateway';
import type { AiFeedback, FeedbackIssue } from '@/types/examContent';

// ─── Types ───────────────────────────────────────────────────────────────────

export type WritingType = 'free' | 'ielts' | 'business' | 'journal';

export interface WritingDimension {
  score: number; // 0–100
  label: string;
  labelZh: string;
  feedback: string;
  feedbackZh: string;
}

export interface WritingSuggestion {
  id: string;
  original: string;
  suggested: string;
  reason: string;
  reasonZh: string;
  type: 'grammar' | 'vocabulary' | 'style' | 'coherence';
}

export interface WritingGradeResult {
  overallScore: number;
  bandScore: number | null; // IELTS band 0–9, null for non-IELTS
  dimensions: {
    taskAchievement: WritingDimension;
    coherenceCohesion: WritingDimension;
    lexicalResource: WritingDimension;
    grammaticalRange: WritingDimension;
  };
  suggestions: WritingSuggestion[];
  wordCount: number;
  sentenceCount: number;
  hasAiFeedback: boolean;
}

export interface WritingEntry {
  id: string;
  type: WritingType;
  prompt: string;
  content: string;
  grade: WritingGradeResult | null;
  createdAt: string;
  updatedAt: string;
}

type WritingSuggestionType = WritingSuggestion['type'];

const IELTS_TASK_1_HINT_PATTERN = /\b(chart|graph|table|diagram|map|process|summarize the information|report the main features)\b/i;

// ─── Local text stats ────────────────────────────────────────────────────────

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
}

export function averageWordLength(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const totalChars = words.reduce((sum, w) => sum + w.replace(/[^a-zA-Z]/g, '').length, 0);
  return totalChars / words.length;
}

export function uniqueWordRatio(text: string): number {
  const words = text.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  return new Set(words).size / words.length;
}

// ─── Local scoring fallback ─────────────────────────────────────────────────

export function gradeLocally(text: string, type: WritingType): WritingGradeResult {
  const wc = countWords(text);
  const sc = countSentences(text);
  const avgLen = averageWordLength(text);
  const uniqueRatio = uniqueWordRatio(text);

  // Simple heuristic scoring
  const lengthScore = Math.min(100, Math.round((wc / 250) * 100));
  const lexicalScore = Math.round(uniqueRatio * 100);
  const grammarScore = Math.min(100, Math.round(avgLen * 15)); // longer words ≈ more complex
  const coherenceScore = Math.min(100, Math.round((sc / Math.max(1, wc / 15)) * 50));

  const overall = Math.round(lengthScore * 0.2 + lexicalScore * 0.3 + grammarScore * 0.25 + coherenceScore * 0.25);
  const bandScore = type === 'ielts' ? Math.min(9, Math.round(overall / 11)) : null;

  return {
    overallScore: overall,
    bandScore,
    dimensions: {
      taskAchievement: { score: lengthScore, label: 'Task Achievement', labelZh: '任务完成', feedback: 'Write at least 250 words for a complete response.', feedbackZh: '至少写 250 词以获得完整回答。' },
      coherenceCohesion: { score: coherenceScore, label: 'Coherence & Cohesion', labelZh: '连贯性', feedback: 'Use transition words to connect your ideas.', feedbackZh: '使用过渡词来连接你的观点。' },
      lexicalResource: { score: lexicalScore, label: 'Lexical Resource', labelZh: '词汇丰富度', feedback: 'Try using more varied vocabulary.', feedbackZh: '尝试使用更丰富的词汇。' },
      grammaticalRange: { score: grammarScore, label: 'Grammatical Range', labelZh: '语法多样性', feedback: 'Use a mix of simple and complex sentences.', feedbackZh: '混合使用简单句和复合句。' },
    },
    suggestions: [],
    wordCount: wc,
    sentenceCount: sc,
    hasAiFeedback: false,
  };
}

// ─── AI grading ─────────────────────────────────────────────────────────────

const issueTypeMap: Record<FeedbackIssue['tag'], WritingSuggestionType> = {
  task_response: 'coherence',
  coherence: 'coherence',
  lexical: 'vocabulary',
  grammar: 'grammar',
  logic: 'coherence',
  collocation: 'vocabulary',
  tense: 'grammar',
  word_count: 'style',
};

const bandToScore = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.round((Math.min(9, Math.max(0, value)) / 9) * 100);
};

export function inferIeltsTaskType(prompt: string): 'task1' | 'task2' {
  return IELTS_TASK_1_HINT_PATTERN.test(prompt) ? 'task1' : 'task2';
}

export function buildSuggestionsFromFeedback(feedback: AiFeedback): WritingSuggestion[] {
  const issueSuggestions = feedback.issues.map((issue, index) => ({
    id: `issue-${index + 1}`,
    original: issue.sentence || issue.message,
    suggested: issue.correction || issue.suggestion,
    reason: issue.message,
    reasonZh: issue.messageZh || issue.suggestionZh || issue.suggestion,
    type: issueTypeMap[issue.tag] || 'style',
  }));

  const rewriteSuggestions = feedback.rewrites.map((rewrite, index) => ({
    id: `rewrite-${index + 1}`,
    original: feedback.summary || 'Rewrite suggestion',
    suggested: rewrite,
    reason: feedback.nextActions[index] || 'Upgrade this sentence to sound clearer and more natural.',
    reasonZh: feedback.summaryZh || '根据当前批改结果进行更自然的表达升级。',
    type: 'style' as const,
  }));

  return [...issueSuggestions, ...rewriteSuggestions].slice(0, 8);
}

export function mapIeltsFeedbackToWritingGradeResult(
  feedback: AiFeedback,
  text: string,
): WritingGradeResult {
  return {
    overallScore: bandToScore(feedback.scores.overallBand),
    bandScore: feedback.scores.overallBand,
    dimensions: {
      taskAchievement: {
        score: bandToScore(feedback.scores.taskResponse),
        label: 'Task Achievement',
        labelZh: '任务完成',
        feedback: feedback.summary || 'Strengthen how directly and fully you answer the prompt.',
        feedbackZh: feedback.summaryZh || '进一步提升对题目的回应完整度和直接性。',
      },
      coherenceCohesion: {
        score: bandToScore(feedback.scores.coherenceCohesion),
        label: 'Coherence & Cohesion',
        labelZh: '连贯与衔接',
        feedback: feedback.issues.find((issue) => issue.tag === 'coherence' || issue.tag === 'logic')?.message || 'Improve logical flow between ideas.',
        feedbackZh: feedback.issues.find((issue) => issue.tag === 'coherence' || issue.tag === 'logic')?.messageZh || '继续加强论点之间的衔接和推进。',
      },
      lexicalResource: {
        score: bandToScore(feedback.scores.lexicalResource),
        label: 'Lexical Resource',
        labelZh: '词汇资源',
        feedback: feedback.issues.find((issue) => issue.tag === 'lexical' || issue.tag === 'collocation')?.message || 'Use more precise collocations and topic vocabulary.',
        feedbackZh: feedback.issues.find((issue) => issue.tag === 'lexical' || issue.tag === 'collocation')?.messageZh || '继续提升搭配准确度和主题词汇精度。',
      },
      grammaticalRange: {
        score: bandToScore(feedback.scores.grammaticalRangeAccuracy),
        label: 'Grammatical Range',
        labelZh: '语法范围与准确度',
        feedback: feedback.issues.find((issue) => issue.tag === 'grammar' || issue.tag === 'tense')?.message || 'Keep sentence structures varied while protecting accuracy.',
        feedbackZh: feedback.issues.find((issue) => issue.tag === 'grammar' || issue.tag === 'tense')?.messageZh || '在保证正确率的前提下增加句式变化。',
      },
    },
    suggestions: buildSuggestionsFromFeedback(feedback),
    wordCount: countWords(text),
    sentenceCount: countSentences(text),
    hasAiFeedback: feedback.provider === 'edge' || feedback.provider === 'cache',
  };
}

export async function gradeWithAi(
  text: string,
  type: WritingType,
  prompt: string,
  signal?: AbortSignal,
): Promise<WritingGradeResult> {
  const localResult = gradeLocally(text, type);

  if (type !== 'ielts') {
    return localResult;
  }

  try {
    const aiResult = await invokeEdgeFunction<AiFeedback>(
      'ai-grade-writing',
      {
        prompt,
        answer: text,
        taskType: inferIeltsTaskType(prompt),
      },
      { signal },
    );

    return mapIeltsFeedbackToWritingGradeResult(aiResult, text);
  } catch {
    return localResult;
  }
}

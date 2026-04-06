/**
 * Writing analytics service — local text analysis + AI grading gateway.
 */

import { invokeEdgeFunction } from '@/services/aiGateway';

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

interface AiGradeResponse {
  overallScore: number;
  bandScore: number | null;
  dimensions: WritingGradeResult['dimensions'];
  suggestions: WritingSuggestion[];
}

export async function gradeWithAi(
  text: string,
  type: WritingType,
  prompt: string,
  signal?: AbortSignal,
): Promise<WritingGradeResult> {
  const localResult = gradeLocally(text, type);

  try {
    const aiResult = await invokeEdgeFunction<AiGradeResponse>(
      'writing-grade',
      { text, type, prompt },
      { signal },
    );

    return {
      overallScore: aiResult.overallScore ?? localResult.overallScore,
      bandScore: aiResult.bandScore ?? localResult.bandScore,
      dimensions: aiResult.dimensions ?? localResult.dimensions,
      suggestions: aiResult.suggestions ?? [],
      wordCount: localResult.wordCount,
      sentenceCount: localResult.sentenceCount,
      hasAiFeedback: true,
    };
  } catch {
    return localResult;
  }
}

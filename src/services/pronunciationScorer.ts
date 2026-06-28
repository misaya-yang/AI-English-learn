/**
 * Pronunciation scoring engine.
 *
 * Uses Web Speech API SpeechRecognition to capture user speech,
 * then computes accuracy/fluency/intonation scores by comparing
 * the recognized transcript against the expected text.
 *
 * For phoneme-level feedback, delegates to the AI gateway edge function.
 */

import { invokeEdgeFunction } from '@/services/aiGateway';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PronunciationDimensions {
  /** 0–100: how closely recognized text matches the target */
  accuracy: number;
  /** 0–100: speech rate relative to natural pace */
  fluency: number;
  /** 0–100: estimated intonation quality (AI-assessed) */
  intonation: number;
}

export interface PhonemeIssue {
  /** The phoneme symbol (IPA) */
  phoneme: string;
  /** The word containing the issue */
  word: string;
  /** Severity: minor, moderate, major */
  severity: 'minor' | 'moderate' | 'major';
  /** Human-readable tip */
  tip: string;
  tipZh: string;
}

export interface PronunciationResult {
  /** Raw recognized text */
  transcript: string;
  /** Overall score 0–100 */
  overallScore: number;
  /** Dimension breakdown */
  dimensions: PronunciationDimensions;
  /** Phoneme-level issues (from AI) */
  phonemeIssues: PhonemeIssue[];
  /** Duration of the utterance in ms */
  durationMs: number;
  /** Whether AI feedback was available */
  hasAiFeedback: boolean;
}

export interface PronunciationRecord {
  id: string;
  wordId: string;
  word: string;
  phonetic: string;
  result: PronunciationResult;
  createdAt: string;
}

// ─── Speech Recognition wrapper ─────────────────────────────────────────────

/** Minimal interface for the Web Speech API SpeechRecognition object. */
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string; confidence: number } | undefined } | undefined } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionLike;
}

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as SpeechRecognitionConstructor | null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

export function createRecognition(lang = 'en-US'): SpeechRecognitionLike {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    throw new Error('SpeechRecognition is not supported in this browser.');
  }
  const recognition = new Ctor();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  return recognition;
}

export interface ListenResult {
  transcript: string;
  confidence: number;
  durationMs: number;
}

export interface ListenOnceOptions {
  timeoutMs?: number;
}

export function listenOnce(
  recognition: SpeechRecognitionLike,
  options: ListenOnceOptions = {},
): Promise<ListenResult> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const timeoutMs = options.timeoutMs ?? 10_000;
    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };

    const settle = (complete: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      complete();
    };

    const rejectWith = (error: Error) => {
      settle(() => reject(error));
    };

    recognition.onresult = (event) => {
      const alt = event.results[0]?.[0];
      if (alt) {
        settle(() => {
          resolve({
            transcript: alt.transcript,
            confidence: alt.confidence,
            durationMs: Date.now() - startTime,
          });
        });
      } else {
        rejectWith(new Error('No speech detected'));
      }
    };

    recognition.onerror = (event) => {
      rejectWith(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      rejectWith(new Error('No speech detected'));
    };

    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        rejectWith(new Error('Speech recognition timed out'));
        try {
          recognition.stop();
        } catch {
          // Recognition may already be stopped by the browser.
        }
      }, timeoutMs);
    }

    try {
      recognition.start();
    } catch (error) {
      rejectWith(error instanceof Error ? error : new Error('Speech recognition failed to start'));
    }
  });
}

// ─── Local scoring (no AI needed) ───────────────────────────────────────────

/**
 * Normalize text for comparison: lowercase, strip punctuation, collapse spaces.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compute word-level accuracy score (0–100).
 * Uses Levenshtein-like word overlap.
 */
export function computeAccuracy(expected: string, recognized: string): number {
  const expWords = normalizeText(expected).split(' ');
  const recWords = normalizeText(recognized).split(' ');

  if (expWords.length === 0) return 0;

  let matches = 0;
  const recSet = new Set(recWords);
  for (const w of expWords) {
    if (recSet.has(w)) {
      matches++;
      recSet.delete(w); // consume match
    }
  }

  return Math.round((matches / expWords.length) * 100);
}

/**
 * Compute fluency based on duration relative to expected word count.
 * Natural English: ~130-160 WPM. We assume 150 WPM as ideal.
 */
export function computeFluency(wordCount: number, durationMs: number): number {
  if (wordCount === 0 || durationMs === 0) return 0;
  const durationMinutes = durationMs / 60_000;
  const wpm = wordCount / durationMinutes;
  const idealWpm = 150;
  // Score degrades as wpm deviates from ideal
  const ratio = Math.min(wpm, idealWpm) / Math.max(wpm, idealWpm);
  return Math.round(ratio * 100);
}

/**
 * Local-only scoring (no AI). Intonation defaults to confidence * 100.
 */
export function scoreLocally(
  expected: string,
  listenResult: ListenResult,
): PronunciationResult {
  const accuracy = computeAccuracy(expected, listenResult.transcript);
  const wordCount = normalizeText(expected).split(' ').length;
  const fluency = computeFluency(wordCount, listenResult.durationMs);
  const intonation = Math.round(listenResult.confidence * 100);
  const overallScore = Math.round(accuracy * 0.5 + fluency * 0.25 + intonation * 0.25);

  return {
    transcript: listenResult.transcript,
    overallScore,
    dimensions: { accuracy, fluency, intonation },
    phonemeIssues: [],
    durationMs: listenResult.durationMs,
    hasAiFeedback: false,
  };
}

// ─── AI-enhanced scoring ────────────────────────────────────────────────────

interface AiPronunciationResponse {
  accuracy: number;
  fluency: number;
  intonation: number;
  phonemeIssues: PhonemeIssue[];
}

type PronunciationAssessPayload = {
  expected: string;
  recognized: string;
  confidence: number;
  durationMs: number;
};

type PronunciationAssessMock = (
  payload: PronunciationAssessPayload,
) => AiPronunciationResponse | Promise<AiPronunciationResponse>;

declare global {
  interface Window {
    __VOCABDAILY_PRONUNCIATION_ASSESS_MOCK__?: PronunciationAssessMock;
  }
}

function getLocalPronunciationAssessMock(): PronunciationAssessMock | null {
  if (typeof window === 'undefined') return null;
  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isLocalHost) return null;
  return typeof window.__VOCABDAILY_PRONUNCIATION_ASSESS_MOCK__ === 'function'
    ? window.__VOCABDAILY_PRONUNCIATION_ASSESS_MOCK__
    : null;
}

/**
 * Send recognized speech to AI gateway for phoneme-level analysis.
 * Falls back to local scoring on failure.
 */
export async function scoreWithAi(
  expected: string,
  listenResult: ListenResult,
  signal?: AbortSignal,
): Promise<PronunciationResult> {
  const localResult = scoreLocally(expected, listenResult);

  try {
    const payload = {
      expected,
      recognized: listenResult.transcript,
      confidence: listenResult.confidence,
      durationMs: listenResult.durationMs,
    };
    const localMock = getLocalPronunciationAssessMock();
    const aiResult = localMock
      ? await localMock(payload)
      : await invokeEdgeFunction<AiPronunciationResponse>(
          'pronunciation-assess',
          payload,
          { signal },
        );

    const accuracy = aiResult.accuracy ?? localResult.dimensions.accuracy;
    const fluency = aiResult.fluency ?? localResult.dimensions.fluency;
    const intonation = aiResult.intonation ?? localResult.dimensions.intonation;
    const overallScore = Math.round(accuracy * 0.5 + fluency * 0.25 + intonation * 0.25);

    return {
      transcript: listenResult.transcript,
      overallScore,
      dimensions: { accuracy, fluency, intonation },
      phonemeIssues: aiResult.phonemeIssues ?? [],
      durationMs: listenResult.durationMs,
      hasAiFeedback: true,
    };
  } catch {
    // Fall back to local scoring
    return localResult;
  }
}

import type { ChatArtifact, ChatSource, QuizArtifact } from '@/types/chatAgent';

const ARTIFACT_MARKER_PREFIX = '<!--vocabdaily_artifacts:';
const ARTIFACT_MARKER_SUFFIX = '-->';

const toBase64 = (value: string): string => {
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(value)));
  }

  const bufferCtor = (globalThis as { Buffer?: { from: (input: string, encoding: string) => { toString: (encoding: string) => string } } }).Buffer;
  if (bufferCtor) {
    return bufferCtor.from(value, 'utf-8').toString('base64');
  }

  return '';
};

const fromBase64 = (value: string): string => {
  if (typeof atob === 'function') {
    return decodeURIComponent(escape(atob(value)));
  }

  const bufferCtor = (globalThis as { Buffer?: { from: (input: string, encoding: string) => { toString: (encoding: string) => string } } }).Buffer;
  if (bufferCtor) {
    return bufferCtor.from(value, 'base64').toString('utf-8');
  }

  return '';
};

const normalizeQuizArtifact = (artifact: unknown): QuizArtifact | null => {
  if (!artifact || typeof artifact !== 'object') return null;
  const raw = artifact as Partial<QuizArtifact>;
  const payload = raw.payload as QuizArtifact['payload'] | undefined;
  if (raw.type !== 'quiz' || !payload) return null;

  const options = Array.isArray(payload.options)
    ? payload.options
        .filter((option) => option && typeof option.id === 'string' && typeof option.text === 'string')
        .map((option) => ({ id: option.id, text: option.text }))
    : [];

  if (!payload.quizId || !payload.stem || !payload.answerKey || options.length < 2) {
    return null;
  }

  return {
    type: 'quiz',
    payload: {
      quizId: payload.quizId,
      title: payload.title || 'Quick Quiz',
      questionType: payload.questionType || 'multiple_choice',
      stem: payload.stem,
      options,
      answerKey: payload.answerKey,
      explanation: payload.explanation || '',
      difficulty:
        payload.difficulty === 'easy' || payload.difficulty === 'hard'
          ? payload.difficulty
          : 'medium',
      skills: Array.isArray(payload.skills) ? payload.skills.filter((skill): skill is string => typeof skill === 'string') : [],
      estimatedSeconds: Number.isFinite(payload.estimatedSeconds) ? Number(payload.estimatedSeconds) : 45,
      targetWord: typeof payload.targetWord === 'string' ? payload.targetWord : undefined,
      tags: Array.isArray(payload.tags) ? payload.tags.filter((tag): tag is string => typeof tag === 'string') : undefined,
    },
  };
};

const normalizeSimpleArtifact = (artifact: unknown): ChatArtifact | null => {
  if (!artifact || typeof artifact !== 'object') return null;
  const raw = artifact as ChatArtifact;

  if (raw.type === 'study_plan' && raw.payload && typeof raw.payload === 'object') {
    const payload = raw.payload as ChatArtifact['payload'] & { title?: string; steps?: unknown };
    const steps = Array.isArray(payload.steps)
      ? payload.steps.filter((step): step is string => typeof step === 'string' && step.trim().length > 0)
      : [];

    if (!payload.title || steps.length === 0) return null;

    return {
      type: 'study_plan',
      payload: {
        title: payload.title,
        steps,
        estimatedMinutes:
          typeof (payload as { estimatedMinutes?: unknown }).estimatedMinutes === 'number'
            ? (payload as { estimatedMinutes: number }).estimatedMinutes
            : undefined,
      },
    };
  }

  if (raw.type === 'canvas_hint' && raw.payload && typeof raw.payload === 'object') {
    const payload = raw.payload as ChatArtifact['payload'] & { title?: string; hints?: unknown };
    const hints = Array.isArray(payload.hints)
      ? payload.hints.filter((hint): hint is string => typeof hint === 'string' && hint.trim().length > 0)
      : [];

    if (!payload.title || hints.length === 0) return null;

    return {
      type: 'canvas_hint',
      payload: {
        title: payload.title,
        hints,
      },
    };
  }

  if (raw.type === 'web_sources' && raw.payload && typeof raw.payload === 'object') {
    const payload = raw.payload as ChatArtifact['payload'] & { title?: string; sources?: unknown };
    const sources: ChatSource[] = Array.isArray(payload.sources)
      ? payload.sources.reduce<ChatSource[]>((acc, source, index) => {
          if (!source || typeof source !== 'object') return acc;

          const rawSource = source as {
            id?: string;
            title?: string;
            url?: string;
            domain?: string;
            publishedAt?: string;
            snippet?: string;
            confidence?: number;
          };

          const url = typeof rawSource.url === 'string' ? rawSource.url.trim() : '';
          if (!url) return acc;

          acc.push({
            id: typeof rawSource.id === 'string' && rawSource.id.trim().length > 0 ? rawSource.id : `source_${index + 1}`,
            title: typeof rawSource.title === 'string' && rawSource.title.trim().length > 0 ? rawSource.title : url,
            url,
            domain: typeof rawSource.domain === 'string' && rawSource.domain.trim().length > 0 ? rawSource.domain : (() => {
              try {
                return new URL(url).hostname;
              } catch {
                return 'unknown';
              }
            })(),
            publishedAt:
              typeof rawSource.publishedAt === 'string' && rawSource.publishedAt.trim().length > 0
                ? rawSource.publishedAt
                : undefined,
            snippet: typeof rawSource.snippet === 'string' ? rawSource.snippet : '',
            confidence: typeof rawSource.confidence === 'number' && Number.isFinite(rawSource.confidence)
              ? Math.max(0, Math.min(1, rawSource.confidence))
              : 0.6,
          });

          return acc;
        }, [])
      : [];

    if (sources.length > 0) {
      return {
        type: 'web_sources',
        payload: {
          title:
            typeof payload.title === 'string' && payload.title.trim().length > 0
              ? payload.title
              : 'Sources',
          sources,
        },
      };
    }
  }

  if (raw.type === 'canvas_summary' && raw.payload && typeof raw.payload === 'object') {
    const payload = raw.payload as ChatArtifact['payload'] & { title?: string; summary?: string; childSessionId?: string };
    const summary = typeof payload.summary === 'string' ? payload.summary.trim() : '';
    if (!summary) return null;

    return {
      type: 'canvas_summary',
      payload: {
        title: typeof payload.title === 'string' && payload.title.trim().length > 0 ? payload.title : 'Canvas Summary',
        summary,
        childSessionId:
          typeof payload.childSessionId === 'string' && payload.childSessionId.trim().length > 0
            ? payload.childSessionId
            : undefined,
      },
    };
  }

  return null;
};

export const normalizeArtifacts = (rawArtifacts: unknown): ChatArtifact[] => {
  if (!Array.isArray(rawArtifacts)) return [];

  const normalized: ChatArtifact[] = [];

  rawArtifacts.forEach((artifact) => {
    const quiz = normalizeQuizArtifact(artifact);
    if (quiz) {
      normalized.push(quiz);
      return;
    }

    const simple = normalizeSimpleArtifact(artifact);
    if (simple) {
      normalized.push(simple);
    }
  });

  return normalized;
};

export const attachArtifactsToContent = (content: string, artifacts?: ChatArtifact[]): string => {
  if (!artifacts || artifacts.length === 0) {
    return content;
  }

  const payload = toBase64(JSON.stringify(artifacts));
  if (!payload) {
    return content;
  }

  return `${content}\n\n${ARTIFACT_MARKER_PREFIX}${payload}${ARTIFACT_MARKER_SUFFIX}`;
};

export const extractArtifactsFromContent = (
  rawContent: string,
): { content: string; artifacts: ChatArtifact[] } => {
  const start = rawContent.lastIndexOf(ARTIFACT_MARKER_PREFIX);
  if (start < 0) {
    return { content: rawContent, artifacts: [] };
  }

  const end = rawContent.indexOf(ARTIFACT_MARKER_SUFFIX, start);
  if (end < 0) {
    return { content: rawContent, artifacts: [] };
  }

  const encoded = rawContent.slice(start + ARTIFACT_MARKER_PREFIX.length, end).trim();
  const cleanContent = rawContent.slice(0, start).trimEnd();

  try {
    const decoded = fromBase64(encoded);
    if (!decoded) {
      return { content: cleanContent, artifacts: [] };
    }

    const parsed = JSON.parse(decoded);
    return { content: cleanContent, artifacts: normalizeArtifacts(parsed) };
  } catch {
    return { content: cleanContent, artifacts: [] };
  }
};

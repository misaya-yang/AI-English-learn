import { extractArtifactsFromContent, normalizeArtifacts } from '@/services/chatArtifacts';
import type { ChatArtifact, ChatSource } from '@/types/chatAgent';

export const normalizeAssistantReplyContent = (raw: unknown): string => {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const tryParseEnvelope = (input: string): string => {
    if (!input.startsWith('{') || !input.endsWith('}')) return '';
    try {
      const parsed = JSON.parse(input) as { content?: unknown; message?: unknown; text?: unknown };
      if (typeof parsed.content === 'string' && parsed.content.trim().length > 0) {
        return parsed.content.trim();
      }
      if (typeof parsed.message === 'string' && parsed.message.trim().length > 0) {
        return parsed.message.trim();
      }
      if (typeof parsed.text === 'string' && parsed.text.trim().length > 0) {
        return parsed.text.trim();
      }
    } catch {
      return '';
    }
    return '';
  };

  const stripCodeFence = (value: string): string => {
    const fence = value.match(/^```(?:json|markdown|md)?\s*([\s\S]*?)```$/i);
    return fence?.[1]?.trim() || value;
  };

  const deFenced = stripCodeFence(trimmed);
  const parsedContent = tryParseEnvelope(deFenced) || tryParseEnvelope(trimmed);
  if (parsedContent) return parsedContent;

  const objectDumpMatches = deFenced.match(/\[object Object\]/g);
  if (objectDumpMatches && objectDumpMatches.length >= 2) {
    return '';
  }

  if (/^\{[\s\S]*\}$/.test(deFenced) && !deFenced.includes(' ')) {
    return '';
  }

  return deFenced;
};

const readJsonStringLiteral = (input: string, openingQuoteIndex: number): { value: string; endIndex: number } | null => {
  if (openingQuoteIndex < 0 || input[openingQuoteIndex] !== '"') return null;
  let cursor = openingQuoteIndex + 1;
  let escaped = false;
  let encoded = '';

  while (cursor < input.length) {
    const char = input[cursor];
    if (escaped) {
      encoded += char;
      escaped = false;
      cursor += 1;
      continue;
    }

    if (char === '\\') {
      encoded += char;
      escaped = true;
      cursor += 1;
      continue;
    }

    if (char === '"') {
      try {
        return {
          value: JSON.parse(`"${encoded}"`) as string,
          endIndex: cursor,
        };
      } catch {
        return {
          value: encoded,
          endIndex: cursor,
        };
      }
    }

    encoded += char;
    cursor += 1;
  }

  return null;
};

const extractJsonLikeStringField = (input: string, fieldNames: string[]): string => {
  for (const fieldName of fieldNames) {
    const pattern = new RegExp(`"${fieldName}"\\s*:`, 'i');
    const match = pattern.exec(input);
    if (!match) continue;

    let cursor = match.index + match[0].length;
    while (cursor < input.length && /\s/.test(input[cursor])) cursor += 1;
    if (input[cursor] !== '"') continue;

    const parsed = readJsonStringLiteral(input, cursor);
    if (parsed?.value?.trim()) {
      return parsed.value.trim();
    }
  }

  return '';
};

const extractJsonLikeArrayField = (input: string, fieldName: string): unknown[] => {
  const pattern = new RegExp(`"${fieldName}"\\s*:`, 'i');
  const match = pattern.exec(input);
  if (!match) return [];

  let cursor = match.index + match[0].length;
  while (cursor < input.length && /\s/.test(input[cursor])) cursor += 1;
  if (input[cursor] !== '[') return [];

  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let index = cursor; index < input.length; index += 1) {
    const char = input[index];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '[') {
      if (depth === 0) start = index;
      depth += 1;
      continue;
    }

    if (char === ']') {
      if (depth <= 0) continue;
      depth -= 1;
      if (depth === 0 && start >= 0) {
        const rawArray = input.slice(start, index + 1);
        try {
          const parsed = JSON.parse(rawArray);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
    }
  }

  return [];
};

const normalizeSources = (input: unknown[]): ChatSource[] =>
  input
    .filter((item): item is ChatSource => {
      return Boolean(
        item &&
          typeof item === 'object' &&
          typeof (item as Partial<ChatSource>).url === 'string' &&
          (item as Partial<ChatSource>).url!.trim().length > 0,
      );
    })
    .map((item, index) => {
      const typed = item as Partial<ChatSource>;
      const url = typed.url!.trim();
      let domain = '';
      try {
        domain = new URL(url).hostname;
      } catch {
        domain = typeof typed.domain === 'string' ? typed.domain : 'unknown';
      }
      return {
        id: typeof typed.id === 'string' && typed.id.trim() ? typed.id : `source_${index + 1}`,
        title: typeof typed.title === 'string' && typed.title.trim() ? typed.title : domain,
        url,
        domain,
        publishedAt: typeof typed.publishedAt === 'string' && typed.publishedAt.trim() ? typed.publishedAt : undefined,
        snippet: typeof typed.snippet === 'string' ? typed.snippet : '',
        confidence:
          typeof typed.confidence === 'number' && Number.isFinite(typed.confidence)
            ? Math.max(0, Math.min(1, typed.confidence))
            : 0.6,
      } satisfies ChatSource;
    });

export const parseEmbeddedEnvelope = (
  raw: unknown,
): { content: string; artifacts: ChatArtifact[]; sources: ChatSource[] } => {
  if (typeof raw !== 'string') {
    return { content: '', artifacts: [], sources: [] };
  }

  const text = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  if (!text) {
    return { content: '', artifacts: [], sources: [] };
  }

  const tryParse = (input: string): Record<string, unknown> | null => {
    try {
      const parsed = JSON.parse(input);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  };

  const collectLooseJsonObjects = (input: string): Array<Record<string, unknown>> => {
    const list: Array<Record<string, unknown>> = [];
    let depth = 0;
    let start = -1;
    let inString = false;
    let escaped = false;

    for (let index = 0; index < input.length; index += 1) {
      const char = input[index];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === '\\') {
          escaped = true;
          continue;
        }
        if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === '{') {
        if (depth === 0) start = index;
        depth += 1;
        continue;
      }

      if (char !== '}') continue;
      if (depth <= 0) continue;

      depth -= 1;
      if (depth === 0 && start >= 0) {
        const maybe = tryParse(input.slice(start, index + 1));
        if (maybe) {
          list.push(maybe);
        }
        start = -1;
      }
    }

    return list;
  };

  const parsedDirect = tryParse(text);
  let parsed = parsedDirect;

  if (!parsed) {
    let depth = 0;
    let start = -1;
    let inString = false;
    let escaped = false;
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === '\\') {
          escaped = true;
          continue;
        }
        if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === '{') {
        if (depth === 0) start = index;
        depth += 1;
        continue;
      }

      if (char !== '}') continue;
      if (depth <= 0) continue;

      depth -= 1;
      if (depth === 0 && start >= 0) {
        parsed = tryParse(text.slice(start, index + 1));
        if (parsed) break;
        start = -1;
      }
    }
  }

  if (!parsed) {
    const rescuedContent = extractJsonLikeStringField(text, ['content', 'message', 'text']);
    const rescuedArtifacts = normalizeArtifacts(extractJsonLikeArrayField(text, 'artifacts'));
    const rescuedSources = normalizeSources(extractJsonLikeArrayField(text, 'sources'));

    if (rescuedContent || rescuedArtifacts.length > 0 || rescuedSources.length > 0) {
      return { content: rescuedContent, artifacts: rescuedArtifacts, sources: rescuedSources };
    }

    const looseObjects = collectLooseJsonObjects(text);
    const looseArtifacts: ChatArtifact[] = [];
    let looseContent = '';
    let looseSources: ChatSource[] = [];

    for (const obj of looseObjects) {
      if (!looseContent) {
        if (typeof obj.content === 'string' && obj.content.trim()) {
          looseContent = obj.content.trim();
        } else if (typeof obj.message === 'string' && obj.message.trim()) {
          looseContent = obj.message.trim();
        }
      }

      if (looseSources.length === 0 && Array.isArray(obj.sources)) {
        looseSources = normalizeSources(obj.sources);
      }

      if (Array.isArray(obj.artifacts)) {
        looseArtifacts.push(...normalizeArtifacts(obj.artifacts));
      }

      if (typeof obj.type === 'string' && obj.type === 'quiz' && obj.payload && typeof obj.payload === 'object') {
        looseArtifacts.push(...normalizeArtifacts([{ type: 'quiz', payload: obj.payload }]));
      }

      if (
        typeof obj.quizId === 'string' &&
        typeof obj.stem === 'string' &&
        Array.isArray(obj.options) &&
        typeof obj.answerKey === 'string'
      ) {
        looseArtifacts.push(
          ...normalizeArtifacts([
            {
              type: 'quiz',
              payload: {
                quizId: obj.quizId,
                title: typeof obj.title === 'string' ? obj.title : 'Quick quiz',
                questionType: typeof obj.questionType === 'string' ? obj.questionType : 'multiple_choice',
                stem: obj.stem,
                options: obj.options,
                answerKey: obj.answerKey,
                explanation: typeof obj.explanation === 'string' ? obj.explanation : '',
                difficulty: typeof obj.difficulty === 'string' ? obj.difficulty : 'medium',
                skills: Array.isArray(obj.skills) ? obj.skills : [],
                estimatedSeconds: typeof obj.estimatedSeconds === 'number' ? obj.estimatedSeconds : 45,
                targetWord: typeof obj.targetWord === 'string' ? obj.targetWord : undefined,
                tags: Array.isArray(obj.tags) ? obj.tags : undefined,
              },
            },
          ]),
        );
      }
    }

    const dedupedArtifacts = normalizeArtifacts(looseArtifacts);
    if (dedupedArtifacts.length > 0 || looseContent || looseSources.length > 0) {
      return {
        content: looseContent,
        artifacts: dedupedArtifacts,
        sources: looseSources,
      };
    }

    return { content: '', artifacts: [], sources: [] };
  }

  const content =
    (typeof parsed.content === 'string' && parsed.content.trim()) ||
    (typeof parsed.message === 'string' && parsed.message.trim()) ||
    (typeof parsed.text === 'string' && parsed.text.trim()) ||
    '';

  const artifacts = normalizeArtifacts(Array.isArray(parsed.artifacts) ? parsed.artifacts : []);
  const sources = Array.isArray(parsed.sources) ? normalizeSources(parsed.sources) : [];
  return { content, artifacts, sources };
};

const toWebSourcesArtifact = (sources: ChatSource[]): ChatArtifact[] => {
  if (sources.length === 0) return [];
  return normalizeArtifacts([
    {
      type: 'web_sources',
      payload: {
        title: 'Sources',
        sources,
      },
    },
  ]);
};

export const normalizePersistedAssistantPayload = (
  rawContent: unknown,
  rawArtifacts?: unknown,
): { content: string; artifacts?: ChatArtifact[] } => {
  const contentValue = typeof rawContent === 'string' ? rawContent : '';
  const extracted = extractArtifactsFromContent(contentValue);
  const embedded = parseEmbeddedEnvelope(extracted.content);
  const cleanedContent =
    embedded.content ||
    normalizeAssistantReplyContent(extracted.content) ||
    extracted.content;

  const explicitArtifacts = Array.isArray(rawArtifacts) ? normalizeArtifacts(rawArtifacts) : [];
  const sourceArtifacts = toWebSourcesArtifact(embedded.sources);
  const mergedArtifacts = explicitArtifacts.length > 0
    ? explicitArtifacts
    : embedded.artifacts.length > 0
      ? [...embedded.artifacts, ...sourceArtifacts]
      : extracted.artifacts.length > 0
        ? extracted.artifacts
        : sourceArtifacts;

  return {
    content: cleanedContent,
    artifacts: mergedArtifacts.length > 0 ? mergedArtifacts : undefined,
  };
};

export const parseLooseQuizArtifactFromText = (raw: string): ChatArtifact | null => {
  if (!raw.trim()) return null;

  const text = raw
    .replace(/^```(?:markdown|md|text)?\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  if (!text) return null;

  const optionPattern = /(?:^|\n)\s*([A-D1-4])[.):：]\s*(.+)/g;
  const matches = [...text.matchAll(optionPattern)];
  if (matches.length < 2) return null;

  const firstOptionIndex = matches[0].index ?? -1;
  if (firstOptionIndex < 0) return null;

  const stem = text.slice(0, firstOptionIndex).replace(/^(?:题目|问题|Question|Q|情境|Scenario)\s*[:：]\s*/i, '').trim();
  if (!stem) return null;

  const options = matches
    .map((match) => {
      const rawId = match[1].toUpperCase();
      const id = /^[1-4]$/.test(rawId) ? String.fromCharCode(64 + Number(rawId)) : rawId;
      const optionText = (match[2] || '').trim();
      if (!optionText) return null;
      return { id, text: optionText };
    })
    .filter((item): item is { id: string; text: string } => Boolean(item));

  if (options.length < 2) return null;

  const answerMatch = text.match(/(?:correct answer|answer|正确答案|答案)\s*[:：]?\s*([A-D1-4])/i);
  if (!answerMatch?.[1]) return null;
  const rawAnswer = answerMatch[1].toUpperCase();
  const answerKey = /^[1-4]$/.test(rawAnswer) ? String.fromCharCode(64 + Number(rawAnswer)) : rawAnswer;
  if (!options.some((option) => option.id === answerKey)) return null;

  const explanationMatch = text.match(/(?:解析|explanation|why)\s*[:：]\s*([\s\S]{0,800})/i);
  const explanation = (explanationMatch?.[1] || '').trim();

  return {
    type: 'quiz',
    payload: {
      quizId: `quiz_loose_${crypto.randomUUID()}`,
      title: 'Quick quiz',
      questionType: 'multiple_choice',
      stem,
      options,
      answerKey,
      explanation: explanation || 'Choose the option that best fits the context.',
      difficulty: 'medium',
      skills: [],
      estimatedSeconds: 45,
    },
  };
};

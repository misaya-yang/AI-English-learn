export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const flattenTextContent = (value: unknown, depth = 0): string => {
  if (depth > 5 || value == null) return '';

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => flattenTextContent(item, depth + 1))
      .filter((item) => item.length > 0)
      .join('\n')
      .trim();
  }

  if (typeof value === 'object') {
    const raw = value as Record<string, unknown>;

    const preferredKeys = [
      'text',
      'content',
      'output_text',
      'reasoning_content',
      'value',
      'message',
    ];

    for (const key of preferredKeys) {
      if (key in raw) {
        const extracted = flattenTextContent(raw[key], depth + 1);
        if (extracted.length > 0) {
          return extracted;
        }
      }
    }

    const fallback = Object.entries(raw)
      .filter(([key]) => !['id', 'type', 'role', 'index', 'finish_reason'].includes(key))
      .map(([, nested]) => flattenTextContent(nested, depth + 1))
      .filter((item) => item.length > 0)
      .join('\n')
      .trim();

    return fallback;
  }

  return '';
};

export const callDeepSeek = async (payload: {
  messages: DeepSeekMessage[];
  temperature?: number;
  maxTokens?: number;
}): Promise<string> => {
  const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is missing in function env');
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: payload.messages,
      temperature: payload.temperature ?? 0.5,
      max_tokens: payload.maxTokens ?? 1800,
      stream: false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`DeepSeek API error: ${response.status} ${detail}`);
  }

  const data = await response.json();
  const content = flattenTextContent(data?.choices?.[0]?.message?.content);
  if (!content) {
    throw new Error('DeepSeek API returned empty content');
  }

  return content;
};

export const extractFirstJsonObject = <T>(text: string): T | null => {
  if (!text) return null;

  const source = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim();
  const len = source.length;
  if (len === 0) return null;

  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < len; index += 1) {
    const char = source[index];

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
      if (depth === 0) {
        start = index;
      }
      depth += 1;
      continue;
    }

    if (char !== '}') {
      continue;
    }

    if (depth <= 0) {
      continue;
    }

    depth -= 1;
    if (depth === 0 && start >= 0) {
      const candidate = source.slice(start, index + 1);
      try {
        return JSON.parse(candidate) as T;
      } catch {
        start = -1;
      }
    }
  }

  return null;
};

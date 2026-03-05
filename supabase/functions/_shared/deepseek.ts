export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekStreamOptions {
  messages: DeepSeekMessage[];
  temperature?: number;
  maxTokens?: number;
}

const flattenTextContent = (value: unknown, depth = 0): string => {
  if (depth > 5 || value == null) return '';

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => flattenTextContent(item, depth + 1))
      .filter((item) => item.trim().length > 0)
      .join('');
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
        if (extracted.trim().length > 0) {
          return extracted;
        }
      }
    }

    const fallback = Object.entries(raw)
      .filter(([key]) => !['id', 'type', 'role', 'index', 'finish_reason'].includes(key))
      .map(([, nested]) => flattenTextContent(nested, depth + 1))
      .filter((item) => item.trim().length > 0)
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
  const content = flattenTextContent(data?.choices?.[0]?.message?.content).trim();
  if (!content) {
    throw new Error('DeepSeek API returned empty content');
  }

  return content;
};

export const callDeepSeekStream = async function* (
  payload: DeepSeekStreamOptions,
): AsyncGenerator<string, string, void> {
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
      stream: true,
      stream_options: { include_usage: false },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`DeepSeek API error: ${response.status} ${detail}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await response.json().catch(() => null);
    const root = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    const choices = root && Array.isArray(root.choices) ? root.choices : [];
    const first =
      choices[0] && typeof choices[0] === 'object'
        ? (choices[0] as Record<string, unknown>)
        : null;
    const message =
      first?.message && typeof first.message === 'object'
        ? (first.message as Record<string, unknown>)
        : null;
    const direct = flattenTextContent(message?.content).trim();
    if (!direct) {
      throw new Error('DeepSeek API returned empty content');
    }
    yield direct;
    return direct;
  }

  if (!response.body) {
    throw new Error('DeepSeek streaming response body is empty');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  const extractDeltaText = (raw: unknown): string => {
    if (!raw || typeof raw !== 'object') return '';
    const source = raw as Record<string, unknown>;
    const choices = Array.isArray(source.choices) ? source.choices : [];
    const first = choices[0] && typeof choices[0] === 'object'
      ? (choices[0] as Record<string, unknown>)
      : null;
    if (!first) return '';

    const delta = first.delta && typeof first.delta === 'object'
      ? (first.delta as Record<string, unknown>)
      : null;
    if (!delta) return '';

    if (typeof delta.content === 'string') {
      return delta.content;
    }
    if (Array.isArray(delta.content)) {
      return delta.content
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            const value = item as Record<string, unknown>;
            if (typeof value.text === 'string') return value.text;
            if (typeof value.content === 'string') return value.content;
          }
          return '';
        })
        .join('');
    }
    if (typeof delta.reasoning_content === 'string') {
      return delta.reasoning_content;
    }
    return '';
  };

  let streamDone = false;
  let partialLine = '';

  const processLine = (rawLine: string): string[] => {
    const output: string[] = [];
    const line = rawLine.trim();
    if (!line.startsWith('data:')) {
      return output;
    }

    const payloadText = line.slice(5).trim();
    if (!payloadText) {
      return output;
    }
    if (payloadText === '[DONE]') {
      streamDone = true;
      return output;
    }

    try {
      const parsed = JSON.parse(payloadText) as Record<string, unknown>;
      const deltaText = extractDeltaText(parsed);
      if (deltaText.length > 0) {
        fullText += deltaText;
        output.push(deltaText);
      }
    } catch {
      // Ignore malformed stream segments and keep parsing.
    }
    return output;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const normalized = (partialLine + buffer).replace(/\r\n/g, '\n');
    const lines = normalized.split('\n');
    partialLine = lines.pop() || '';
    buffer = '';

    for (const line of lines) {
      const deltas = processLine(line);
      for (const delta of deltas) {
        yield delta;
      }
      if (streamDone) {
        if (!fullText.trim()) {
          throw new Error('DeepSeek API returned empty stream content');
        }
        return fullText;
      }
    }
  }

  if (partialLine.trim().length > 0) {
    const deltas = processLine(partialLine);
    for (const delta of deltas) {
      yield delta;
    }
  }

  if (!fullText.trim()) {
    throw new Error('DeepSeek API returned empty stream content');
  }

  return fullText;
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

import { SUPABASE_ANON_KEY, SUPABASE_URL, supabase } from '@/lib/supabase';
import { emitStructuredEvent } from '@/lib/observability';

interface InvokeOptions {
  signal?: AbortSignal;
}

interface StreamHandlers {
  onMeta?: (data: unknown) => void;
  onDelta?: (delta: string) => void;
}

export class AuthRequiredError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthRequiredError';
  }
}

export class EdgeFunctionError extends Error {
  status: number;
  code?: string;
  requestId?: string;
  detail?: string;

  constructor(
    message: string,
    options: {
      status: number;
      code?: string;
      requestId?: string;
      detail?: string;
    },
  ) {
    super(message);
    this.name = 'EdgeFunctionError';
    this.status = options.status;
    this.code = options.code;
    this.requestId = options.requestId;
    this.detail = options.detail;
  }
}

const jsonHeaders = async (): Promise<HeadersInit> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new AuthRequiredError('Please sign in before using AI chat.');
  }

  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
  };
};

const tokenHeaders = (token: string): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
  };
};

const parseEdgeError = async (name: string, response: Response): Promise<EdgeFunctionError> => {
  const requestId =
    response.headers.get('x-request-id') ||
    response.headers.get('x-sb-request-id') ||
    undefined;
  const errorText = await response.text().catch(() => '');

  let parsedCode: string | undefined;
  let parsedMessage: string | undefined;
  if (errorText) {
    try {
      const parsed = JSON.parse(errorText) as {
        code?: string | number;
        error?: string;
        message?: string;
      };
      parsedCode =
        typeof parsed.code === 'string'
          ? parsed.code
          : typeof parsed.code === 'number'
            ? String(parsed.code)
            : typeof parsed.error === 'string'
              ? parsed.error
              : undefined;
      parsedMessage = typeof parsed.message === 'string' ? parsed.message : undefined;
    } catch {
      // Keep plain text as detail only.
    }
  }

  return new EdgeFunctionError(
    parsedMessage || `Function ${name} failed with status ${response.status}.`,
    {
      status: response.status,
      code: parsedCode,
      requestId,
      detail: errorText || undefined,
    },
  );
};

const fetchWithAuthRetry = async (
  endpoint: string,
  body: unknown,
  options: InvokeOptions = {},
): Promise<Response> => {
  const run = async (headers: HeadersInit) =>
    fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: options.signal,
    });

  let response = await run(await jsonHeaders());
  if (response.status === 401 && !options.signal?.aborted) {
    const { data: refreshed, error } = await supabase.auth.refreshSession();
    const retryToken = refreshed.session?.access_token;
    if (!error && retryToken) {
      response = await run(tokenHeaders(retryToken));
    }
  }

  return response;
};

export const invokeEdgeFunction = async <T>(
  name: string,
  body: unknown,
  options: InvokeOptions = {},
): Promise<T> => {
  try {
    const endpoint = `${SUPABASE_URL}/functions/v1/${name}`;
    const response = await fetchWithAuthRetry(endpoint, body, options);

    if (!response.ok) {
      throw await parseEdgeError(name, response);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (
      error instanceof EdgeFunctionError ||
      error instanceof AuthRequiredError ||
      (error instanceof Error && error.name === 'AbortError')
    ) {
      // Surface only safe metadata. Body and headers are intentionally
      // not included so we never log auth tokens, prompts, or secrets.
      try {
        emitStructuredEvent({
          category: 'ai',
          name: 'gateway.failure',
          payload: {
            fn: name,
            status: error instanceof EdgeFunctionError ? error.status : undefined,
            code: error instanceof EdgeFunctionError ? error.code : undefined,
            requestId: error instanceof EdgeFunctionError ? error.requestId : undefined,
            mode: 'rest',
            kind:
              error instanceof AuthRequiredError
                ? 'auth_required'
                : error instanceof EdgeFunctionError
                  ? 'edge_error'
                  : 'aborted',
          },
        });
      } catch {
        /* never throw from telemetry */
      }
      throw error;
    }

    try {
      emitStructuredEvent({
        category: 'ai',
        name: 'gateway.failure',
        payload: { fn: name, mode: 'rest', kind: 'network' },
      });
    } catch {
      /* never throw from telemetry */
    }

    throw new EdgeFunctionError(
      `Network error while calling ${name}. Please try again.`,
      { status: 0, detail: error instanceof Error ? error.message : String(error) },
    );
  }
};

export const invokeEdgeFunctionStream = async <T>(
  name: string,
  body: unknown,
  handlers: StreamHandlers = {},
  options: InvokeOptions = {},
): Promise<T> => {
  try {
    const endpoint = `${SUPABASE_URL}/functions/v1/${name}`;
    const response = await fetchWithAuthRetry(endpoint, body, options);

    if (!response.ok) {
      throw await parseEdgeError(name, response);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!response.body || !contentType.includes('application/x-ndjson')) {
      return (await response.json()) as T;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let donePayload: T | null = null;
    let streamedContent = '';

    const processLine = (line: string): void => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const payloadLine =
        trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;
      if (!payloadLine || payloadLine === '[DONE]') return;

      let parsed: unknown;
      try {
        parsed = JSON.parse(payloadLine);
      } catch {
        return;
      }

      if (!parsed || typeof parsed !== 'object') return;
      const event = parsed as Record<string, unknown>;
      const type = typeof event.type === 'string' ? event.type : '';

      if (type === 'meta') {
        handlers.onMeta?.(event.data);
        return;
      }

      if (type === 'delta') {
        const delta = typeof event.delta === 'string' ? event.delta : '';
        if (delta) {
          streamedContent += delta;
          handlers.onDelta?.(delta);
        }
        return;
      }

      if (type === 'done') {
        donePayload = event.payload as T;
        if (
          streamedContent &&
          donePayload &&
          typeof donePayload === 'object'
        ) {
          const payloadRecord = donePayload as Record<string, unknown>;
          if (typeof payloadRecord.content !== 'string' || !payloadRecord.content) {
            payloadRecord.content = streamedContent;
          }
        }
        return;
      }

      if (type === 'error') {
        const err = event.error && typeof event.error === 'object'
          ? (event.error as Record<string, unknown>)
          : {};
        throw new EdgeFunctionError(
          typeof err.message === 'string' ? err.message : `Function ${name} stream failed.`,
          {
            status: 502,
            code: typeof err.code === 'string' ? err.code : 'stream_failed',
            detail: typeof err.message === 'string' ? err.message : undefined,
          },
        );
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let lineBreakIndex = buffer.indexOf('\n');
      while (lineBreakIndex >= 0) {
        const line = buffer.slice(0, lineBreakIndex);
        buffer = buffer.slice(lineBreakIndex + 1);
        processLine(line);
        lineBreakIndex = buffer.indexOf('\n');
      }
    }

    if (buffer.trim().length > 0) {
      processLine(buffer);
    }

    if (donePayload === null) {
      if (streamedContent.trim().length > 0) {
        return {
          content: streamedContent,
          provider: 'edge',
        } as T;
      }
      throw new EdgeFunctionError(`Function ${name} stream ended without payload.`, {
        status: 502,
        code: 'stream_payload_missing',
      });
    }

    return donePayload;
  } catch (error) {
    if (
      error instanceof EdgeFunctionError ||
      error instanceof AuthRequiredError ||
      (error instanceof Error && error.name === 'AbortError')
    ) {
      try {
        emitStructuredEvent({
          category: 'ai',
          name: 'gateway.failure',
          payload: {
            fn: name,
            status: error instanceof EdgeFunctionError ? error.status : undefined,
            code: error instanceof EdgeFunctionError ? error.code : undefined,
            requestId: error instanceof EdgeFunctionError ? error.requestId : undefined,
            mode: 'stream',
            kind:
              error instanceof AuthRequiredError
                ? 'auth_required'
                : error instanceof EdgeFunctionError
                  ? 'edge_error'
                  : 'aborted',
          },
        });
      } catch {
        /* never throw from telemetry */
      }
      throw error;
    }

    try {
      emitStructuredEvent({
        category: 'ai',
        name: 'gateway.failure',
        payload: { fn: name, mode: 'stream', kind: 'network' },
      });
    } catch {
      /* never throw from telemetry */
    }

    throw new EdgeFunctionError(
      `Network error while streaming ${name}. Please try again.`,
      { status: 0, detail: error instanceof Error ? error.message : String(error) },
    );
  }
};

const extractLatestUserMessage = (messages: Array<{ role: string; content: string }>): string => {
  const latest = [...messages].reverse().find((message) => message.role === 'user');
  return latest?.content || 'Hello';
};

export const getChatFallbackReply = (messages: Array<{ role: string; content: string }>): string => {
  const userInput = extractLatestUserMessage(messages).trim();

  return [
    'I am running in local fallback mode (AI gateway unavailable), but I can still help.',
    '',
    `You asked: "${userInput}"`,
    '',
    'Quick coaching:',
    '- Rewrite one sentence using clearer logic connectors (for example: however, therefore, in contrast).',
    '- Add one concrete example to support your main point.',
    '- Check article/preposition errors and verb tense consistency.',
    '',
    '我当前在本地降级模式（AI 网关不可用），但仍可给你学习建议。',
    '建议你补一条具体例子，并检查时态与连接词。',
  ].join('\n');
};

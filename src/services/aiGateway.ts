import { SUPABASE_ANON_KEY, SUPABASE_URL, supabase } from '@/lib/supabase';

interface InvokeOptions {
  signal?: AbortSignal;
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

export const invokeEdgeFunction = async <T>(
  name: string,
  body: unknown,
  options: InvokeOptions = {},
): Promise<T> => {
  try {
    const endpoint = `${SUPABASE_URL}/functions/v1/${name}`;
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

    if (!response.ok) {
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

      throw new EdgeFunctionError(
        parsedMessage || `Function ${name} failed with status ${response.status}.`,
        {
          status: response.status,
          code: parsedCode,
          requestId,
          detail: errorText || undefined,
        },
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (
      error instanceof EdgeFunctionError ||
      error instanceof AuthRequiredError ||
      (error instanceof Error && error.name === 'AbortError')
    ) {
      throw error;
    }

    throw new EdgeFunctionError(
      `Network error while calling ${name}. Please try again.`,
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

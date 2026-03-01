import { SUPABASE_ANON_KEY, SUPABASE_URL, supabase } from '@/lib/supabase';

interface InvokeOptions {
  signal?: AbortSignal;
}

const jsonHeaders = async (): Promise<HeadersInit> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token || SUPABASE_ANON_KEY;

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
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: await jsonHeaders(),
    body: JSON.stringify(body),
    signal: options.signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Function ${name} failed: ${response.status} ${errorText}`);
  }

  return (await response.json()) as T;
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

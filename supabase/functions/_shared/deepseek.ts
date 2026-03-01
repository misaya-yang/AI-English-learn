export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

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
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('DeepSeek API returned empty content');
  }

  return String(content);
};

export const extractFirstJsonObject = <T>(text: string): T | null => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;

  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
};

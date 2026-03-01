import type { ChatSource } from './response-schema.ts';

export interface TavilySearchOptions {
  query: string;
  searchDepth?: 'basic' | 'advanced';
  maxResults?: number;
  topic?: 'general' | 'news';
  includeRawContent?: boolean;
  includeAnswer?: boolean;
}

export interface TavilySearchResult {
  query: string;
  answer?: string;
  responseTimeMs: number;
  results: ChatSource[];
}

interface TavilyRawResult {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
  published_date?: string;
}

const TAVILY_SEARCH_URL = 'https://api.tavily.com/search';
const TAVILY_EXTRACT_URL = 'https://api.tavily.com/extract';

const getTavilyApiKey = (): string => {
  return Deno.env.get('TAVILY_API_KEY') || '';
};

export const isTavilyEnabled = (): boolean => {
  return getTavilyApiKey().length > 0;
};

const buildDomain = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
};

const withTimeout = async <T>(promiseFactory: (signal: AbortSignal) => Promise<T>, timeoutMs = 9000): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await promiseFactory(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
};

export const tavilySearch = async (options: TavilySearchOptions): Promise<TavilySearchResult> => {
  const apiKey = getTavilyApiKey();
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY is missing');
  }

  const start = Date.now();

  const response = await withTimeout((signal) =>
    fetch(TAVILY_SEARCH_URL, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: options.query,
        search_depth: options.searchDepth || 'basic',
        max_results: options.maxResults ?? 5,
        topic: options.topic || 'general',
        include_answer: options.includeAnswer ?? false,
        include_raw_content: options.includeRawContent ?? false,
      }),
    }),
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Tavily search failed: ${response.status} ${detail}`);
  }

  const data = await response.json() as {
    answer?: string;
    results?: TavilyRawResult[];
    query?: string;
    response_time?: number;
  };

  const results: ChatSource[] = Array.isArray(data.results)
    ? data.results
        .filter((item) => Boolean(item?.url))
        .map((item, index) => ({
          id: `tavily_${index + 1}_${Math.random().toString(36).slice(2, 8)}`,
          title: item.title?.trim() || buildDomain(String(item.url)),
          url: String(item.url),
          domain: buildDomain(String(item.url)),
          publishedAt: item.published_date || undefined,
          snippet: item.content?.trim() || '',
          confidence: typeof item.score === 'number' ? Math.max(0, Math.min(1, item.score)) : 0.6,
        }))
    : [];

  return {
    query: data.query || options.query,
    answer: data.answer,
    responseTimeMs: Date.now() - start,
    results,
  };
};

export const tavilyExtract = async (urls: string[]): Promise<Array<{ url: string; content: string }>> => {
  const apiKey = getTavilyApiKey();
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY is missing');
  }

  if (!Array.isArray(urls) || urls.length === 0) {
    return [];
  }

  const response = await withTimeout((signal) =>
    fetch(TAVILY_EXTRACT_URL, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        urls: urls.slice(0, 3),
        include_images: false,
      }),
    }),
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Tavily extract failed: ${response.status} ${detail}`);
  }

  const data = await response.json() as {
    results?: Array<{ url?: string; raw_content?: string; content?: string }>;
  };

  if (!Array.isArray(data.results)) {
    return [];
  }

  return data.results
    .filter((item) => Boolean(item.url))
    .map((item) => ({
      url: String(item.url),
      content: (item.raw_content || item.content || '').slice(0, 2400),
    }));
};

import { adminSelect, adminUpsert } from './supabase-admin.ts';
import { isTavilyEnabled, tavilyExtract, tavilySearch } from './tavily.ts';
import type { ChatMode, ChatSource, ToolRun } from './response-schema.ts';

interface SearchPolicy {
  mode?: 'off' | 'auto' | 'force';
  alwaysShowSources?: boolean;
  maxSearchCalls?: number;
  maxPerMinute?: number;
}

interface RouteToolsArgs {
  userId: string;
  sessionId?: string;
  mode: ChatMode;
  userInput: string;
  searchPolicy?: SearchPolicy;
  featureFlags?: Record<string, unknown>;
}

interface QuotaRow {
  user_id: string;
  window_started_at: string;
  requests_in_window: number;
  max_per_minute: number;
}

export interface ToolRoutingResult {
  observations: string[];
  sources: ChatSource[];
  toolRuns: ToolRun[];
  searchTriggered: boolean;
  sourcePointers: Array<{ source_id: string; url: string; title: string; retrieved_at: string }>;
}

const DEFAULT_MAX_CALLS = 2;
const DEFAULT_MAX_PER_MINUTE = 8;

const nowIsoMinute = (): string => {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString();
};

const shouldSearchByHeuristic = (input: string): boolean => {
  const lower = input.toLowerCase();

  const keywords = [
    'latest', 'today', 'current', 'news', 'recent', 'new policy', 'version', 'release', 'price', 'rate',
    '搜索', '联网', '查资料', '最新', '今天', '时效', '来源', '引用', 'reference', 'source', 'link',
    'who is', 'what is the newest', 'update', 'trend',
  ];

  return keywords.some((keyword) => lower.includes(keyword));
};

const resolveSearchMode = (args: RouteToolsArgs): 'off' | 'auto' | 'force' => {
  if (args.searchPolicy?.mode === 'off' || args.searchPolicy?.mode === 'force') {
    return args.searchPolicy.mode;
  }

  if (args.featureFlags?.forceWebSearch === true) {
    return 'force';
  }

  return 'auto';
};

const consumeSearchQuota = async (userId: string, maxPerMinute: number): Promise<boolean> => {
  try {
    const rows = await adminSelect<QuotaRow>('agent_search_quotas', {
      select: 'user_id,window_started_at,requests_in_window,max_per_minute',
      eq: { user_id: userId },
      limit: 1,
    });

    const windowStartedAt = nowIsoMinute();

    if (rows.length === 0) {
      await adminUpsert(
        'agent_search_quotas',
        {
          user_id: userId,
          window_started_at: windowStartedAt,
          requests_in_window: 1,
          max_per_minute: maxPerMinute,
          updated_at: new Date().toISOString(),
        },
        'user_id',
      );
      return true;
    }

    const current = rows[0];
    const sameWindow = current.window_started_at === windowStartedAt;
    const currentCount = sameWindow ? Number(current.requests_in_window || 0) : 0;
    const effectiveLimit = Number(current.max_per_minute || maxPerMinute || DEFAULT_MAX_PER_MINUTE);

    if (currentCount >= effectiveLimit) {
      return false;
    }

    await adminUpsert(
      'agent_search_quotas',
      {
        user_id: userId,
        window_started_at: windowStartedAt,
        requests_in_window: currentCount + 1,
        max_per_minute: effectiveLimit,
        updated_at: new Date().toISOString(),
      },
      'user_id',
    );

    return true;
  } catch {
    return true;
  }
};

const dedupeSources = (sources: ChatSource[]): ChatSource[] => {
  const map = new Map<string, ChatSource>();
  for (const source of sources) {
    if (!source.url) continue;
    if (!map.has(source.url)) {
      map.set(source.url, source);
    }
  }
  return [...map.values()];
};

export const routeTools = async (args: RouteToolsArgs): Promise<ToolRoutingResult> => {
  const mode = resolveSearchMode(args);
  const toolRuns: ToolRun[] = [];
  const observations: string[] = [];
  let sources: ChatSource[] = [];

  const policyMaxCalls = Number(args.searchPolicy?.maxSearchCalls || DEFAULT_MAX_CALLS);
  const maxCalls = Math.max(1, Math.min(2, policyMaxCalls));
  const maxPerMinute = Math.max(2, Math.min(20, Number(args.searchPolicy?.maxPerMinute || DEFAULT_MAX_PER_MINUTE)));

  if (!isTavilyEnabled()) {
    toolRuns.push({
      tool: 'tavily_search',
      name: 'tavily_search',
      status: 'skipped',
      latencyMs: 0,
      errorCode: 'missing_api_key',
    });

    return {
      observations,
      sources,
      toolRuns,
      searchTriggered: false,
      sourcePointers: [],
    };
  }

  if (mode === 'off') {
    toolRuns.push({
      tool: 'tavily_search',
      name: 'tavily_search',
      status: 'skipped',
      latencyMs: 0,
      errorCode: 'search_off',
    });

    return {
      observations,
      sources,
      toolRuns,
      searchTriggered: false,
      sourcePointers: [],
    };
  }

  const shouldSearch = mode === 'force' || (mode === 'auto' && shouldSearchByHeuristic(args.userInput));

  if (!shouldSearch) {
    toolRuns.push({
      tool: 'tavily_search',
      name: 'tavily_search',
      status: 'skipped',
      latencyMs: 0,
      errorCode: 'heuristic_not_triggered',
    });

    return {
      observations,
      sources,
      toolRuns,
      searchTriggered: false,
      sourcePointers: [],
    };
  }

  const quotaAllowed = await consumeSearchQuota(args.userId, maxPerMinute);
  if (!quotaAllowed) {
    toolRuns.push({
      tool: 'tavily_search',
      name: 'tavily_search',
      status: 'rate_limited',
      latencyMs: 0,
      errorCode: 'quota_exceeded',
    });

    return {
      observations,
      sources,
      toolRuns,
      searchTriggered: false,
      sourcePointers: [],
    };
  }

  let searchCalls = 0;

  try {
    searchCalls += 1;
    const basic = await tavilySearch({
      query: args.userInput,
      searchDepth: 'basic',
      topic: 'general',
      maxResults: 5,
      includeAnswer: false,
      includeRawContent: false,
    });

    toolRuns.push({
      tool: 'tavily_search',
      name: 'tavily_search_basic',
      status: 'success',
      latencyMs: basic.responseTimeMs,
    });

    sources = [...basic.results];
    if (basic.answer && basic.answer.trim().length > 0) {
      observations.push(`search_answer: ${basic.answer.trim()}`);
    }

    basic.results.slice(0, 5).forEach((source, index) => {
      observations.push(`source_${index + 1} [${source.id}] ${source.title}: ${source.snippet}`);
    });

    const lowConfidence = basic.results.length < 2 || (basic.results[0]?.confidence || 0) < 0.42;

    if (lowConfidence && searchCalls < maxCalls) {
      searchCalls += 1;
      const advanced = await tavilySearch({
        query: args.userInput,
        searchDepth: 'advanced',
        topic: 'general',
        maxResults: 5,
        includeAnswer: false,
        includeRawContent: false,
      });

      toolRuns.push({
        tool: 'tavily_search',
        name: 'tavily_search_advanced',
        status: 'success',
        latencyMs: advanced.responseTimeMs,
      });

      sources = [...sources, ...advanced.results];
      advanced.results.slice(0, 3).forEach((source, index) => {
        observations.push(`advanced_source_${index + 1} [${source.id}] ${source.title}: ${source.snippet}`);
      });
    }

    const deduped = dedupeSources(sources).slice(0, 8);
    sources = deduped;

    const shouldExtract = deduped.length > 0 && searchCalls < maxCalls;
    if (shouldExtract) {
      searchCalls += 1;

      const extractStart = Date.now();
      const extracts = await tavilyExtract(deduped.slice(0, 2).map((source) => source.url));
      toolRuns.push({
        tool: 'tavily_extract',
        name: 'tavily_extract',
        status: 'success',
        latencyMs: Date.now() - extractStart,
      });

      extracts.forEach((item, index) => {
        if (!item.content) return;
        observations.push(`extract_${index + 1} (${item.url}): ${item.content.slice(0, 360)}`);
      });
    }
  } catch (error) {
    toolRuns.push({
      tool: 'tavily_search',
      name: 'tavily_search',
      status: 'error',
      latencyMs: 0,
      errorCode: error instanceof Error ? error.message.slice(0, 80) : 'unknown_tool_error',
    });
  }

  const sourcePointers = sources.map((source) => ({
    source_id: source.id,
    url: source.url,
    title: source.title,
    retrieved_at: new Date().toISOString(),
  }));

  return {
    observations,
    sources,
    toolRuns,
    searchTriggered: sources.length > 0,
    sourcePointers,
  };
};

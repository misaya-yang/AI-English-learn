const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

class SupabaseProxyConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SupabaseProxyConfigError';
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

function getSupabaseUrl() {
  const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const trimmedUrl = rawUrl.trim();

  if (!trimmedUrl) {
    throw new SupabaseProxyConfigError('Missing VITE_SUPABASE_URL or SUPABASE_URL');
  }

  try {
    const url = new URL(trimmedUrl);
    if (url.protocol !== 'https:') {
      throw new SupabaseProxyConfigError('Supabase URL must use https');
    }
    return url.toString().replace(/\/$/, '');
  } catch (error) {
    if (error instanceof SupabaseProxyConfigError) {
      throw error;
    }
    throw new SupabaseProxyConfigError('Invalid Supabase URL');
  }
}

function getPath(req) {
  const value = req.query.path;
  if (Array.isArray(value)) return value.join('/');
  return value || '';
}

function appendQueryParams(targetUrl, query) {
  for (const [key, value] of Object.entries(query)) {
    if (key === 'path' || typeof value === 'undefined') continue;
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      targetUrl.searchParams.append(key, String(item));
    }
  }
}

function buildForwardHeaders(req) {
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    const normalizedKey = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(normalizedKey) || typeof value === 'undefined') continue;
    headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
  }

  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (anonKey && !headers.has('apikey')) {
    headers.set('apikey', anonKey);
  }

  return headers;
}

async function readRequestBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function writeCorsHeaders(req, res) {
  const origin = req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'authorization,apikey,content-type,x-client-info');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(req, res) {
  writeCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  let targetUrl;
  try {
    targetUrl = new URL(`/${getPath(req)}`, getSupabaseUrl());
    appendQueryParams(targetUrl, req.query);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Supabase proxy is not configured';
    res.status(503).json({ error: 'supabase_proxy_not_configured', message });
    return;
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: buildForwardHeaders(req),
      body: await readRequestBody(req),
      redirect: 'manual',
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    res.setHeader('Cache-Control', 'no-store');

    const body = Buffer.from(await upstream.arrayBuffer());
    res.send(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Supabase proxy failed';
    res.status(502).json({
      error: 'supabase_proxy_failed',
      message,
      upstreamHost: targetUrl.hostname,
    });
  }
}

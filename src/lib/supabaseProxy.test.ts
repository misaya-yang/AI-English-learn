import { describe, expect, it, vi } from 'vitest';

// @ts-expect-error Vercel API routes in this project are plain JavaScript.
import handler from '../../api/supabase.js';

function createResponse() {
  const headers = new Map<string, string>();
  const response = {
    body: null as Buffer | null | Record<string, unknown>,
    headers,
    statusCode: 200,
    setHeader: vi.fn((key: string, value: string) => {
      headers.set(key.toLowerCase(), value);
    }),
    status: vi.fn((code: number) => {
      response.statusCode = code;
      return response;
    }),
    send: vi.fn((body: Buffer) => {
      response.body = body;
      return response;
    }),
    json: vi.fn((body: Record<string, unknown>) => {
      response.body = body;
      return response;
    }),
    end: vi.fn(() => response),
  };
  return response;
}

describe('Supabase API proxy', () => {
  it('keeps decoded response bodies from being labeled as gzip', async () => {
    process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ healthy: true }), {
        status: 200,
        headers: {
          'content-encoding': 'gzip',
          'content-length': '999',
          'content-type': 'application/json',
        },
      }),
    );

    const req = {
      headers: {
        'accept-encoding': 'gzip, deflate, br',
      },
      method: 'GET',
      query: {
        path: 'auth/v1/health',
      },
    };
    const res = createResponse();

    await handler(req, res);

    const [, options] = fetchSpy.mock.calls[0];
    const forwardedHeaders = options?.headers as Headers;
    expect(forwardedHeaders.get('accept-encoding')).toBe('identity');
    expect(res.statusCode).toBe(200);
    expect(res.headers.get('content-encoding')).toBeUndefined();
    expect(res.headers.get('content-length')).toBeUndefined();
    expect(res.headers.get('content-type')).toBe('application/json');
    expect(Buffer.isBuffer(res.body) ? res.body.toString() : '').toBe('{"healthy":true}');

    fetchSpy.mockRestore();
  });
});

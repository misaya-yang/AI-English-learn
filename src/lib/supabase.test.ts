import { describe, it, expect } from 'vitest';
import { resolveSupabaseEnv } from './supabase';

describe('resolveSupabaseEnv', () => {
  it('throws when non-prod env is missing without explicit fallback opt-in', () => {
    expect(() => resolveSupabaseEnv({ MODE: 'development' })).toThrow(/VITE_SUPABASE_URL.*VITE_SUPABASE_ANON_KEY/);
  });

  it('uses dev fallbacks only when explicitly allowed in non-prod', () => {
    const resolved = resolveSupabaseEnv({
      MODE: 'development',
      VITE_ALLOW_SUPABASE_DEV_FALLBACK: 'true',
    });
    expect(resolved.url).toMatch(/^https:\/\//);
    expect(resolved.anonKey.length).toBeGreaterThan(10);
  });

  it('keeps test mode on the local fallback so unit tests do not need real env', () => {
    const resolved = resolveSupabaseEnv({ MODE: 'test' });
    expect(resolved.url).toMatch(/^https:\/\//);
    expect(resolved.anonKey.length).toBeGreaterThan(10);
  });

  it('returns provided env values in non-prod when available', () => {
    const resolved = resolveSupabaseEnv({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      MODE: 'development',
    });
    expect(resolved.url).toBe('https://example.supabase.co');
    expect(resolved.anonKey).toBe('test-anon-key');
  });

  it('throws when prod env is missing both vars', () => {
    expect(() => resolveSupabaseEnv({ PROD: true })).toThrow(/VITE_SUPABASE_URL/);
  });

  it('does not allow fallback opt-in to bypass missing prod env', () => {
    expect(() =>
      resolveSupabaseEnv({
        PROD: true,
        VITE_ALLOW_SUPABASE_DEV_FALLBACK: 'true',
      }),
    ).toThrow(/VITE_SUPABASE_URL.*VITE_SUPABASE_ANON_KEY/);
  });

  it('throws when prod env is missing only the anon key', () => {
    expect(() =>
      resolveSupabaseEnv({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        PROD: true,
      }),
    ).toThrow(/VITE_SUPABASE_ANON_KEY/);
  });

  it('throws when prod env is missing only the url', () => {
    expect(() =>
      resolveSupabaseEnv({
        VITE_SUPABASE_ANON_KEY: 'test',
        PROD: true,
      }),
    ).toThrow(/VITE_SUPABASE_URL/);
  });

  it('does not mix provided non-prod env with fallback credentials', () => {
    expect(() =>
      resolveSupabaseEnv({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_ALLOW_SUPABASE_DEV_FALLBACK: 'true',
        MODE: 'development',
      }),
    ).toThrow(/VITE_SUPABASE_ANON_KEY/);
  });

  it('returns the configured prod values when both vars are present', () => {
    const resolved = resolveSupabaseEnv({
      VITE_SUPABASE_URL: 'https://prod.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'prod-key',
      PROD: true,
    });
    expect(resolved.url).toBe('https://prod.supabase.co');
    expect(resolved.anonKey).toBe('prod-key');
  });

  it('treats whitespace-only env as missing in prod', () => {
    expect(() =>
      resolveSupabaseEnv({
        VITE_SUPABASE_URL: '   ',
        VITE_SUPABASE_ANON_KEY: '   ',
        PROD: true,
      }),
    ).toThrow(/VITE_SUPABASE_URL.*VITE_SUPABASE_ANON_KEY/);
  });
});

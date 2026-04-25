import { afterEach, describe, expect, it } from 'vitest';

import {
  clearStructuredEventBuffer,
  emitStructuredEvent,
  getRecentStructuredEvents,
  sanitizePayload,
} from './observability';

afterEach(() => clearStructuredEventBuffer());

describe('sanitizePayload', () => {
  it('returns an empty object for non-object input', () => {
    expect(sanitizePayload(undefined)).toEqual({});
    expect(sanitizePayload(null)).toEqual({});
    expect(sanitizePayload('string')).toEqual({});
    expect(sanitizePayload(42)).toEqual({});
    expect(sanitizePayload([])).toEqual({});
  });

  it('redacts fields whose key looks like a secret', () => {
    const out = sanitizePayload({
      access_token: 'sk-12345',
      apiKey: 'k_abc',
      api_key: 'k_def',
      authorization: 'Bearer xyz',
      cookie: 'sessionid=abc',
      password: 'hunter2',
      secret: 's',
      sessionId: 'sess-1',
      safeField: 'visible',
    });
    expect(out.access_token).toBe('[redacted]');
    expect(out.apiKey).toBe('[redacted]');
    expect(out.api_key).toBe('[redacted]');
    expect(out.authorization).toBe('[redacted]');
    expect(out.cookie).toBe('[redacted]');
    expect(out.password).toBe('[redacted]');
    expect(out.secret).toBe('[redacted]');
    expect(out.sessionId).toBe('[redacted]');
    expect(out.safeField).toBe('visible');
  });

  it('truncates very long string values', () => {
    const out = sanitizePayload({ note: 'x'.repeat(500) });
    expect((out.note as string).length).toBeLessThan(260);
    expect((out.note as string).endsWith('…')).toBe(true);
  });

  it('recursively sanitises nested objects', () => {
    const out = sanitizePayload({
      meta: { token: 'abc', name: 'safe' },
      list: [{ secret: 'leak' }, 'safe'],
    });
    expect((out.meta as Record<string, unknown>).token).toBe('[redacted]');
    expect((out.meta as Record<string, unknown>).name).toBe('safe');
    expect(((out.list as unknown[])[0] as Record<string, unknown>).secret).toBe('[redacted]');
  });

  it('keeps numbers, booleans, and null as-is', () => {
    const out = sanitizePayload({ count: 7, ok: true, blank: null });
    expect(out.count).toBe(7);
    expect(out.ok).toBe(true);
    expect(out.blank).toBe(null);
  });
});

describe('emitStructuredEvent', () => {
  it('returns a normalised event with category/name/ts/payload', () => {
    const event = emitStructuredEvent({ category: 'coach', name: 'queue.write', payload: { count: 3 } });
    expect(event.category).toBe('coach');
    expect(event.name).toBe('queue.write');
    expect(event.payload).toEqual({ count: 3 });
    expect(typeof event.ts).toBe('string');
    expect(new Date(event.ts).toString()).not.toBe('Invalid Date');
  });

  it('sanitises the payload before stamping', () => {
    const event = emitStructuredEvent({
      category: 'ai',
      name: 'gateway.failure',
      payload: { token: 'sk-1', name: 'ai-chat' },
    });
    expect(event.payload.token).toBe('[redacted]');
    expect(event.payload.name).toBe('ai-chat');
  });

  it('appends to the ring buffer in emission order', () => {
    emitStructuredEvent({ category: 'a', name: 'one' });
    emitStructuredEvent({ category: 'a', name: 'two' });
    emitStructuredEvent({ category: 'a', name: 'three' });
    const buffer = getRecentStructuredEvents();
    expect(buffer.map((event) => event.name)).toEqual(['one', 'two', 'three']);
  });

  it('caps the ring buffer to 50 entries', () => {
    for (let i = 0; i < 80; i += 1) {
      emitStructuredEvent({ category: 'a', name: `event_${i}` });
    }
    const buffer = getRecentStructuredEvents();
    expect(buffer.length).toBe(50);
    expect(buffer[0].name).toBe('event_30');
    expect(buffer[buffer.length - 1].name).toBe('event_79');
  });
});

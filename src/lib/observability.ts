// observability.ts — small structured-event logger for product hooks.
//
// Sites like the coach review queue, the chat fallback path, and the
// coaching-action router need to emit traceable telemetry without any
// risk of leaking secrets. This helper provides one entry point that:
//   • normalises events to {category, name, ts, payload}
//   • sanitises payloads — drops fields whose key looks like an auth
//     token / secret / API key / password
//   • truncates excessively long string values
//   • in DEV writes a single JSON line to the console for inspection
//   • keeps a tiny in-memory ring buffer that tests (and a future
//     diagnostics surface) can read
//
// Pure module — no side-effects beyond the optional console output and
// the ring buffer; does not POST anywhere yet.

const SECRET_KEY_RE = /(token|secret|password|api[_-]?key|auth(?:orization)?|cookie|session[_-]?id)/i;
const MAX_STRING_LENGTH = 240;
const RING_BUFFER_LIMIT = 50;

export interface StructuredEvent {
  category: string;
  name: string;
  /** ISO timestamp captured at emit time. */
  ts: string;
  payload: Record<string, unknown>;
}

export interface EmitStructuredEventInput {
  category: string;
  name: string;
  payload?: Record<string, unknown>;
}

const ring: StructuredEvent[] = [];

export function sanitizePayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (SECRET_KEY_RE.test(key)) {
      out[key] = '[redacted]';
      continue;
    }
    out[key] = sanitizeValue(value);
  }
  return out;
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    if (value.length > MAX_STRING_LENGTH) {
      return `${value.slice(0, MAX_STRING_LENGTH)}…`;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 50).map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    return sanitizePayload(value);
  }
  return value;
}

export function emitStructuredEvent(input: EmitStructuredEventInput): StructuredEvent {
  const event: StructuredEvent = {
    category: input.category,
    name: input.name,
    ts: new Date().toISOString(),
    payload: sanitizePayload(input.payload),
  };
  ring.push(event);
  if (ring.length > RING_BUFFER_LIMIT) {
    ring.splice(0, ring.length - RING_BUFFER_LIMIT);
  }
  if (typeof import.meta !== 'undefined' && (import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
    try {
      // eslint-disable-next-line no-console
      console.info(`[obs] ${event.category}.${event.name}`, event.payload);
    } catch {
      /* no-op */
    }
  }
  return event;
}

export function getRecentStructuredEvents(): StructuredEvent[] {
  return ring.slice();
}

export function clearStructuredEventBuffer(): void {
  ring.length = 0;
}

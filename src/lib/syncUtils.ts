export function buildIdempotencyKey(
  table: string,
  pkFields: Record<string, string | number>,
): string {
  const parts = Object.entries(pkFields)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return `${table}:${parts}`;
}

export function sanitizeRedirectPath(rawPath: string | null | undefined, fallback = '/dashboard/today'): string {
  if (!rawPath) return fallback;
  if (!rawPath.startsWith('/')) return fallback;
  if (rawPath.startsWith('//')) return fallback;
  return rawPath;
}

export function buildAuthRedirect(targetPath = '/dashboard/today', authPath = '/login'): string {
  const safeTarget = sanitizeRedirectPath(targetPath);
  return `${authPath}?redirect=${encodeURIComponent(safeTarget)}`;
}

export function resolveAuthRedirect(search: string, fallback = '/dashboard/today'): string {
  const params = new URLSearchParams(search);
  return sanitizeRedirectPath(params.get('redirect'), fallback);
}

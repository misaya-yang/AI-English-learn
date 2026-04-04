/**
 * Structured logger that only outputs in development mode.
 * Replace console.log/warn/error with these in production code paths.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  debug(...args: unknown[]) {
    if (isDev) console.log(...args);
  },
  warn(...args: unknown[]) {
    if (isDev) console.warn(...args);
  },
  error(...args: unknown[]) {
    // Always log errors (useful for monitoring in prod too)
    console.error(...args);
  },
};

import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const CHUNK_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk [\d]+ failed|ChunkLoadError/i;

export const lazyWithRetry = <T extends ComponentType<unknown>>(
  importer: () => Promise<{ default: T }>,
  key: string,
): LazyExoticComponent<T> => {
  return lazy(async () => {
    try {
      const module = await importer();
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`lazy-reload:${key}`);
      }
      return module;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const shouldReload = CHUNK_ERROR_PATTERN.test(message);

      if (shouldReload && typeof window !== 'undefined') {
        const storageKey = `lazy-reload:${key}`;
        const hasReloaded = sessionStorage.getItem(storageKey) === '1';
        if (!hasReloaded) {
          sessionStorage.setItem(storageKey, '1');
          window.location.reload();
          await new Promise<never>(() => {
            // Keep promise pending during hard refresh.
          });
        }
        sessionStorage.removeItem(storageKey);
      }

      throw error;
    }
  });
};

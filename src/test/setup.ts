import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

// Force offline in tests so syncQueue.flush() never tries to reach Supabase.
// IndexedDB writes still happen; the pending queue stays untouched. Tests that
// want to exercise sync-flush behavior should override this explicitly.
Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });

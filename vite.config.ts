import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { inspectAttr } from 'kimi-plugin-inspect-react';

const vendorChunkGroups: Array<[string, string[]]> = [
  ['i18n-vendor', ['i18next', 'react-i18next', 'react-intl']],
  ['supabase-vendor', ['@supabase/supabase-js']],
  ['markdown-vendor', ['react-markdown', 'remark-gfm', 'rehype-raw']],
  ['highlight-vendor', ['rehype-highlight', 'highlight.js']],
  ['charts-vendor', ['recharts']],
  ['sql-vendor', ['sql.js']],
];

const manualChunks = (id: string): string | undefined => {
  if (!id.includes('node_modules')) {
    return undefined;
  }

  for (const [chunkName, matchers] of vendorChunkGroups) {
    if (matchers.some((matcher) => id.includes(matcher))) {
      return chunkName;
    }
  }

  return undefined;
};

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
});

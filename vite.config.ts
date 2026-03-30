import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('@toast-ui/editor-plugin-') || id.includes('tui-color-picker')) {
            return 'toastui-plugins';
          }

          if (id.includes('@toast-ui') || id.includes('@toast-ui/toastmark')) {
            return 'toastui-core';
          }

          if (id.includes('prosemirror') || id.includes('codemirror')) {
            return 'editor-runtime';
          }

          if (id.includes('katex')) {
            return 'katex-vendor';
          }

          if (id.includes('react') || id.includes('scheduler')) {
            return 'react-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});

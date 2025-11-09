import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'src/test/e2e/**',
      'src/test/visual/**',
      'src/test/performance/**',
      'src/test/security/**',
      'src/test/accessibility/**'
    ]
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '/src': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});

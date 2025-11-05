import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/vitest.setup.ts'],
    // Keep Vitest on unit/integration only; E2E/visual/accessibility go to Playwright
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'src/test/e2e/**',
      'src/test/visual/**',
      'src/test/performance/**',
      'src/test/accessibility/**'
    ],
    pool: 'threads',
    reporters: 'verbose'
  }
});

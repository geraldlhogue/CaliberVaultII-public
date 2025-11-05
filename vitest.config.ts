import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: [
      'src/test/vitest.setup.ts',
      'src/test/setup-indexeddb.ts',
    ],
    deps: { inline: ['fake-indexeddb', 'fake-indexeddb/auto'] },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules/**',
      'src/test/e2e/**',
      'src/test/performance/**',
      'src/test/visual/**',
      'src/test/security/**',
      'src/test/accessibility/**',
      'dist/**',
    ],
    pool: 'threads',
    reporters: 'verbose',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

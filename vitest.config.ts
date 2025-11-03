import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    include: [
      '**/__tests__/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      '**/*.{test,spec}.?(c|m)[jt]s?(x)',
      'firearms-inventory-tracking-1 \\(4\\)/**/*.{test,spec}.?(c|m)[jt]s?(x)'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '**/artifacts/**'
    ],
    testTimeout: 20000,
    hookTimeout: 20000,
  },
})

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    include: [
      '**/__tests__/**/*.{test,spec}.ts?(x)',
      '**/*.{test,spec}.ts?(x)',
      'firearms-inventory-tracking-1 \\(4\\)/**/*.{test,spec}.ts?(x)'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '**/artifacts/**'
    ],
    testTimeout: 20000,
    hookTimeout: 20000
  }
});

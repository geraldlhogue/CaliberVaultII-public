import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    include: [
      '**/__tests__/**/*.{test,spec}.{ts,tsx,js,jsx}',
      '**/*.{test,spec}.{ts,tsx,js,jsx}',
      'firearms-inventory-tracking-1 \\(4\\)/**/*.{test,spec}.{ts,tsx,js,jsx}'
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

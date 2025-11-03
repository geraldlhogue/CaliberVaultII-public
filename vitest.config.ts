import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
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

    // Increased timeouts for IndexedDB and async operations
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 20000,


    isolate: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        'dist/',
        '.github/',
        'supabase/functions/',
      ],
      all: true,
      lines: 85,
      functions: 85,
      branches: 85,
      statements: 85,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

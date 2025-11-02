import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: [
      'src/**/*.test.ts?(x)',
      'src/**/*.spec.ts?(x)',
      'firearms-inventory-tracking-1 (4)/**/*.test.ts?(x)',
      'firearms-inventory-tracking-1 (4)/**/*.spec.ts?(x)'
    ],
  },
});

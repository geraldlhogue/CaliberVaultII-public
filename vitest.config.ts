import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',

    // Give async teardown time to finish (camera tracks, IDB deletes, etc.)
    testTimeout: 10000,
    hookTimeout: 20000,
    teardownTimeout: 20000,

    // Keep globals/mocks tidy between tests
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    isolate: true,

    // Use a single forked process (no threads) to avoid lingering handles
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },

    // Keep default reporter; verbose can be added per command
    reporters: ['default'],
  },

  // Your coverage thresholds (kept from your existing config)
  coverage: {
    reporter: ['text', 'html'],
    lines: 85,
    functions: 85,
    branches: 85,
    statements: 85,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})


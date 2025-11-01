import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/test',
  testMatch: ['**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
//   webServer: {
//   command: 'echo "Skipping dev server for visual tests"',
//   port: 9323,
//   timeout: 120000,
//   reuseExistingServer: false,
// },
use: {
  // Mock mobile APIs
  viewport: { width: 1280, height: 720 },
  ignoreHTTPSErrors: true,
  // Skip loading real app
  baseURL: 'data:text/html,<h1>Mock Page for Visual Tests</h1>',
},
});

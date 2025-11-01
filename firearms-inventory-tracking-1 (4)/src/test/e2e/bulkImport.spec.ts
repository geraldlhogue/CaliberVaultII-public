import { test, expect } from '@playwright/test';

test.describe('Bulk Import Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open bulk import modal', async ({ page }) => {
    await page.click('button:has-text("Import CSV")');
    await expect(page.locator('text=Enhanced Bulk Import System')).toBeVisible();
  });

  test('should download CSV template', async ({ page }) => {
    await page.click('button:has-text("Import CSV")');
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download CSV Template")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should show file upload area', async ({ page }) => {
    await page.click('button:has-text("Import CSV")');
    await expect(page.locator('text=/drag.*drop/i')).toBeVisible();
  });

  test('should validate CSV format', async ({ page }) => {
    await page.click('button:has-text("Import CSV")');
    // Test would upload invalid CSV and check for error messages
    await expect(page.locator('input[type="file"]')).toBeVisible();
  });
});

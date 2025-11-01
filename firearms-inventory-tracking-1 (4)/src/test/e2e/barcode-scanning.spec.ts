import { test, expect } from '@playwright/test';

test.describe('Barcode Scanning E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login
    await page.click('text=Login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Dashboard');
  });

  test('opens barcode scanner', async ({ page }) => {
    await page.click('text=Scan Barcode');
    await expect(page.locator('video')).toBeVisible({ timeout: 5000 });
  });

  test('displays camera permission prompt', async ({ page }) => {
    // Grant camera permissions in browser context
    await page.context().grantPermissions(['camera']);
    
    await page.click('text=Scan Barcode');
    await expect(page.locator('video')).toBeVisible();
  });

  test('handles camera permission denial', async ({ page }) => {
    // Deny camera permissions
    await page.context().clearPermissions();
    
    await page.click('text=Scan Barcode');
    await expect(page.locator('text=/permission/i')).toBeVisible();
  });

  test('batch scanning workflow', async ({ page }) => {
    await page.click('text=Batch Scan');
    await expect(page.locator('text=/scan multiple/i')).toBeVisible();
  });

  test('barcode cache management', async ({ page }) => {
    await page.click('text=Settings');
    await page.click('text=Barcode Cache');
    await expect(page.locator('text=/cached items/i')).toBeVisible();
  });

  test('offline barcode lookup', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);
    
    await page.click('text=Scan Barcode');
    // Should still work with cached data
    await expect(page.locator('text=/offline/i')).toBeVisible();
  });
});

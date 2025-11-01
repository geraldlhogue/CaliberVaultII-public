import { test, expect } from '@playwright/test';

test.describe('Comprehensive User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete inventory workflow', async ({ page }) => {
    // Login
    await page.click('text=Login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Add new item
    await page.click('text=Add Item');
    await page.selectOption('select[name="category"]', 'firearms');
    await page.fill('input[name="name"]', 'Test Firearm');
    await page.fill('input[name="manufacturer"]', 'Test Mfg');
    await page.click('button[type="submit"]');
    
    // Verify item appears
    await expect(page.locator('text=Test Firearm')).toBeVisible();
    
    // Search for item
    await page.fill('input[placeholder*="Search"]', 'Test Firearm');
    await expect(page.locator('text=Test Firearm')).toBeVisible();
    
    // Edit item
    await page.click('[aria-label="Edit"]');
    await page.fill('input[name="name"]', 'Updated Firearm');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Updated Firearm')).toBeVisible();
    
    // Delete item
    await page.click('[aria-label="Delete"]');
    await page.click('text=Confirm');
    await expect(page.locator('text=Updated Firearm')).not.toBeVisible();
  });

  test('barcode scanning workflow', async ({ page }) => {
    await page.click('text=Scan Barcode');
    await expect(page.locator('video')).toBeVisible();
    // Simulate barcode detection would happen here
  });

  test('export and reporting workflow', async ({ page }) => {
    await page.click('text=Reports');
    await page.click('text=Export PDF');
    // Verify download initiated
  });
});

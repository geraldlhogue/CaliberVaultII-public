import { test, expect } from '@playwright/test';

test.describe('Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should search inventory items', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Glock');
    
    await page.waitForTimeout(500); // Debounce
    
    const results = page.locator('[data-testid="item-card"]');
    await expect(results.first()).toBeVisible();
  });

  test('should filter by manufacturer', async ({ page }) => {
    await page.click('button:has-text("Manufacturer")');
    await page.click('text="Glock"');
    
    const filteredItems = page.locator('[data-manufacturer="Glock"]');
    await expect(filteredItems.first()).toBeVisible({ timeout: 3000 });
  });

  test('should clear all filters', async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', 'test');
    await page.click('button:has-text("Clear Filters")');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toHaveValue('');
  });

  test('should combine multiple filters', async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', 'rifle');
    await page.click('button:has-text("Category")');
    await page.click('text="Firearms"');
    
    const results = page.locator('[data-testid="item-card"]');
    await expect(results).toHaveCount(1, { timeout: 3000 });
  });
});

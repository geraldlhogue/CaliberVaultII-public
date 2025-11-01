import { test, expect } from '@playwright/test';

test.describe('AI Valuation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should get AI valuation for an item', async ({ page }) => {
    // Open item details
    await page.click('.item-card:first-child');
    
    // Click valuation tab
    await page.click('button:has-text("Financial")');
    
    // Click get valuation
    await page.click('button:has-text("Get AI Valuation")');
    
    // Wait for valuation to complete
    await expect(page.locator('text=Estimated Value')).toBeVisible({ timeout: 10000 });
    
    // Verify valuation details are shown
    await expect(page.locator('text=Market Analysis')).toBeVisible();
  });

  test('should perform batch valuation', async ({ page }) => {
    // Select multiple items
    await page.click('.item-card:first-child input[type="checkbox"]');
    await page.click('.item-card:nth-child(2) input[type="checkbox"]');
    
    // Click batch valuation
    await page.click('button:has-text("Batch Valuation")');
    
    // Verify batch modal opens
    await expect(page.locator('text=Batch AI Valuation')).toBeVisible();
  });
});

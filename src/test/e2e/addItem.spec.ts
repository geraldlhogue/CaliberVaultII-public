import { test, expect } from '@playwright/test';

test.describe('Add Item Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('should add a new firearm item', async ({ page }) => {
    // Click add item button
    await page.click('button:has-text("Add Item")');
    
    // Fill form
    await page.fill('input[name="name"]', 'Test AR-15');
    await page.selectOption('select[name="category"]', 'Firearms');
    await page.fill('input[name="manufacturer"]', 'Colt');
    await page.fill('input[name="model"]', 'M4');
    await page.fill('input[name="caliber"]', '5.56x45mm');
    await page.fill('input[name="quantity"]', '1');
    await page.fill('input[name="purchase_price"]', '1500');
    
    // Submit form
    await page.click('button:has-text("Add Item")');
    
    // Verify success
    await expect(page.locator('text=Item added successfully')).toBeVisible();
    await expect(page.locator('text=Test AR-15')).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await page.click('button:has-text("Add Item")');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Name is required')).toBeVisible();
  });
});

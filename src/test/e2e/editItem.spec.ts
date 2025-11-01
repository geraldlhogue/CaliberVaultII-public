import { test, expect } from '@playwright/test';

test.describe('Edit Item Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should edit an existing item', async ({ page }) => {
    // Click on first item card
    await page.click('.item-card:first-child');
    
    // Click edit button
    await page.click('button:has-text("Edit")');
    
    // Update name
    await page.fill('input[name="name"]', 'Updated AR-15');
    await page.fill('input[name="purchase_price"]', '1600');
    
    // Submit
    await page.click('button:has-text("Save Changes")');
    
    // Verify update
    await expect(page.locator('text=Item updated successfully')).toBeVisible();
    await expect(page.locator('text=Updated AR-15')).toBeVisible();
  });

  test('should cancel edit without saving', async ({ page }) => {
    await page.click('.item-card:first-child');
    await page.click('button:has-text("Edit")');
    
    await page.fill('input[name="name"]', 'Should Not Save');
    await page.click('button:has-text("Cancel")');
    
    await expect(page.locator('text=Should Not Save')).not.toBeVisible();
  });
});

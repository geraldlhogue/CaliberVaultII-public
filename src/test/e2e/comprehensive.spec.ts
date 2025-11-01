import { test, expect } from '@playwright/test';

test.describe('Comprehensive User Journey', () => {
  test('complete user workflow', async ({ page }) => {
    // 1. Navigate to app
    await page.goto('/');
    await expect(page).toHaveTitle(/CaliberVault/);

    // 2. Sign up (if not logged in)
    const signInButton = page.locator('button:has-text("Sign In")');
    if (await signInButton.isVisible()) {
      await signInButton.click();
      
      // Switch to sign up
      await page.click('text=/sign up/i');
      await page.fill('input[type="email"]', `test${Date.now()}@example.com`);
      await page.fill('input[type="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
    }

    // 3. Add new item
    await page.click('button:has-text("Add Item")');
    await page.fill('input[name="name"]', 'Test Firearm E2E');
    await page.fill('input[name="manufacturer"]', 'Test Manufacturer');
    await page.fill('input[name="model"]', 'Test Model');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/added successfully/i')).toBeVisible({ timeout: 5000 });

    // 4. Search for item
    await page.fill('input[placeholder*="Search"]', 'Test Firearm');
    await page.waitForTimeout(500);
    
    const searchResults = page.locator('text="Test Firearm E2E"');
    await expect(searchResults).toBeVisible();

    // 5. View item details
    await searchResults.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 6. Close modal
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // 7. Export data
    await page.click('button:has-text("Export")');
    const downloadPromise = page.waitForEvent('download');
    await page.click('text="Export to CSV"');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });
});

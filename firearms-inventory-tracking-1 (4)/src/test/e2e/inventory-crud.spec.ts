import { test, expect } from '@playwright/test';

test.describe('Inventory CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Assume user is logged in for these tests
  });

  test('should open add item modal', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /add item/i });
    await addButton.click();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
  });

  test('should add new firearm', async ({ page }) => {
    await page.click('button:has-text("Add Item")');
    
    await page.fill('input[name="name"]', 'Test Firearm');
    await page.fill('input[name="manufacturer"]', 'Test Manufacturer');
    await page.fill('input[name="model"]', 'Test Model');
    await page.fill('input[name="serialNumber"]', '123456');
    
    await page.click('button[type="submit"]');
    
    const successMessage = page.locator('text=/added successfully/i');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test('should display inventory items', async ({ page }) => {
    const itemCards = page.locator('[data-testid="item-card"]');
    await expect(itemCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('should filter by category', async ({ page }) => {
    await page.click('button:has-text("Firearms")');
    
    const firearmsItems = page.locator('[data-category="firearms"]');
    await expect(firearmsItems.first()).toBeVisible({ timeout: 3000 });
  });
});

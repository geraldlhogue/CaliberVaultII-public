import { test, expect } from '@playwright/test';

test.describe('All Categories CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await page.waitForSelector('[data-testid="inventory-dashboard"]', { timeout: 10000 });
  });

  const categories = [
    { name: 'Firearms', testId: 'firearms' },
    { name: 'Optics', testId: 'optics' },
    { name: 'Ammunition', testId: 'ammunition' },
    { name: 'Suppressors', testId: 'suppressors' },
    { name: 'Bullets', testId: 'bullets' },
    { name: 'Magazines', testId: 'magazines' },
    { name: 'Accessories', testId: 'accessories' },
    { name: 'Powder', testId: 'powder' },
    { name: 'Primers', testId: 'primers' },
    { name: 'Brass', testId: 'brass' },
    { name: 'Dies', testId: 'dies' },
    { name: 'Tools', testId: 'tools' }
  ];

  for (const category of categories) {
    test(`${category.name}: Create, Read, Update, Delete`, async ({ page }) => {
      // Click Add Item button
      await page.click('[data-testid="add-item-button"]');
      
      // Select category
      await page.click('[data-testid="category-select"]');
      await page.click(`[data-testid="category-option-${category.testId}"]`);
      
      // Fill in basic fields
      await page.fill('[data-testid="item-name"]', `Test ${category.name} Item`);
      await page.fill('[data-testid="manufacturer"]', 'Test Manufacturer');
      await page.fill('[data-testid="quantity"]', '5');
      
      // Submit form
      await page.click('[data-testid="submit-item"]');
      
      // Verify item appears in list
      await expect(page.locator(`text=Test ${category.name} Item`)).toBeVisible();
      
      // Edit item
      await page.click(`[data-testid="edit-item-Test-${category.name}-Item"]`);
      await page.fill('[data-testid="item-name"]', `Updated ${category.name} Item`);
      await page.click('[data-testid="submit-item"]');
      
      // Verify update
      await expect(page.locator(`text=Updated ${category.name} Item`)).toBeVisible();
      
      // Delete item
      await page.click(`[data-testid="delete-item-Updated-${category.name}-Item"]`);
      await page.click('[data-testid="confirm-delete"]');
      
      // Verify deletion
      await expect(page.locator(`text=Updated ${category.name} Item`)).not.toBeVisible();
    });
  }
});

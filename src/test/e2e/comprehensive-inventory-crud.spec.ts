import { test, expect } from '@playwright/test';
import { allMockItems } from '../fixtures/inventory.fixtures';

test.describe('Comprehensive Inventory CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await page.waitForSelector('[data-testid="inventory-dashboard"]', { timeout: 10000 });
  });

  test('should add items for all 11 categories', async ({ page }) => {
    for (const item of allMockItems) {
      // Open add item modal
      await page.click('[data-testid="add-item-button"]');
      await page.waitForSelector('[data-testid="add-item-modal"]');

      // Select category
      await page.click('[data-testid="category-select"]');
      await page.click(`[data-value="${item.category}"]`);

      // Fill in basic fields
      await page.fill('[data-testid="name-input"]', item.name);
      await page.fill('[data-testid="manufacturer-input"]', item.manufacturer);
      
      if (item.model) {
        await page.fill('[data-testid="model-input"]', item.model);
      }

      await page.fill('[data-testid="quantity-input"]', item.quantity.toString());
      await page.fill('[data-testid="purchase-price-input"]', item.purchase_price.toString());

      // Submit form
      await page.click('[data-testid="submit-button"]');

      // Wait for success toast
      await expect(page.locator('.toast')).toContainText('added successfully');
      
      // Close modal
      await page.waitForTimeout(1000);
    }
  });

  test('should filter items by category', async ({ page }) => {
    const categories = ['firearms', 'ammunition', 'optics', 'magazines', 'accessories'];

    for (const category of categories) {
      await page.click(`[data-testid="category-filter-${category}"]`);
      
      // Verify filtered items
      const items = await page.locator('[data-testid="item-card"]').all();
      
      for (const item of items) {
        const categoryBadge = await item.locator('[data-testid="category-badge"]').textContent();
        expect(categoryBadge?.toLowerCase()).toContain(category);
      }
    }
  });

  test('should search items by name', async ({ page }) => {
    const searchTerm = 'Test AR-15';
    
    await page.fill('[data-testid="search-input"]', searchTerm);
    await page.waitForTimeout(500);

    const items = await page.locator('[data-testid="item-card"]').all();
    expect(items.length).toBeGreaterThan(0);

    const firstItem = await items[0].locator('[data-testid="item-name"]').textContent();
    expect(firstItem).toContain(searchTerm);
  });

  test('should edit an item', async ({ page }) => {
    // Click first item
    await page.click('[data-testid="item-card"]:first-child');
    await page.waitForSelector('[data-testid="item-detail-modal"]');

    // Click edit button
    await page.click('[data-testid="edit-button"]');
    await page.waitForSelector('[data-testid="edit-item-modal"]');

    // Update name
    const newName = 'Updated Test Item';
    await page.fill('[data-testid="name-input"]', newName);

    // Submit
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('.toast')).toContainText('updated successfully');
  });

  test('should delete an item', async ({ page }) => {
    // Click first item
    await page.click('[data-testid="item-card"]:first-child');
    await page.waitForSelector('[data-testid="item-detail-modal"]');

    // Click delete button
    await page.click('[data-testid="delete-button"]');

    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]');
    await expect(page.locator('.toast')).toContainText('deleted successfully');
  });
});

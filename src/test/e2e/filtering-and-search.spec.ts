import { test, expect } from '@playwright/test';

test.describe('Filtering and Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="inventory-dashboard"]');
  });

  test('should filter by multiple categories', async ({ page }) => {
    // Select firearms
    await page.click('[data-testid="category-filter-firearms"]');
    await page.waitForTimeout(300);
    
    // Add ammunition
    await page.click('[data-testid="category-filter-ammunition"]');
    await page.waitForTimeout(300);

    // Verify both categories are shown
    const items = await page.locator('[data-testid="item-card"]').all();
    
    for (const item of items) {
      const category = await item.getAttribute('data-category');
      expect(['firearms', 'ammunition']).toContain(category);
    }
  });

  test('should search with filters applied', async ({ page }) => {
    // Apply category filter
    await page.click('[data-testid="category-filter-firearms"]');
    
    // Search within filtered results
    await page.fill('[data-testid="search-input"]', 'Test');
    await page.waitForTimeout(500);

    const items = await page.locator('[data-testid="item-card"]').all();
    
    for (const item of items) {
      const category = await item.getAttribute('data-category');
      expect(category).toBe('firearms');
      
      const name = await item.locator('[data-testid="item-name"]').textContent();
      expect(name?.toLowerCase()).toContain('test');
    }
  });

  test('should clear all filters', async ({ page }) => {
    // Apply filters
    await page.click('[data-testid="category-filter-firearms"]');
    await page.fill('[data-testid="search-input"]', 'Test');

    // Clear filters
    await page.click('[data-testid="clear-filters-button"]');

    // Verify all items shown
    const searchValue = await page.inputValue('[data-testid="search-input"]');
    expect(searchValue).toBe('');
    
    const activeFilters = await page.locator('[data-testid^="category-filter-"][data-active="true"]').count();
    expect(activeFilters).toBe(0);
  });

  test('should sort items by price', async ({ page }) => {
    await page.click('[data-testid="sort-select"]');
    await page.click('[data-value="price-high"]');
    await page.waitForTimeout(500);

    const prices = await page.locator('[data-testid="item-price"]').allTextContents();
    const numericPrices = prices.map(p => parseFloat(p.replace(/[^0-9.]/g, '')));
    
    // Verify descending order
    for (let i = 0; i < numericPrices.length - 1; i++) {
      expect(numericPrices[i]).toBeGreaterThanOrEqual(numericPrices[i + 1]);
    }
  });

  test('should filter by condition', async ({ page }) => {
    await page.click('[data-testid="condition-filter"]');
    await page.click('[data-value="excellent"]');
    await page.waitForTimeout(300);

    const items = await page.locator('[data-testid="item-card"]').all();
    
    for (const item of items) {
      const condition = await item.locator('[data-testid="item-condition"]').textContent();
      expect(condition?.toLowerCase()).toBe('excellent');
    }
  });
});

import { test, expect } from '@playwright/test';

test.describe('Category Filter Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="inventory-dashboard"]', { timeout: 10000 });
  });

  test('All 12 categories appear in filter dropdown', async ({ page }) => {
    // Open category filter
    await page.click('[data-testid="category-filter"]');
    
    const expectedCategories = [
      'Firearms', 'Optics', 'Ammunition', 'Suppressors',
      'Bullets', 'Magazines', 'Accessories', 'Powder',
      'Primers', 'Brass', 'Dies', 'Tools'
    ];
    
    for (const category of expectedCategories) {
      await expect(page.locator(`[data-testid="filter-option-${category.toLowerCase()}"]`)).toBeVisible();
    }
  });

  test('Filtering by each category shows correct items', async ({ page }) => {
    const categories = ['Firearms', 'Optics', 'Ammunition', 'Magazines'];
    
    for (const category of categories) {
      // Select category filter
      await page.click('[data-testid="category-filter"]');
      await page.click(`[data-testid="filter-option-${category.toLowerCase()}"]`);
      
      // Verify filtered results
      const itemCards = page.locator('[data-testid="item-card"]');
      const count = await itemCards.count();
      
      // All visible items should be of selected category
      for (let i = 0; i < count; i++) {
        const categoryBadge = itemCards.nth(i).locator('[data-testid="item-category"]');
        await expect(categoryBadge).toHaveText(category);
      }
      
      // Clear filter
      await page.click('[data-testid="clear-filters"]');
    }
  });

  test('Category count badges are accurate', async ({ page }) => {
    const categories = ['Firearms', 'Optics', 'Ammunition'];
    
    for (const category of categories) {
      const countBadge = page.locator(`[data-testid="category-count-${category.toLowerCase()}"]`);
      const countText = await countBadge.textContent();
      const count = parseInt(countText || '0');
      
      // Filter by category
      await page.click('[data-testid="category-filter"]');
      await page.click(`[data-testid="filter-option-${category.toLowerCase()}"]`);
      
      // Count visible items
      const itemCards = page.locator('[data-testid="item-card"]');
      const visibleCount = await itemCards.count();
      
      expect(visibleCount).toBe(count);
      
      await page.click('[data-testid="clear-filters"]');
    }
  });
});

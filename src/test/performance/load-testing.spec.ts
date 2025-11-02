import { test, expect } from '@playwright/test';

test.describe('Load Testing', () => {
  test('should handle 1000 inventory items', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/inventory');
    
    // Generate 1000 items
    await page.evaluate(() => {
      const items = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        category: 'firearms',
        quantity: Math.floor(Math.random() * 100),
      }));
      localStorage.setItem('inventory', JSON.stringify(items));
    });
    
    await page.reload();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
    
    const itemCount = await page.locator('.item-card').count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('should handle rapid filtering', async ({ page }) => {
    await page.goto('/inventory');
    
    const categories = ['firearms', 'ammunition', 'optics', 'accessories'];
    const startTime = Date.now();
    
    for (const category of categories) {
      await page.selectOption('select[name="category"]', category);
      await page.waitForLoadState('networkidle');
    }
    
    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(2000); // All filters in under 2 seconds
  });

  test('should handle concurrent operations', async ({ page }) => {
    await page.goto('/inventory');
    
    const operations = [
      page.getByRole('button', { name: /filter/i }).click(),
      page.getByRole('button', { name: /sort/i }).click(),
      page.fill('input[type="search"]', 'test'),
    ];
    
    await Promise.all(operations);
    await expect(page).toHaveURL(/inventory/);
  });
});

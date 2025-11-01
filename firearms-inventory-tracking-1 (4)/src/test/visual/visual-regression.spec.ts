import { test, expect } from '@playwright/test';

/**
 * Visual Regression Testing Suite
 * Captures screenshots and compares against baseline images
 */

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to be fully loaded
    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 10000 });
  });

  test('homepage renders correctly', async ({ page }) => {
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('inventory dashboard renders correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="inventory-dashboard"]');
    await expect(page).toHaveScreenshot('inventory-dashboard.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('add item modal renders correctly', async ({ page }) => {
    await page.click('button:has-text("Add Item")');
    await page.waitForSelector('[role="dialog"]');
    await expect(page).toHaveScreenshot('add-item-modal.png', {
      maxDiffPixels: 50,
    });
  });

  test('filter panel renders correctly', async ({ page }) => {
    await page.click('button:has-text("Filters")');
    await page.waitForSelector('[data-testid="filter-panel"]');
    await expect(page).toHaveScreenshot('filter-panel.png', {
      maxDiffPixels: 50,
    });
  });

  test('item card renders correctly', async ({ page }) => {
    const itemCard = page.locator('[data-testid="item-card"]').first();
    await itemCard.waitFor();
    await expect(itemCard).toHaveScreenshot('item-card.png', {
      maxDiffPixels: 50,
    });
  });

  test('category icons display correctly', async ({ page }) => {
    const categories = ['Firearms', 'Ammunition', 'Optics', 'Magazines', 'Accessories'];
    
    for (const category of categories) {
      await page.click(`button:has-text("${category}")`);
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`category-${category.toLowerCase()}.png`, {
        maxDiffPixels: 100,
      });
    }
  });

  test('mobile view renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('mobile-homepage.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('tablet view renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('tablet-homepage.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('dark mode renders correctly', async ({ page }) => {
    await page.click('button[aria-label="Toggle theme"]');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('dark-mode.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });
});

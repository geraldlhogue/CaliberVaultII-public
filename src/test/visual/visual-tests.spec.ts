import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Login page visual snapshot', async ({ page }) => {
    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Dashboard visual snapshot', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Add item modal visual snapshot', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('button:has-text("Add Item")');
    await page.waitForSelector('[role="dialog"]');
    
    await expect(page).toHaveScreenshot('add-item-modal.png', {
      animations: 'disabled',
    });
  });

  test('Inventory grid visual snapshot', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="inventory-grid"]');
    
    await expect(page).toHaveScreenshot('inventory-grid.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Mobile responsive - 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    await expect(page).toHaveScreenshot('mobile-375.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Tablet responsive - 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    
    await expect(page).toHaveScreenshot('tablet-768.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Dark mode visual snapshot', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="theme-toggle"]');
    
    await expect(page).toHaveScreenshot('dark-mode.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

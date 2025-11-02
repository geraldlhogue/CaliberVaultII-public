import { test, expect } from '@playwright/test';

test.describe('Subscription Tiers', () => {
  test('free tier should enforce 50 item limit', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('tier', 'free'));
    await page.goto('/inventory');
    
    // Add 50 items (mock)
    for (let i = 0; i < 50; i++) {
      await page.evaluate((index) => {
        const items = JSON.parse(localStorage.getItem('inventory') || '[]');
        items.push({ id: `item-${index}`, name: `Item ${index}` });
        localStorage.setItem('inventory', JSON.stringify(items));
      }, i);
    }
    
    await page.reload();
    await page.getByRole('button', { name: /add item/i }).click();
    await expect(page.getByText(/upgrade.*premium/i)).toBeVisible();
  });

  test('premium tier should allow unlimited items', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('tier', 'premium'));
    await page.goto('/inventory');
    await page.getByRole('button', { name: /add item/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should show upgrade prompt for team features', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('tier', 'free'));
    await page.getByRole('button', { name: /team/i }).click();
    await expect(page.getByText(/upgrade.*team/i)).toBeVisible();
  });
});

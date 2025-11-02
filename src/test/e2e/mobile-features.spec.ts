import { test, expect, devices } from '@playwright/test';

test.use(devices['iPhone 13']);

test.describe('Mobile Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should support pull-to-refresh', async ({ page }) => {
    await page.goto('/inventory');
    const startY = 100;
    await page.mouse.move(200, startY);
    await page.mouse.down();
    await page.mouse.move(200, startY + 300, { steps: 10 });
    await page.mouse.up();
    await expect(page.locator('[data-testid="refresh-indicator"]')).toBeVisible();
  });

  test('should open camera for barcode scanning', async ({ page, context }) => {
    await context.grantPermissions(['camera']);
    await page.goto('/inventory');
    await page.getByRole('button', { name: /scan/i }).click();
    await expect(page.locator('video')).toBeVisible();
  });

  test('should work offline', async ({ page, context }) => {
    await page.goto('/inventory');
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByText(/offline mode/i)).toBeVisible();
    await expect(page.locator('.item-card').first()).toBeVisible();
  });

  test('should support swipe gestures', async ({ page }) => {
    await page.goto('/inventory');
    const card = page.locator('.item-card').first();
    const box = await card.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 10, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.mouse.up();
      await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();
    }
  });
});

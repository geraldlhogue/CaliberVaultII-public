import { test, expect } from '@playwright/test';

test.describe('Team Collaboration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /login/i }).click();
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/');
  });

  test('should invite team member', async ({ page }) => {
    await page.getByRole('button', { name: /team/i }).click();
    await page.getByRole('button', { name: /invite/i }).click();
    await page.fill('input[type="email"]', 'newmember@example.com');
    await page.selectOption('select[name="role"]', 'member');
    await page.getByRole('button', { name: /send invitation/i }).click();
    await expect(page.getByText(/invitation sent/i)).toBeVisible();
  });

  test('should share inventory item', async ({ page }) => {
    await page.goto('/inventory');
    await page.locator('.item-card').first().click();
    await page.getByRole('button', { name: /share/i }).click();
    await page.fill('input[placeholder*="email"]', 'teammate@example.com');
    await page.getByRole('button', { name: /share item/i }).click();
    await expect(page.getByText(/shared successfully/i)).toBeVisible();
  });

  test('should add comment to item', async ({ page }) => {
    await page.goto('/inventory');
    await page.locator('.item-card').first().click();
    await page.getByRole('button', { name: /comments/i }).click();
    await page.fill('textarea', 'This is a test comment');
    await page.getByRole('button', { name: /post/i }).click();
    await expect(page.getByText('This is a test comment')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can sign up', async ({ page }) => {
    await page.click('text=Sign Up');
    
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 10000 });
  });

  test('user can login', async ({ page }) => {
    await page.click('text=Login');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('user can logout', async ({ page }) => {
    // Login first
    await page.click('text=Login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('text=Dashboard');
    
    // Logout
    await page.click('[aria-label="User menu"]');
    await page.click('text=Logout');
    
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.click('text=Login');
    
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/invalid|error/i')).toBeVisible();
  });

  test('password reset flow', async ({ page }) => {
    await page.click('text=Login');
    await page.click('text=Forgot Password');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/check your email/i')).toBeVisible();
  });
});

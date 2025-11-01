import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login modal', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /sign in/i });
    await expect(loginButton).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button:has-text("Sign In")');
    await page.fill('input[type="email"]', '');
    await page.fill('input[type="password"]', '');
    await page.click('button[type="submit"]');
    
    const errorMessage = page.locator('text=/email.*required|password.*required/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should handle invalid credentials', async ({ page }) => {
    await page.click('button:has-text("Sign In")');
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    const errorMessage = page.locator('text=/invalid.*credentials/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to signup form', async ({ page }) => {
    await page.click('button:has-text("Sign In")');
    await page.click('text=/sign up|create account/i');
    
    const signupForm = page.locator('form:has(input[type="email"])');
    await expect(signupForm).toBeVisible();
  });
});

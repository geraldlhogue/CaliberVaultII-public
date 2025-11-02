import { Page } from '@playwright/test';

export async function loginAsTestUser(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /login/i }).click();
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('/');
}

export async function createTestItem(page: Page, itemData: any) {
  await page.goto('/inventory');
  await page.getByRole('button', { name: /add item/i }).click();
  
  for (const [key, value] of Object.entries(itemData)) {
    const input = page.locator(`input[name="${key}"], select[name="${key}"]`);
    await input.fill(String(value));
  }
  
  await page.getByRole('button', { name: /save/i }).click();
  await page.waitForLoadState('networkidle');
}

export async function waitForToast(page: Page, message: string) {
  await page.waitForSelector(`text=${message}`, { timeout: 5000 });
}

export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
}

export async function mockApiResponse(page: Page, url: string, response: any) {
  await page.route(url, (route) => route.fulfill({ body: JSON.stringify(response) }));
}

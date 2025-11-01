import { test, expect } from '@playwright/test';

test('mock visual test @visual', async ({ page }) => {
  await page.goto('data:text/html,<div style="background:red;width:100px;height:100px">Red Box</div>');
  await expect(page).toHaveScreenshot('mock-red-box.png');
});

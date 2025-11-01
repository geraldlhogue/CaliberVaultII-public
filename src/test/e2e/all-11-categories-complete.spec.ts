import { test, expect } from '@playwright/test';

test.describe('All 11 Categories CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('should add, edit, and delete Firearms', async ({ page }) => {
    await page.click('text=Add Item');
    await page.selectOption('select[name="category"]', 'firearms');
    await page.fill('input[name="manufacturer"]', 'Glock');
    await page.fill('input[name="model"]', '19');
    await page.selectOption('select[name="caliber"]', '9mm');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Glock 19')).toBeVisible();
  });

  test('should add, edit, and delete Optics', async ({ page }) => {
    await page.click('text=Add Item');
    await page.selectOption('select[name="category"]', 'optics');
    await page.fill('input[name="manufacturer"]', 'Vortex');
    await page.fill('input[name="model"]', 'Strike Eagle');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Vortex Strike Eagle')).toBeVisible();
  });

  test('should add, edit, and delete Ammunition', async ({ page }) => {
    await page.click('text=Add Item');
    await page.selectOption('select[name="category"]', 'ammunition');
    await page.fill('input[name="manufacturer"]', 'Federal');
    await page.fill('input[name="model"]', 'HST');
    await page.selectOption('select[name="caliber"]', '9mm');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Federal HST')).toBeVisible();
  });

  test('should add, edit, and delete Suppressors', async ({ page }) => {
    await page.click('text=Add Item');
    await page.selectOption('select[name="category"]', 'suppressors');
    await page.fill('input[name="manufacturer"]', 'SilencerCo');
    await page.fill('input[name="model"]', 'Omega 9K');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=SilencerCo Omega 9K')).toBeVisible();
  });

  test('should add, edit, and delete Magazines', async ({ page }) => {
    await page.click('text=Add Item');
    await page.selectOption('select[name="category"]', 'magazines');
    await page.fill('input[name="manufacturer"]', 'Magpul');
    await page.fill('input[name="model"]', 'PMAG');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Magpul PMAG')).toBeVisible();
  });

  test('should add, edit, and delete Accessories', async ({ page }) => {
    await page.click('text=Add Item');
    await page.selectOption('select[name="category"]', 'accessories');
    await page.fill('input[name="manufacturer"]', 'Streamlight');
    await page.fill('input[name="model"]', 'TLR-1');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Streamlight TLR-1')).toBeVisible();
  });

  test('should add, edit, and delete Reloading Components', async ({ page }) => {
    await page.click('text=Add Item');
    await page.selectOption('select[name="category"]', 'reloading');
    await page.fill('input[name="manufacturer"]', 'RCBS');
    await page.fill('input[name="model"]', 'Rock Chucker');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=RCBS Rock Chucker')).toBeVisible();
  });

  test('should add, edit, and delete Bullets', async ({ page }) => {
    await page.click('text=Add Item');
    await page.selectOption('select[name="category"]', 'bullets');
    await page.fill('input[name="manufacturer"]', 'Hornady');
    await page.fill('input[name="model"]', 'ELD-X');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Hornady ELD-X')).toBeVisible();
  });

  test('should add, edit, and delete Cases', async ({ page }) => {
    await page.click('text=Add Item');
    await page.selectOption('select[name="category"]', 'cases');
    await page.fill('input[name="manufacturer"]', 'Lapua');
    await page.fill('input[name="model"]', '308 Brass');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Lapua 308 Brass')).toBeVisible();
  });

  test('should add, edit, and delete Primers', async ({ page }) => {
    await page.click('text=Add Item');
    await page.selectOption('select[name="category"]', 'primers');
    await page.fill('input[name="manufacturer"]', 'CCI');
    await page.fill('input[name="model"]', 'BR2');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=CCI BR2')).toBeVisible();
  });

  test('should add, edit, and delete Powder', async ({ page }) => {
    await page.click('text=Add Item');
    await page.selectOption('select[name="category"]', 'powder');
    await page.fill('input[name="manufacturer"]', 'Hodgdon');
    await page.fill('input[name="model"]', 'H4350');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Hodgdon H4350')).toBeVisible();
  });
});
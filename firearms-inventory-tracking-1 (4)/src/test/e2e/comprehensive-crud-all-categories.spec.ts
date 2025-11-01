import { test, expect } from '@playwright/test';

const CATEGORIES = [
  { name: 'Firearms', fields: { manufacturer: 'Glock', model: '19', caliber: '9mm' } },
  { name: 'Ammunition', fields: { manufacturer: 'Federal', caliber: '9mm', quantity: '100' } },
  { name: 'Optics', fields: { manufacturer: 'Vortex', model: 'Strike Eagle' } },
  { name: 'Magazines', fields: { manufacturer: 'Magpul', capacity: '30' } },
  { name: 'Accessories', fields: { name: 'Sling', type: 'Tactical' } },
  { name: 'Suppressors', fields: { manufacturer: 'SilencerCo', model: 'Omega' } },
  { name: 'Reloading Equipment', fields: { name: 'Press', type: 'Single Stage' } },
  { name: 'Cases', fields: { caliber: '9mm', quantity: '500' } },
  { name: 'Primers', fields: { type: 'Small Pistol', quantity: '1000' } },
  { name: 'Powder', fields: { name: 'Unique', weight: '1lb' } },
];

test.describe('Comprehensive CRUD Tests - All Categories', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Assume user is logged in or handle login
  });

  for (const category of CATEGORIES) {
    test.describe(category.name, () => {
      test(`should create ${category.name} item`, async ({ page }) => {
        // Click Add Item button
        await page.click('button:has-text("Add Item")');
        
        // Select category
        await page.click(`text=${category.name}`);
        
        // Fill in fields
        for (const [field, value] of Object.entries(category.fields)) {
          const input = page.locator(`input[name="${field}"], select[name="${field}"]`).first();
          await input.fill(value);
        }
        
        // Submit form
        await page.click('button:has-text("Save")');
        
        // Verify success
        await expect(page.locator('text=successfully')).toBeVisible({ timeout: 5000 });
      });

      test(`should read ${category.name} item`, async ({ page }) => {
        // Filter by category
        await page.click('button:has-text("Filter")');
        await page.click(`text=${category.name}`);
        
        // Verify items are displayed
        await expect(page.locator('[data-testid="item-card"]').first()).toBeVisible();
      });

      test(`should update ${category.name} item`, async ({ page }) => {
        // Click on first item
        await page.click('[data-testid="item-card"]').first();
        
        // Click edit button
        await page.click('button:has-text("Edit")');
        
        // Update a field
        const firstField = Object.keys(category.fields)[0];
        const input = page.locator(`input[name="${firstField}"]`).first();
        await input.fill('Updated Value');
        
        // Save changes
        await page.click('button:has-text("Save")');
        
        // Verify success
        await expect(page.locator('text=updated')).toBeVisible({ timeout: 5000 });
      });

      test(`should delete ${category.name} item`, async ({ page }) => {
        // Click on first item
        await page.click('[data-testid="item-card"]').first();
        
        // Click delete button
        await page.click('button:has-text("Delete")');
        
        // Confirm deletion
        await page.click('button:has-text("Confirm")');
        
        // Verify success
        await expect(page.locator('text=deleted')).toBeVisible({ timeout: 5000 });
      });
    });
  }

  test('should handle bulk operations across categories', async ({ page }) => {
    // Select multiple items
    await page.click('[data-testid="select-all"]');
    
    // Verify bulk actions are available
    await expect(page.locator('button:has-text("Bulk Actions")')).toBeVisible();
  });

  test('should export data from all categories', async ({ page }) => {
    // Click export button
    await page.click('button:has-text("Export")');
    
    // Select all categories
    await page.click('text=Select All');
    
    // Start export
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export CSV")');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });
});
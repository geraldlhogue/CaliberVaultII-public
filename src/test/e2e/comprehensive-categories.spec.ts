import { test, expect } from '@playwright/test';

test.describe('Comprehensive Category Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="inventory-dashboard"]', { timeout: 10000 });
  });

  const categories = [
    { 
      name: 'Firearms', 
      category: 'firearms', 
      testData: { caliber: '.308 Winchester', action: 'Bolt Action', serialNumber: 'TEST123' }
    },
    { 
      name: 'Optics', 
      category: 'optics', 
      testData: { opticType: 'Scope', magnification: '3-9x', reticleType: 'Crosshair' }
    },
    { 
      name: 'Ammunition', 
      category: 'ammunition', 
      testData: { caliber: '9mm', bulletType: 'FMJ', roundCount: '500' }
    },
    { 
      name: 'Suppressors', 
      category: 'suppressors', 
      testData: { caliber: '.308 Winchester', mountingType: 'Direct Thread', material: 'Titanium' }
    },
    { 
      name: 'Magazines', 
      category: 'magazines', 
      testData: { caliber: '9mm', capacity: '15' }
    },
    { 
      name: 'Accessories', 
      category: 'accessories', 
      testData: { accessoryType: 'Sling', description: 'Test accessory' }
    },
    { 
      name: 'Reloading', 
      category: 'reloading', 
      testData: { bulletType: 'Hollow Point', grainWeight: '147', caliber: '9mm' }
    }
  ];


  for (const cat of categories) {
    test(`${cat.name}: Full CRUD Lifecycle`, async ({ page }) => {
      // CREATE
      await page.click('[data-testid="add-item-button"]');
      await page.selectOption('[data-testid="category-select"]', cat.category);
      await page.fill('[data-testid="item-name"]', `Test ${cat.name}`);
      await page.fill('[data-testid="manufacturer"]', 'Test Mfg');
      await page.fill('[data-testid="quantity"]', '10');
      await page.click('[data-testid="submit-item"]');
      
      // READ - verify appears in list
      await expect(page.locator(`text=Test ${cat.name}`)).toBeVisible({ timeout: 5000 });
      
      // UPDATE
      await page.click(`[data-testid="item-card-Test-${cat.name}"]`);
      await page.click('[data-testid="edit-button"]');
      await page.fill('[data-testid="item-name"]', `Updated ${cat.name}`);
      await page.click('[data-testid="save-button"]');
      await expect(page.locator(`text=Updated ${cat.name}`)).toBeVisible({ timeout: 5000 });
      
      // DELETE
      await page.click(`[data-testid="item-card-Updated-${cat.name}"]`);
      await page.click('[data-testid="delete-button"]');
      await page.click('[data-testid="confirm-delete"]');
      await expect(page.locator(`text=Updated ${cat.name}`)).not.toBeVisible({ timeout: 5000 });
    });
  }
});

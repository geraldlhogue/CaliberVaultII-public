import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should export inventory to CSV', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    
    await page.click('button:has-text("Export")');
    await page.click('text="Export to CSV"');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should export inventory to PDF', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    
    await page.click('button:has-text("Export")');
    await page.click('text="Export to PDF"');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should export with filters applied', async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', 'Glock');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');
    await page.click('text="Export to CSV"');
    
    const download = await downloadPromise;
    const filePath = await download.path();
    
    if (filePath) {
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('Glock');
    }
  });
});

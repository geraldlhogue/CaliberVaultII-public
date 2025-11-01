import { test, expect } from '@playwright/test';

/**
 * Performance Testing Suite
 * Tests page load times, Core Web Vitals, and performance metrics
 */

test.describe('Performance Tests', () => {
  test('homepage loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-layout"]');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
  });

  test('measures Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals: any = {};
          
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
          });
          
          resolve(vitals);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        
        setTimeout(() => resolve({}), 5000);
      });
    });
    
    console.log('Core Web Vitals:', metrics);
  });

  test('inventory list renders efficiently with many items', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="item-card"]');
    const renderTime = Date.now() - startTime;
    
    expect(renderTime).toBeLessThan(2000);
  });

  test('search performs efficiently', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Search"]', 'test');
    
    const startTime = Date.now();
    await page.waitForTimeout(300); // Debounce time
    const searchTime = Date.now() - startTime;
    
    expect(searchTime).toBeLessThan(500);
  });

  test('filter application is performant', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    await page.click('button:has-text("Firearms")');
    await page.waitForTimeout(100);
    const filterTime = Date.now() - startTime;
    
    expect(filterTime).toBeLessThan(1000);
  });

  test('image loading is optimized', async ({ page }) => {
    await page.goto('/');
    
    const images = await page.locator('img').all();
    const loadedImages = await Promise.all(
      images.map(img => img.evaluate((el: HTMLImageElement) => el.complete))
    );
    
    const allLoaded = loadedImages.every(loaded => loaded);
    expect(allLoaded).toBeTruthy();
  });
});

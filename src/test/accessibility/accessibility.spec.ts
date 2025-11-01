import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Testing Suite
 * Tests WCAG 2.1 AA compliance using axe-core
 */

test.describe('Accessibility Tests', () => {
  test('homepage has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-layout"]');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('inventory dashboard is accessible', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .include('[data-testid="inventory-dashboard"]')
      .analyze();
    
    expect(results.violations).toEqual([]);
  });

  test('add item modal is accessible', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Add Item")');
    await page.waitForSelector('[role="dialog"]');
    
    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .analyze();
    
    expect(results.violations).toEqual([]);
  });

  test('keyboard navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
    
    // Continue tabbing
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto('/');
    
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0);
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Add Item")');
    await page.waitForSelector('[role="dialog"]');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();
    
    const labelViolations = results.violations.filter(v => v.id === 'label');
    expect(labelViolations).toEqual([]);
  });

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();
    
    const contrastViolations = results.violations.filter(v => 
      v.id === 'color-contrast' || v.id === 'color-contrast-enhanced'
    );
    expect(contrastViolations).toEqual([]);
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();
    
    const buttonViolations = results.violations.filter(v => v.id === 'button-name');
    expect(buttonViolations).toEqual([]);
  });

  test('headings are in correct order', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withTags(['best-practice'])
      .analyze();
    
    const headingViolations = results.violations.filter(v => v.id === 'heading-order');
    expect(headingViolations).toEqual([]);
  });

  test('ARIA attributes are valid', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();
    
    const ariaViolations = results.violations.filter(v => 
      v.id.startsWith('aria-')
    );
    expect(ariaViolations).toEqual([]);
  });
});

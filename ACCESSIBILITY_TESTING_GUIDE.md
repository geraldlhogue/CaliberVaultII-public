# Accessibility Testing Guide

## Overview
Accessibility testing ensures CaliberVault is usable by everyone, including people with disabilities, meeting WCAG 2.1 AA standards.

## Setup

### 1. Install Dependencies
```bash
npm install --save-dev @axe-core/playwright @playwright/test
```

### 2. Test Files Location
- Accessibility tests: `src/test/accessibility/accessibility.spec.ts`
- Results: `test-results/accessibility/`

## Running Accessibility Tests

### Run All Accessibility Tests
```bash
npm run test:accessibility
```

### Run Specific Test
```bash
npm run test:accessibility -- --grep "keyboard navigation"
```

## Test Coverage

### Current Accessibility Tests

#### 1. WCAG 2.1 AA Compliance
- **Homepage**: Full page scan
- **Inventory Dashboard**: Component-level scan
- **Add Item Modal**: Dialog accessibility
- **Tags**: wcag2a, wcag2aa, wcag21a, wcag21aa

#### 2. Keyboard Navigation
- Tab order verification
- Focus indicators visible
- All interactive elements accessible
- Escape key closes modals

#### 3. Image Alt Text
- All images have descriptive alt text
- Decorative images have empty alt=""
- Complex images have detailed descriptions

#### 4. Form Labels
- All inputs have associated labels
- Error messages linked to inputs
- Required fields indicated
- Help text accessible

#### 5. Color Contrast
- Text contrast ratio ≥ 4.5:1 (normal text)
- Text contrast ratio ≥ 3:1 (large text)
- UI component contrast ≥ 3:1
- Focus indicators visible

#### 6. Button Accessibility
- All buttons have accessible names
- Icon-only buttons have aria-label
- Button states communicated
- Disabled state clear

#### 7. Heading Structure
- Proper heading hierarchy (h1 → h2 → h3)
- No skipped heading levels
- Page has one h1
- Headings describe content

#### 8. ARIA Attributes
- Valid ARIA roles
- Required ARIA properties present
- ARIA states updated dynamically
- No conflicting attributes

## WCAG 2.1 AA Requirements

### Level A (Must Have)
- ✅ Keyboard accessible
- ✅ No keyboard traps
- ✅ Sufficient time for interactions
- ✅ No seizure-inducing content
- ✅ Skip navigation links
- ✅ Page titles descriptive
- ✅ Focus order logical
- ✅ Link purpose clear
- ✅ Multiple ways to navigate
- ✅ Headings and labels descriptive
- ✅ Focus visible
- ✅ Language of page identified

### Level AA (Should Have)
- ✅ Captions for audio/video
- ✅ Audio descriptions
- ✅ Color not sole indicator
- ✅ Audio control available
- ✅ Contrast ratio ≥ 4.5:1
- ✅ Text resizable to 200%
- ✅ Images of text avoided
- ✅ Reflow content (no horizontal scroll)
- ✅ Non-text contrast ≥ 3:1
- ✅ Text spacing adjustable
- ✅ Content on hover/focus
- ✅ Multiple ways to identify errors
- ✅ Labels or instructions provided
- ✅ Error suggestions given
- ✅ Error prevention (legal/financial)

## Axe-core Rules

### Critical Issues (Must Fix)
- `button-name`: Buttons must have discernible text
- `color-contrast`: Elements must have sufficient color contrast
- `image-alt`: Images must have alternate text
- `label`: Form elements must have labels
- `link-name`: Links must have discernible text

### Serious Issues (Should Fix)
- `aria-required-attr`: Required ARIA attributes must be provided
- `aria-valid-attr-value`: ARIA attributes must have valid values
- `heading-order`: Heading levels should increase by one
- `list`: Lists must only contain list items
- `listitem`: List items must be contained in lists

## Manual Testing Checklist

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Shift+Tab moves backwards
- [ ] Enter activates buttons/links
- [ ] Space toggles checkboxes
- [ ] Arrow keys navigate lists/menus
- [ ] Escape closes modals/menus

### Screen Reader Testing
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (Mac/iOS)
- [ ] Test with TalkBack (Android)
- [ ] All content announced
- [ ] Landmarks identified
- [ ] Form errors announced

### Visual Testing
- [ ] Zoom to 200% (no horizontal scroll)
- [ ] High contrast mode works
- [ ] Focus indicators visible
- [ ] Color not sole indicator
- [ ] Text spacing adjustable

## CI/CD Integration

### GitHub Actions
```yaml
- name: Accessibility Tests
  run: npm run test:accessibility
  
- name: Upload Accessibility Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: accessibility-report
    path: test-results/accessibility/
```

## Fixing Common Issues

### 1. Missing Alt Text
```tsx
// ❌ Bad
<img src="logo.png" />

// ✅ Good
<img src="logo.png" alt="CaliberVault Logo" />

// ✅ Decorative
<img src="divider.png" alt="" role="presentation" />
```

### 2. Missing Form Labels
```tsx
// ❌ Bad
<input type="text" placeholder="Name" />

// ✅ Good
<label htmlFor="name">Name</label>
<input type="text" id="name" />

// ✅ With aria-label
<input type="text" aria-label="Search inventory" />
```

### 3. Low Color Contrast
```css
/* ❌ Bad - 2.5:1 ratio */
.text { color: #767676; background: #ffffff; }

/* ✅ Good - 4.6:1 ratio */
.text { color: #595959; background: #ffffff; }
```

### 4. Icon-Only Buttons
```tsx
// ❌ Bad
<button><TrashIcon /></button>

// ✅ Good
<button aria-label="Delete item">
  <TrashIcon aria-hidden="true" />
</button>
```

### 5. Keyboard Traps
```tsx
// ✅ Good - Allow escape
<Dialog onEscapeKeyDown={handleClose}>
  {/* content */}
</Dialog>
```

## Tools

### Browser Extensions
- **axe DevTools**: Chrome/Firefox extension
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Built into Chrome DevTools
- **Accessibility Insights**: Microsoft tool

### Screen Readers
- **NVDA**: Free, Windows
- **JAWS**: Commercial, Windows
- **VoiceOver**: Built-in, Mac/iOS
- **TalkBack**: Built-in, Android

### Testing Tools
- **axe-core**: Automated testing library
- **Pa11y**: Command-line accessibility tester
- **Lighthouse CI**: Continuous integration
- **Accessibility Insights**: Automated + manual

## Best Practices

### 1. Semantic HTML
Use proper HTML elements:
- `<button>` for actions
- `<a>` for navigation
- `<nav>` for navigation sections
- `<main>` for main content
- `<header>`, `<footer>` for landmarks

### 2. ARIA Usage
- Use semantic HTML first
- ARIA supplements, doesn't replace
- Test with screen readers
- Keep ARIA states updated

### 3. Focus Management
- Visible focus indicators
- Logical tab order
- Trap focus in modals
- Return focus after closing

### 4. Progressive Enhancement
- Core functionality without JS
- Enhanced with JavaScript
- Graceful degradation
- Offline support

## Adding New Accessibility Tests

```typescript
test('new component is accessible', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("New Component")');
  
  const results = await new AxeBuilder({ page })
    .include('[data-testid="new-component"]')
    .analyze();
  
  expect(results.violations).toEqual([]);
});
```

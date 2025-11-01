# Unit Testing Guide for CaliberVault

## 📚 Table of Contents
1. [Overview](#overview)
2. [Test File Structure](#test-file-structure)
3. [Testing Tools & Libraries](#testing-tools--libraries)
4. [Creating Your First Test](#creating-your-first-test)
5. [Common Testing Patterns](#common-testing-patterns)
6. [Example Test Files to Study](#example-test-files-to-study)
7. [Running Tests](#running-tests)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

CaliberVault uses **Vitest** as the test runner and **React Testing Library** for component testing. This guide will help you understand how to create, run, and maintain unit tests.

### Testing Stack
- **Vitest**: Fast unit test framework (Jest alternative)
- **React Testing Library**: Test React components
- **Playwright**: End-to-end testing
- **@testing-library/user-event**: Simulate user interactions
- **@testing-library/jest-dom**: Custom matchers

---

## Test File Structure

### Directory Organization
```
src/
├── components/
│   ├── MyComponent.tsx
│   └── __tests__/
│       └── MyComponent.test.tsx
├── services/
│   ├── MyService.ts
│   └── __tests__/
│       └── MyService.test.ts
├── hooks/
│   ├── useMyHook.ts
│   └── __tests__/
│       └── useMyHook.test.ts
└── test/
    ├── e2e/              # End-to-end tests
    ├── integration/       # Integration tests
    ├── setup.ts          # Test configuration
    └── testUtils.tsx     # Shared test utilities
```

### Naming Conventions
- **Unit Tests**: `[ComponentName].test.tsx` or `[serviceName].test.ts`
- **E2E Tests**: `[feature].spec.ts`
- Place tests in `__tests__/` folder next to the file being tested

---

## Testing Tools & Libraries

### Import Statements
```typescript
// Vitest - Test framework
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// React Testing Library - Component testing
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Custom matchers
import '@testing-library/jest-dom';
```

### Key Functions

#### Vitest Functions
- `describe()` - Group related tests
- `it()` or `test()` - Individual test case
- `expect()` - Assertions
- `vi.fn()` - Create mock function
- `vi.mock()` - Mock entire module
- `beforeEach()` - Run before each test
- `afterEach()` - Run after each test

#### React Testing Library
- `render()` - Render component
- `screen` - Query rendered elements
- `fireEvent` - Trigger events
- `waitFor()` - Wait for async changes
- `userEvent` - Simulate real user interactions

---

## Creating Your First Test

### Step 1: Create Test File
Create `src/components/__tests__/Button.test.tsx`

### Step 2: Write Basic Test
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../ui/button';

describe('Button Component', () => {
  it('should render with text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Step 3: Run Test
```bash
npm test Button
```

---

## Common Testing Patterns

### 1. Testing Component Rendering
```typescript
it('should render correctly', () => {
  render(<MyComponent title="Test" />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### 2. Testing User Interactions
```typescript
it('should handle button click', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### 3. Testing Form Input
```typescript
it('should update input value', () => {
  render(<Input />);
  const input = screen.getByRole('textbox');
  
  fireEvent.change(input, { target: { value: 'test' } });
  expect(input).toHaveValue('test');
});
```

### 4. Testing Async Operations
```typescript
it('should load data', async () => {
  render(<DataComponent />);
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### 5. Mocking Functions
```typescript
it('should call API', () => {
  const mockFetch = vi.fn().mockResolvedValue({ data: [] });
  vi.mock('../api', () => ({ fetchData: mockFetch }));
  
  // Test code
  expect(mockFetch).toHaveBeenCalled();
});
```

### 6. Testing Hooks
```typescript
import { renderHook } from '@testing-library/react';

it('should return filtered items', () => {
  const { result } = renderHook(() => useFilter(items, 'query'));
  expect(result.current).toHaveLength(2);
});
```

---

## Example Test Files to Study

### 📁 **BEST EXAMPLES TO START WITH:**

#### 1. Component Tests (Simple)
**File**: `src/components/__tests__/ItemCard.test.tsx`
- Tests component rendering
- Tests click handlers
- Tests conditional rendering
- **Good for**: Learning component testing basics

#### 2. Component Tests (Complex)
**File**: `src/components/__tests__/AddItemModal.test.tsx`
- Tests form validation
- Tests modal open/close
- Tests form submission
- **Good for**: Learning form testing

#### 3. Service Tests
**File**: `src/services/__tests__/barcode.service.test.ts`
- Tests service methods
- Tests error handling
- Tests data transformation
- **Good for**: Learning service/utility testing

#### 4. Hook Tests
**File**: `src/hooks/__tests__/useInventoryFilters.test.ts`
- Tests custom React hooks
- Tests state management
- Tests filter logic
- **Good for**: Learning hook testing

#### 5. Integration Tests
**File**: `src/services/__tests__/inventory.service.test.ts`
- Tests multiple components together
- Tests API interactions
- Tests data flow
- **Good for**: Learning integration testing

#### 6. E2E Tests
**File**: `src/test/e2e/inventory-crud.spec.ts`
- Tests complete user workflows
- Tests navigation
- Tests full features
- **Good for**: Learning end-to-end testing

---

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run specific test file
npm test ItemCard

# Run tests in watch mode
npm test -- --watch

# Run with coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e
```

### Coverage Reports
After running `npm run test:coverage`, open:
```
coverage/index.html
```

### Coverage Goals
- **Target**: 70%+ coverage
- **Stretch Goal**: 80%+ coverage
- **Focus on**: Critical business logic, forms, data services

---

## Best Practices

### ✅ DO:
1. **Test behavior, not implementation**
   ```typescript
   // Good - Tests what user sees
   expect(screen.getByText('Welcome')).toBeInTheDocument();
   
   // Bad - Tests internal state
   expect(component.state.isVisible).toBe(true);
   ```

2. **Use semantic queries**
   ```typescript
   // Preferred order:
   screen.getByRole('button', { name: 'Submit' })
   screen.getByLabelText('Email')
   screen.getByText('Welcome')
   screen.getByTestId('custom-element') // Last resort
   ```

3. **Test user interactions**
   ```typescript
   const user = userEvent.setup();
   await user.click(screen.getByRole('button'));
   await user.type(screen.getByRole('textbox'), 'test');
   ```

4. **Clean up after tests**
   ```typescript
   afterEach(() => {
     vi.clearAllMocks();
     cleanup();
   });
   ```

5. **Test error states**
   ```typescript
   it('should show error message', () => {
     render(<Form onSubmit={vi.fn().mockRejectedValue('Error')} />);
     // Test error handling
   });
   ```

### ❌ DON'T:
1. Test implementation details
2. Test third-party libraries
3. Write tests that depend on each other
4. Use `getByTestId` unless necessary
5. Test styling (use visual regression instead)

---

## Troubleshooting

### Common Issues

#### 1. "Cannot find module"
**Solution**: Check import paths and ensure file exists
```typescript
// Correct
import { MyComponent } from '../MyComponent';

// Wrong
import { MyComponent } from './MyComponent';
```

#### 2. "Element not found"
**Solution**: Use `screen.debug()` to see what's rendered
```typescript
render(<MyComponent />);
screen.debug(); // Prints DOM to console
```

#### 3. "Act() warning"
**Solution**: Wrap state updates in `waitFor()`
```typescript
await waitFor(() => {
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

#### 4. "Mock not working"
**Solution**: Ensure mock is defined before import
```typescript
vi.mock('../api', () => ({
  fetchData: vi.fn()
}));

import { MyComponent } from '../MyComponent';
```

---

## Quick Reference

### Query Methods
| Method | When to Use |
|--------|-------------|
| `getByRole` | Preferred - semantic HTML |
| `getByLabelText` | Form inputs with labels |
| `getByText` | Non-interactive text |
| `getByPlaceholderText` | Input placeholders |
| `getByTestId` | Last resort |

### Query Variants
- `getBy*` - Throws if not found
- `queryBy*` - Returns null if not found
- `findBy*` - Async, waits for element

### Assertions
```typescript
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toBeDisabled()
expect(element).toHaveValue('text')
expect(element).toHaveClass('active')
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledWith(arg)
```

---

## Additional Resources

### Documentation
- **Vitest**: https://vitest.dev/
- **React Testing Library**: https://testing-library.com/react
- **Playwright**: https://playwright.dev/

### Internal Files
- **Test Setup**: `src/test/setup.ts`
- **Test Utils**: `src/test/testUtils.tsx`
- **Test Helpers**: `src/test/helpers/testHelpers.ts`

### CI/CD
Tests run automatically on:
- Every push to GitHub
- Pull requests
- See `.github/workflows/test-coverage.yml`

---

## Getting Help

1. **Check existing tests** in `src/components/__tests__/`
2. **Read error messages** carefully
3. **Use `screen.debug()`** to inspect rendered output
4. **Check test coverage** to see what's missing
5. **Refer to this guide** for patterns and examples

---

**Happy Testing! 🧪**

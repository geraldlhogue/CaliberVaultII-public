# AI-Powered Test Generator Guide

## Overview

The AI Test Generator uses OpenAI's GPT-4o model to analyze your code and automatically generate comprehensive test suites with full coverage, realistic test data, and proper mocking strategies.

## Features

✨ **Intelligent Code Analysis**: AI understands your code logic, dependencies, and edge cases
🎯 **Comprehensive Coverage**: Generates tests for all code paths and scenarios
🧪 **Realistic Test Data**: Creates meaningful test data based on your code context
🔧 **Smart Mocking**: Automatically determines what needs to be mocked
📝 **Best Practices**: Follows React Testing Library and Vitest conventions
⚡ **One-Click Generation**: Paste code, click generate, get complete test suite

## How to Use

### Step 1: Access the AI Test Generator

1. Navigate to **Admin Dashboard** → **Testing** tab
2. Click on **AI Test Generator** tab
3. You'll see the test generation interface

### Step 2: Prepare Your Code

1. **File Path**: Enter the path to your source file (e.g., `src/components/MyComponent.tsx`)
2. **File Type**: Select the appropriate type:
   - **Component**: React components (`.tsx`, `.jsx`)
   - **Service**: Service classes and API handlers
   - **Hook**: Custom React hooks
   - **Utility**: Helper functions and utilities

### Step 3: Paste Your Code

Copy and paste the source code you want to generate tests for into the large text area.

**Example Component:**
```typescript
export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Step 4: Generate Tests

Click the **"Generate Test Suite"** button. The AI will:
- Analyze your code structure
- Identify all functions and methods
- Detect edge cases and error scenarios
- Generate comprehensive tests
- Include proper mocking and setup

### Step 5: Review Generated Tests

The AI will generate a complete test file including:
- All necessary imports
- Test setup and teardown
- Mock implementations
- Test cases for all functionality
- Edge case coverage
- Error handling tests

**Example Generated Test:**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from './Counter';

describe('Counter', () => {
  it('renders with initial count of 0', () => {
    render(<Counter />);
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });

  it('increments count when button is clicked', () => {
    render(<Counter />);
    const button = screen.getByText('Increment');
    fireEvent.click(button);
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
```

### Step 6: Save or Copy Tests

- **Copy**: Click the copy button to copy tests to clipboard
- **Download**: Click download to save as a `.test.tsx` file
- **Edit**: Modify the generated tests as needed

## What the AI Tests For

### Components
- ✅ Rendering with different props
- ✅ User interactions (clicks, inputs, etc.)
- ✅ State changes
- ✅ Conditional rendering
- ✅ Error boundaries
- ✅ Accessibility

### Services
- ✅ All public methods
- ✅ Success scenarios
- ✅ Error handling
- ✅ API calls and responses
- ✅ Data transformations
- ✅ Edge cases

### Hooks
- ✅ Return values
- ✅ State updates
- ✅ Side effects
- ✅ Dependencies
- ✅ Cleanup functions
- ✅ Error states

### Utilities
- ✅ All function branches
- ✅ Input validation
- ✅ Return values
- ✅ Error cases
- ✅ Edge conditions
- ✅ Type safety

## Best Practices

### 1. Provide Context
Include relevant imports and types in your code paste for better AI understanding.

### 2. Review Generated Tests
Always review and adjust generated tests to match your specific requirements.

### 3. Add Custom Scenarios
The AI covers common cases, but you may need to add domain-specific tests.

### 4. Verify Mocks
Check that mocked dependencies match your actual implementation.

### 5. Run Generated Tests
Always run the generated tests to ensure they work correctly:
```bash
npm run test
```

## Advanced Usage

### Testing Complex Components

For components with many dependencies, paste the full component including:
- All imports
- Type definitions
- Context usage
- Custom hooks

The AI will generate appropriate mocks for all dependencies.

### Testing Services with API Calls

For services making API calls, the AI will:
- Mock fetch/axios calls
- Generate realistic response data
- Test error scenarios
- Verify request parameters

### Testing Custom Hooks

For hooks, the AI uses `renderHook` from React Testing Library:
```typescript
import { renderHook, act } from '@testing-library/react';
```

## Troubleshooting

### Issue: Generated tests don't compile
**Solution**: Check that all imports are correct and dependencies are installed.

### Issue: Mocks aren't working
**Solution**: Verify mock implementations match your actual code structure.

### Issue: Tests fail unexpectedly
**Solution**: Review the test assertions and adjust to match your component behavior.

### Issue: Missing test coverage
**Solution**: Generate tests for each file separately, or add custom tests for specific scenarios.

## Integration with Coverage Dashboard

Generated tests automatically integrate with the Test Coverage Dashboard:
1. Save generated tests to your test directory
2. Run `npm run test:coverage`
3. View coverage in the Coverage Dashboard tab

## Tips for Best Results

1. **Clean Code**: Well-structured code generates better tests
2. **Type Safety**: TypeScript types help the AI understand your code
3. **Documentation**: JSDoc comments improve test quality
4. **Modularity**: Smaller, focused functions generate more precise tests
5. **Naming**: Clear function/variable names lead to better test descriptions

## Example Workflows

### Workflow 1: New Component
1. Write your component
2. Generate tests with AI
3. Review and adjust
4. Run tests
5. Check coverage

### Workflow 2: Legacy Code
1. Paste existing code
2. Generate comprehensive tests
3. Identify uncovered edge cases
4. Add custom tests as needed
5. Refactor with confidence

### Workflow 3: Refactoring
1. Generate tests for current code
2. Refactor implementation
3. Tests ensure behavior unchanged
4. Update tests if behavior changes intentionally

## Support

For issues or questions:
- Check existing test examples in `src/components/__tests__/`
- Review the Unit Testing Guide
- Consult React Testing Library docs
- Check Vitest documentation

## Future Enhancements

Coming soon:
- Batch test generation for multiple files
- Integration test generation
- E2E test generation
- Custom test templates
- Test quality scoring
- Automatic test updates when code changes

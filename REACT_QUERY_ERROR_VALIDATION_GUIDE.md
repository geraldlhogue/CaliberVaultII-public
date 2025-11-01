# React Query, Error Boundary & Form Validation Guide

## Overview
This guide covers the three major systems added to improve data fetching, error handling, and form validation.

## 1. React Query Integration

### Setup
React Query is configured in `src/lib/queryClient.ts` with optimized defaults:
- 5-minute stale time
- 30-minute garbage collection
- Smart retry logic (no retry on 4xx errors)
- Automatic error toasts

### Usage

#### Fetching Data
```typescript
import { useInventoryItems } from '@/hooks/useInventoryQuery';

function MyComponent() {
  const { data, isLoading, error } = useInventoryItems(userId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* render data */}</div>;
}
```

#### Mutations (Create/Update/Delete)
```typescript
import { useAddInventoryItem } from '@/hooks/useInventoryQuery';

function AddItemForm() {
  const addItem = useAddInventoryItem();
  
  const handleSubmit = async (data) => {
    await addItem.mutateAsync(data);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Benefits
- Automatic caching and background refetching
- Optimistic updates
- Request deduplication
- Built-in loading and error states

## 2. Enhanced Error Boundary System

### Features
- Comprehensive error logging
- Multiple recovery options
- Development vs production modes
- Error type classification
- Integration with monitoring services

### Usage

#### Basic Usage
```typescript
import { EnhancedErrorBoundary } from '@/components/errors/EnhancedErrorBoundary';

<EnhancedErrorBoundary>
  <YourComponent />
</EnhancedErrorBoundary>
```

#### With Custom Error Handler
```typescript
<EnhancedErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling
    console.log('Custom handler:', error);
  }}
  showDetails={true}
>
  <YourComponent />
</EnhancedErrorBoundary>
```

### Error Logging
Errors are automatically logged to `errorLogger` service:
```typescript
import { errorLogger } from '@/lib/errorLogging';

// Get all logged errors
const logs = errorLogger.getLogs();

// Clear logs
errorLogger.clearLogs();
```

## 3. Form Validation with Zod

### Schema Definition
Schemas are defined in `src/lib/validation/schemas.ts`:

```typescript
import { z } from 'zod';

export const myFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().positive('Must be positive'),
});
```

### Using with React Hook Form
```typescript
import { useFormValidation } from '@/hooks/useFormValidation';
import { myFormSchema } from '@/lib/validation/schemas';

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = 
    useFormValidation(myFormSchema);
  
  const onSubmit = (data) => {
    console.log('Valid data:', data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Pre-built Schemas
- `universalFieldsSchema` - Common inventory fields
- `firearmSchema` - Firearm-specific validation
- `ammunitionSchema` - Ammunition-specific validation

## Best Practices

### React Query
1. Use query keys consistently: `['resource', id]`
2. Invalidate queries after mutations
3. Use `enabled` option for conditional queries
4. Leverage `useQueryClient` for manual cache updates

### Error Boundaries
1. Place boundaries at strategic points (page level, feature level)
2. Provide custom fallback UIs for better UX
3. Always log errors for debugging
4. Test error scenarios in development

### Form Validation
1. Define schemas before components
2. Use descriptive error messages
3. Validate on blur for better UX
4. Handle async validation when needed

## Testing

### Testing with React Query
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

render(
  <QueryClientProvider client={queryClient}>
    <YourComponent />
  </QueryClientProvider>
);
```

### Testing Error Boundaries
```typescript
const ThrowError = () => {
  throw new Error('Test error');
};

render(
  <EnhancedErrorBoundary>
    <ThrowError />
  </EnhancedErrorBoundary>
);
```

## Troubleshooting

### React Query not refetching
- Check `staleTime` configuration
- Verify query keys are correct
- Ensure `enabled` option is true

### Error Boundary not catching errors
- Error boundaries only catch errors in child components
- They don't catch errors in event handlers or async code
- Use try-catch for event handlers

### Form validation not working
- Verify schema is correctly defined
- Check resolver is properly configured
- Ensure field names match schema keys

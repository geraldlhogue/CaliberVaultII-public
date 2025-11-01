# Comprehensive Error Handling Documentation

## Overview
CaliberVault implements multi-layered error handling across all I/O operations with user-friendly messages and detailed logging.

## 1. Error Handling Architecture

### 1.1 Error Handler Library
**Location:** `src/lib/errorHandler.ts`

**Functions:**
- `logError(error, context)` - Centralized error logging
- `handleError(error, userMessage)` - User-facing error handling
- `reportError(error, context)` - Send to Sentry

**Example:**
```typescript
try {
  await operation();
} catch (error) {
  logError(error, { operation: 'addItem', userId });
  toast.error('Failed to add item. Please try again.');
}
```

### 1.2 Error Recovery
**Location:** `src/lib/errorRecovery.ts`

**Functions:**
- `retryOperation(fn, maxRetries)` - Automatic retry with exponential backoff
- `recoverFromError(error, fallback)` - Graceful degradation

## 2. Database Error Handling

### 2.1 Inventory Service
**Location:** `src/services/inventory.service.ts`

**Operations with Error Handling:**

**Create Item:**
```typescript
async addCloudItem(item: InventoryItem) {
  try {
    // Validation
    if (!item.name) throw new Error('Item name is required');
    
    // Database insert
    const { data, error } = await supabase
      .from('inventory')
      .insert([item])
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Item added successfully');
    return data;
  } catch (error) {
    logError(error, { operation: 'addCloudItem', item });
    toast.error('Failed to add item. Please check your connection.');
    throw error;
  }
}
```

**Error Messages:**
- "Item name is required" - Validation error
- "Failed to add item. Please check your connection." - Network/DB error
- "Insufficient permissions" - RLS policy error

**Update Item:**
```typescript
async updateCloudItem(id: string, updates: Partial<InventoryItem>) {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Item updated successfully');
    return data;
  } catch (error) {
    logError(error, { operation: 'updateCloudItem', id, updates });
    toast.error('Failed to update item.');
    throw error;
  }
}
```

**Error Messages:**
- "Failed to update item." - Generic update error
- "Item not found" - Invalid ID
- "Update conflict" - Concurrent modification

**Delete Item:**
```typescript
async deleteCloudItem(id: string) {
  try {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Item deleted successfully');
  } catch (error) {
    logError(error, { operation: 'deleteCloudItem', id });
    toast.error('Failed to delete item.');
    throw error;
  }
}
```

**Error Messages:**
- "Failed to delete item." - Delete error
- "Item is referenced by other records" - Foreign key constraint

### 2.2 Category Services
**Location:** `src/services/category/*.ts`

All category services inherit from `BaseCategoryService` with standardized error handling:

```typescript
async create(data: T) {
  try {
    // Insert into inventory table
    const inventoryData = await this.insertInventory(data);
    
    // Insert into detail table
    const detailData = await this.insertDetails(inventoryData.id, data);
    
    toast.success(`${this.categoryName} added successfully`);
    return { ...inventoryData, ...detailData };
  } catch (error) {
    logError(error, { service: this.categoryName, operation: 'create' });
    toast.error(`Failed to add ${this.categoryName.toLowerCase()}`);
    throw error;
  }
}
```

**Error Messages by Category:**
- Firearms: "Failed to add firearm"
- Ammunition: "Failed to add ammunition"
- Optics: "Failed to add optic"
- Suppressors: "Failed to add suppressor"
- Magazines: "Failed to add magazine"
- Accessories: "Failed to add accessory"
- Reloading: "Failed to add reloading component"
- Powder: "Failed to add powder"
- Primers: "Failed to add primers"
- Bullets: "Failed to add bullets"
- Cases: "Failed to add cases"

## 3. File Upload Error Handling

### 3.1 Image Upload
**Location:** `src/services/storage.service.ts`

```typescript
async uploadImage(file: File, path: string) {
  try {
    // Validation
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }
    
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    // Upload
    const { data, error } = await supabase.storage
      .from('firearm-images')
      .upload(path, file);
    
    if (error) throw error;
    
    return data.path;
  } catch (error) {
    logError(error, { operation: 'uploadImage', fileName: file.name });
    toast.error('Failed to upload image. Please try again.');
    throw error;
  }
}
```

**Error Messages:**
- "File size must be less than 10MB" - Size validation
- "File must be an image" - Type validation
- "Failed to upload image. Please try again." - Upload error
- "Storage quota exceeded" - Storage limit reached

## 4. API Error Handling

### 4.1 Barcode Lookup
**Location:** `src/services/barcode/BarcodeService.ts`

```typescript
async lookupBarcode(barcode: string) {
  try {
    const { data, error } = await supabase.functions.invoke('barcode-lookup', {
      body: { barcode }
    });
    
    if (error) throw error;
    
    if (!data || !data.product) {
      throw new Error('Product not found');
    }
    
    return data.product;
  } catch (error) {
    logError(error, { operation: 'lookupBarcode', barcode });
    
    if (error.message === 'Product not found') {
      toast.warning('Product not found. Please enter details manually.');
    } else {
      toast.error('Barcode lookup failed. Please try again.');
    }
    
    throw error;
  }
}
```

**Error Messages:**
- "Product not found. Please enter details manually." - No match
- "Barcode lookup failed. Please try again." - API error
- "Invalid barcode format" - Validation error

### 4.2 AI Valuation
**Location:** `src/services/ai/AIService.ts`

```typescript
async getValuation(item: InventoryItem) {
  try {
    const { data, error } = await supabase.functions.invoke('ai-valuation', {
      body: { item }
    });
    
    if (error) throw error;
    
    return data.valuation;
  } catch (error) {
    logError(error, { operation: 'getValuation', itemId: item.id });
    toast.error('AI valuation failed. Please try manual valuation.');
    throw error;
  }
}
```

**Error Messages:**
- "AI valuation failed. Please try manual valuation." - AI service error
- "Insufficient data for valuation" - Missing required fields

## 5. Authentication Error Handling

### 5.1 Auth Service
**Location:** `src/components/auth/AuthProvider.tsx`

```typescript
async signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    toast.success('Signed in successfully');
    return data;
  } catch (error) {
    logError(error, { operation: 'signIn', email });
    
    if (error.message.includes('Invalid login')) {
      toast.error('Invalid email or password');
    } else if (error.message.includes('Email not confirmed')) {
      toast.error('Please confirm your email address');
    } else {
      toast.error('Sign in failed. Please try again.');
    }
    
    throw error;
  }
}
```

**Error Messages:**
- "Invalid email or password" - Bad credentials
- "Please confirm your email address" - Unverified email
- "Sign in failed. Please try again." - Generic error
- "Account locked" - Too many failed attempts
- "Session expired" - Token expired

## 6. Network Error Handling

### 6.1 Offline Detection
**Location:** `src/hooks/useOfflineSync.ts`

```typescript
useEffect(() => {
  const handleOnline = () => {
    toast.success('Back online. Syncing data...');
    syncOfflineQueue();
  };
  
  const handleOffline = () => {
    toast.warning('You are offline. Changes will sync when reconnected.');
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
```

**Error Messages:**
- "You are offline. Changes will sync when reconnected." - Offline mode
- "Back online. Syncing data..." - Reconnected
- "Sync failed. Will retry automatically." - Sync error

## 7. Validation Error Handling

### 7.1 Form Validation
**Location:** `src/hooks/useFormValidation.ts`

```typescript
const validate = (data: any) => {
  const errors: Record<string, string> = {};
  
  if (!data.name) {
    errors.name = 'Name is required';
  }
  
  if (data.purchasePrice && isNaN(data.purchasePrice)) {
    errors.purchasePrice = 'Price must be a number';
  }
  
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  return errors;
};
```

**Error Messages:**
- "Name is required" - Required field
- "Price must be a number" - Type validation
- "Invalid email format" - Format validation
- "Serial number already exists" - Uniqueness validation

## 8. Error Logging & Monitoring

### 8.1 Sentry Integration
**Location:** `src/lib/sentry.ts`

All errors are automatically sent to Sentry with:
- Error message and stack trace
- User context (ID, email)
- Operation context
- Device/browser info
- Breadcrumbs (user actions)

### 8.2 Database Error Logs
**Table:** `audit_logs`

All database errors are logged with:
- Timestamp
- User ID
- Operation type
- Error message
- Request payload

## 9. User-Facing Error Messages

### 9.1 Toast Notifications
All errors show user-friendly toast messages:
- Red for errors
- Yellow for warnings
- Green for success
- Blue for info

### 9.2 Error Message Guidelines
- Clear and concise
- Actionable (tell user what to do)
- Non-technical language
- Suggest solutions when possible

## 10. Error Recovery Strategies

### 10.1 Automatic Retry
Operations that fail due to network issues are automatically retried:
- Max 3 retries
- Exponential backoff (1s, 2s, 4s)
- User notification on final failure

### 10.2 Offline Queue
Failed operations are queued and retried when online:
- Stored in IndexedDB
- Automatic sync on reconnection
- User can view pending operations

### 10.3 Graceful Degradation
When services fail, app continues with reduced functionality:
- AI valuation fails → Manual valuation available
- Barcode lookup fails → Manual entry
- Image upload fails → Item saved without image

## Summary

CaliberVault implements comprehensive error handling across:
- ✅ All database operations
- ✅ File uploads/downloads
- ✅ API calls
- ✅ Authentication
- ✅ Form validation
- ✅ Network connectivity
- ✅ User input

All errors are:
- ✅ Logged to Sentry
- ✅ Stored in database
- ✅ Shown to user with clear messages
- ✅ Automatically retried when appropriate
- ✅ Gracefully degraded when possible

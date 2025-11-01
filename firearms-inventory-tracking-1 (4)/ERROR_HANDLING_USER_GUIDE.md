# Error Handling User Guide

## What Changed

CaliberVault now has comprehensive error handling that provides clear, actionable error messages when something goes wrong. Instead of cryptic technical errors, you'll see friendly messages that explain what happened and what to do next.

## For End Users

### What You'll See Now

**Before:**
```
Error: PGRST204 - Could not find the 'action_id' column
```

**After:**
```
❌ Database schema mismatch. Please contact support.
```

### Types of Error Messages

1. **Database Errors**
   - "This record already exists" - You're trying to add a duplicate item
   - "Related record not found" - A required reference (like manufacturer) is missing
   - "Required field is missing" - You need to fill in a required field

2. **Permission Errors**
   - "You do not have permission for this operation" - Contact your admin

3. **Connection Errors**
   - "Unable to connect to the server" - Check your internet connection

### What To Do When You See an Error

1. **Read the error message** - It tells you exactly what went wrong
2. **Follow the suggested action** - Each error includes what to do next
3. **Try again** - Many errors are temporary
4. **Contact support if it persists** - Use the error export feature (see below)

## For Administrators

### Accessing Error Logs

1. Go to **Admin Dashboard** (gear icon in navigation)
2. Click the **⚠️ Errors** tab
3. View all recent errors with full details

### Error Log Features

- **View Last 50 Errors** - See recent issues
- **Error Details** - Timestamp, operation, component, data state
- **Export Logs** - Download as JSON for support
- **Clear Logs** - Remove all error logs

### What's Logged

For each error, you can see:
- **When** - Exact timestamp
- **Where** - Which component/operation
- **What** - Error message and code
- **Data** - What data was being processed
- **User** - Who encountered the error (if available)

### Using Error Logs for Troubleshooting

1. **Check Recent Errors** - Look for patterns
2. **Review Data State** - See what data caused the issue
3. **Export for Support** - Send logs to technical support
4. **Monitor Trends** - Track if same errors repeat

### Common Error Patterns

#### "Schema Cache" Errors
- **Cause**: Database schema doesn't match code
- **Solution**: Contact technical support for schema update

#### "Foreign Key" Errors  
- **Cause**: Trying to reference non-existent data
- **Solution**: Ensure reference data (manufacturers, calibers) exists first

#### "Unique Constraint" Errors
- **Cause**: Duplicate serial numbers or names
- **Solution**: Check existing items before adding

## For Developers

### Error Handling Architecture

All I/O operations now use:
- `withDatabaseErrorHandling()` for database operations
- `withErrorHandling()` for general async operations

### Key Files

- `src/lib/errorHandler.ts` - Core error handling
- `src/lib/databaseErrorHandler.ts` - Database-specific handling
- `src/lib/errorMessages.ts` - User-friendly message mapping
- `src/services/base/BaseCategoryServiceEnhanced.ts` - Enhanced base service

### Updated Services

✅ FirearmsService - Full error handling
✅ AmmunitionService - Full error handling
✅ OpticsService - Full error handling

### Pattern for Other Services

```typescript
import { BaseCategoryServiceEnhanced } from '../base/BaseCategoryServiceEnhanced';
import { withDatabaseErrorHandling } from '@/lib/databaseErrorHandler';

export class MyService extends BaseCategoryServiceEnhanced<MyDetails> {
  // Automatic error handling for CRUD operations
  // Add custom methods with error handling:
  
  async customOperation(id: string) {
    const result = await withDatabaseErrorHandling(
      () => supabase.from('my_table').select('*').eq('id', id),
      {
        operation: 'customOperation',
        component: this.logPrefix,
        table: 'my_table',
        action: 'select',
        recordId: id
      }
    );

    if (!result.success) {
      throw new Error(result.userMessage);
    }

    return result.data;
  }
}
```

## Benefits

### For Users
- ✅ Clear, understandable error messages
- ✅ Know what went wrong
- ✅ Know what to do next
- ✅ Less frustration

### For Admins
- ✅ See all errors in one place
- ✅ Export logs for support
- ✅ Track error patterns
- ✅ Faster troubleshooting

### For Developers
- ✅ Consistent error handling
- ✅ Detailed logging
- ✅ Easy debugging
- ✅ Production monitoring ready

## Support

If you encounter an error:

1. **Read the error message** - It's designed to help
2. **Check Error Logs** - Admin > Errors tab
3. **Export Logs** - Click "Export" button
4. **Contact Support** - Send exported logs with description

The error logs contain everything needed to diagnose and fix the issue quickly.

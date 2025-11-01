# CaliberVault Error Handling & Monitoring - User Manual

## Table of Contents
1. [For End Users](#for-end-users)
2. [For Administrators](#for-administrators)
3. [For Developers](#for-developers)
4. [Troubleshooting Guide](#troubleshooting-guide)

---

## For End Users

### What You'll See When Errors Occur

CaliberVault has comprehensive error handling to ensure you always know what's happening:

#### User-Friendly Error Messages
When something goes wrong, you'll see clear, actionable messages:
- **Red notification**: Critical errors that need immediate attention
- **Orange notification**: Warnings that may affect functionality
- **Blue notification**: Informational messages about system status

#### Example Error Messages
- ❌ **"Save Failed"** - Your item couldn't be saved. Check your internet connection.
- ⚠️ **"Camera Permission Denied"** - Allow camera access in your browser settings.
- 💾 **"Item Limit Reached"** - Upgrade your plan to add more items.

### What To Do When You See an Error

1. **Read the Error Message** - It tells you exactly what went wrong
2. **Follow the Suggested Action** - Most errors include next steps
3. **Try Again** - Many errors are temporary (network issues, etc.)
4. **Contact Support** - If the error persists, report it with the error details

### Common Scenarios

#### Adding an Item Fails
**Error**: "Save Failed: Failed to save item"
**Solution**:
1. Check your internet connection
2. Verify all required fields are filled (Manufacturer, Model)
3. Try refreshing the page
4. If it persists, the system will attempt automatic recovery

#### Camera Won't Work on iPad
**Error**: "Camera permission denied"
**Solution**:
1. Go to Settings > Safari > Camera
2. Allow camera access for the website
3. Refresh the page
4. Try taking a photo again

#### Images Not Displaying
**What You'll See**: Placeholder icon instead of image
**Solution**:
- Images are loading in the background
- Check your internet connection
- The system logs this automatically for investigation

---

## For Administrators

### Accessing Error Monitoring Tools

Navigate to **Admin Dashboard** > **Error Logs** tab

### Error Logs Viewer

**Location**: Admin Dashboard > Error Logs tab

**Features**:
- View all system errors in chronological order
- Filter by severity (Critical, Error, Warning, Info)
- Search by error message or component
- Export logs for analysis
- Clear old logs

**How to Use**:
1. Click "Admin Dashboard" in navigation
2. Select "Error Logs" tab
3. Use filters to find specific errors
4. Click "Export Logs" to download CSV
5. Click "Clear Logs" to remove old entries

### Real-Time Error Monitor

**Location**: Admin Dashboard > Real-Time Monitor tab

**Features**:
- Live error feed (updates every 5 seconds)
- Error rate indicator (errors per 5 minutes)
- Recent error list with timestamps
- Severity badges for quick identification

**Interpreting the Monitor**:
- **Green pulse**: System monitoring active
- **Error rate < 10**: Normal operation
- **Error rate > 10**: Investigate immediately
- **No errors**: System running smoothly

### Error Analytics Dashboard

**Location**: Admin Dashboard > Error Analytics tab

**Metrics Displayed**:
- Total errors (all time)
- Last 24 hours error count
- Last 7 days error count
- Critical errors requiring attention
- Most common error messages
- Errors by component

**How to Use Analytics**:
1. Review summary cards for overall health
2. Check "Most Common Errors" to identify patterns
3. Use "Errors by Component" to find problematic areas
4. Export data for trend analysis

### Automated Error Recovery

The system automatically attempts to recover from common errors:

**Network Issues**:
- Waits 2 seconds and retries
- Checks internet connectivity
- Notifies user of recovery attempt

**Authentication Issues**:
- Attempts to refresh session
- Redirects to login if needed
- Preserves user data

**Storage Issues**:
- Clears old cache data
- Frees up space
- Notifies user of cleanup

**What You Need to Do**:
- Monitor the Real-Time Monitor for recovery attempts
- Check Error Analytics for patterns
- Investigate if same errors recur frequently

---

## For Developers

### Error Handling Architecture

#### Core Components

**1. errorHandler.ts**
```typescript
import { logError, withDatabaseErrorHandling } from '@/lib/errorHandler';

// Log any error with context
logError(error, {
  component: 'ComponentName',
  action: 'actionName',
  additionalData: { ... }
});

// Wrap database operations
await withDatabaseErrorHandling(
  async () => {
    // Your database operation
  },
  {
    operation: 'create_item',
    table: 'inventory',
    context: { itemId: '123' }
  }
);
```

**2. databaseErrorHandler.ts**
- Specialized handling for Supabase errors
- PostgreSQL error code translation
- Automatic retry logic for transient errors

**3. errorRecovery.ts**
- Automated recovery strategies
- Pattern matching for common errors
- User notification system

#### Using Error Handling in Your Code

**Basic Error Logging**:
```typescript
try {
  await someOperation();
} catch (error) {
  logError(error, {
    component: 'MyComponent',
    action: 'someOperation',
    userId: user.id
  });
  toast.error('Operation failed. Please try again.');
}
```

**Database Operations**:
```typescript
await withDatabaseErrorHandling(
  async () => {
    const { data, error } = await supabase
      .from('table')
      .insert(item);
    if (error) throw error;
    return data;
  },
  {
    operation: 'insert',
    table: 'table_name',
    context: { item }
  }
);
```

**Safe Number Formatting**:
```typescript
import { formatCurrency, safeNumber } from '@/lib/formatters';

// Instead of: value.toLocaleString()
const formatted = formatCurrency(value); // Returns $0 if invalid

// Instead of: parseFloat(value)
const num = safeNumber(value); // Returns 0 if invalid
```

### Adding Custom Recovery Strategies

```typescript
import { registerRecoveryStrategy } from '@/lib/errorRecovery';

registerRecoveryStrategy({
  errorPattern: /custom error pattern/i,
  description: 'Custom error recovery',
  recover: async () => {
    // Your recovery logic
    return true; // Return true if recovered
  }
});
```

### Error Severity Levels

- **critical**: System-breaking errors, requires immediate attention
- **error**: Operation failed, user action blocked
- **warning**: Operation succeeded with issues
- **info**: Informational, no action needed

---

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. "undefined is not an object (evaluating 's.toLocaleString')"
**Cause**: Trying to format null/undefined values
**Solution**: Use `formatCurrency()` or `safeNumber()` from `@/lib/formatters`

#### 2. Images Not Displaying
**Cause**: Image URLs invalid or loading failed
**Solution**: 
- Check browser console for specific errors
- Verify image URLs in database
- Check Error Logs for image loading failures

#### 3. Camera Not Working on iPad
**Cause**: Browser permissions or iOS-specific issues
**Solution**:
- Use EnhancedPhotoCapture component
- Check iOS camera permissions
- Ensure HTTPS connection

#### 4. Silent Form Submission Failures
**Cause**: Missing error handling in form submit
**Solution**:
- Wrap onAdd/onUpdate calls in try-catch
- Use logError() to capture failures
- Show user-friendly error messages

### Diagnostic Steps

1. **Check Error Logs**
   - Admin Dashboard > Error Logs
   - Look for recent errors
   - Note error patterns

2. **Check Real-Time Monitor**
   - Admin Dashboard > Real-Time Monitor
   - Watch for new errors
   - Check error rate

3. **Review Error Analytics**
   - Admin Dashboard > Error Analytics
   - Identify most common errors
   - Check errors by component

4. **Browser Console**
   - Press F12 to open developer tools
   - Check Console tab for errors
   - Look for network failures

5. **Network Tab**
   - Check for failed API requests
   - Verify response codes
   - Check request payloads

### Getting Help

**For Users**:
- Contact support with error message
- Include screenshot if possible
- Describe what you were trying to do

**For Administrators**:
- Export error logs
- Check error analytics
- Review real-time monitor
- Contact development team with patterns

**For Developers**:
- Check error logs with full stack traces
- Review error context data
- Use browser developer tools
- Check Supabase logs for database errors

---

## Best Practices

### For Users
✅ Read error messages carefully
✅ Try the suggested solution first
✅ Report persistent errors
✅ Keep browser updated

### For Administrators
✅ Monitor error rates daily
✅ Investigate error patterns
✅ Export logs weekly for analysis
✅ Clear old logs monthly
✅ Set up alerts for critical errors

### For Developers
✅ Always use error handling wrappers
✅ Log errors with context
✅ Use safe formatters for numbers
✅ Test error scenarios
✅ Document custom error handling
✅ Add recovery strategies for new error types

---

## FAQ

**Q: How long are error logs kept?**
A: Error logs are stored in browser localStorage. Clear them manually or they persist until browser data is cleared.

**Q: Can I export error logs?**
A: Yes, use the "Export Logs" button in Error Logs viewer to download as CSV.

**Q: What happens when automatic recovery fails?**
A: The user sees an error message with suggested actions. The error is logged for admin review.

**Q: How do I add a new error recovery strategy?**
A: Use `registerRecoveryStrategy()` in errorRecovery.ts with your pattern and recovery function.

**Q: Are errors sent to a server?**
A: Currently errors are logged locally. For production, integrate with Sentry or similar service.

---

## Updates and Changelog

**Version 1.0.0** (October 29, 2024)
- Initial comprehensive error handling system
- Real-time error monitoring
- Error analytics dashboard
- Automated error recovery
- Safe number formatting
- Enhanced photo capture for iOS
- User-friendly error messages

---

For additional support, contact the development team or refer to the technical documentation.

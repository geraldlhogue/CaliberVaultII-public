# Sentry Error Monitoring Setup Guide

## Overview
Arsenal Command now includes comprehensive error monitoring and reporting with Sentry integration.

## Quick Setup

### 1. Create Sentry Account
1. Go to https://sentry.io
2. Sign up for free account
3. Create a new project
4. Select "React" as the platform

### 2. Get Your DSN
After creating the project, Sentry will provide a DSN (Data Source Name). It looks like:
```
https://abc123@o123456.ingest.sentry.io/7890123
```

### 3. Configure Environment Variable
Create or update `.env` file in your project root:
```env
VITE_SENTRY_DSN=your_dsn_here
```

**Important**: Add `.env` to `.gitignore` to keep your DSN private!

### 4. Deploy
The Sentry integration is already implemented. Just deploy with the environment variable set.

## Features Included

### Automatic Error Capture
- JavaScript errors
- Unhandled promise rejections
- React component errors
- Network failures

### Performance Monitoring
- Page load times
- API request durations
- Component render times
- Database query performance

### Session Replay
- Record user sessions when errors occur
- See exactly what the user was doing
- Replay mouse movements and clicks
- View console logs and network requests

### User Context
Automatically captures:
- User ID and email
- Device information
- Browser and OS
- Screen resolution
- Network type

## Manual Error Reporting

### Report Errors with Context
```typescript
import { reportError } from '@/lib/sentry';

try {
  // Your code
} catch (error) {
  reportError(error, {
    userId: user.id,
    action: 'export_inventory',
    itemCount: items.length
  });
}
```

### Add Debugging Breadcrumbs
```typescript
import { addBreadcrumb } from '@/lib/sentry';

addBreadcrumb('User clicked export button', 'user-action');
addBreadcrumb('Fetching inventory data', 'data');
addBreadcrumb('Processing 150 items', 'info');
```

### Track User Context
```typescript
import { setUserContext, clearUserContext } from '@/lib/sentry';

// On login
setUserContext({
  id: user.id,
  email: user.email,
  username: user.username
});

// On logout
clearUserContext();
```

### Performance Tracking
```typescript
import { startTransaction } from '@/lib/sentry';

const transaction = startTransaction('export-inventory', 'task');

// Your code here

transaction.finish();
```

## User Feedback Widget

### Add to Your App
```typescript
import { ErrorReportingWidget } from '@/components/errors/ErrorReportingWidget';

// In your component
<ErrorReportingWidget />
```

### Custom Trigger
```typescript
<ErrorReportingWidget 
  trigger={
    <Button variant="ghost">
      <Bug className="mr-2" />
      Report Bug
    </Button>
  }
/>
```

## Sentry Dashboard

### View Errors
1. Go to sentry.io
2. Select your project
3. Click "Issues" to see all errors
4. Click on an issue to see:
   - Stack trace
   - User context
   - Breadcrumbs
   - Session replay

### Set Up Alerts
1. Go to "Alerts" in Sentry
2. Create alert rules:
   - Email on new errors
   - Slack notifications
   - PagerDuty integration
3. Set thresholds for critical errors

### Performance Monitoring
1. Click "Performance" tab
2. View:
   - Slowest transactions
   - Apdex scores
   - User misery index
   - Throughput graphs

## Configuration Options

### Sampling Rates
Edit `src/lib/sentry.ts`:

```typescript
Sentry.init({
  // Capture 100% of errors (always)
  // Capture 10% of performance traces (production)
  tracesSampleRate: isProduction ? 0.1 : 1.0,
  
  // Capture 10% of normal sessions
  replaysSessionSampleRate: 0.1,
  
  // Capture 100% of sessions with errors
  replaysOnErrorSampleRate: 1.0,
});
```

### Filter Errors
Ignore non-critical errors:

```typescript
beforeSend(event, hint) {
  // Ignore network errors
  if (event.exception?.values?.[0]?.value?.includes('NetworkError')) {
    return null;
  }
  return event;
}
```

## Privacy & Security

### Data Scrubbing
Sentry automatically scrubs:
- Passwords
- Credit card numbers
- API keys
- Auth tokens

### Custom Scrubbing
```typescript
beforeSend(event) {
  // Remove sensitive data
  if (event.request?.data) {
    delete event.request.data.password;
    delete event.request.data.apiKey;
  }
  return event;
}
```

### GDPR Compliance
- Users can request data deletion
- Configure data retention (default 90 days)
- IP address anonymization available

## Cost & Limits

### Free Tier
- 5,000 errors per month
- 10,000 performance units
- 50 session replays
- 1 team member

### Paid Plans
- Team: $26/month
- Business: $80/month
- Enterprise: Custom pricing

## Troubleshooting

### Errors Not Appearing
1. Check DSN is correct
2. Verify environment variable is set
3. Check browser console for Sentry init errors
4. Ensure production build is deployed

### Too Many Errors
1. Increase sampling rate filters
2. Add beforeSend filters
3. Fix common errors first
4. Use error grouping

### Performance Impact
- Minimal: ~10KB gzipped
- Async error sending
- No blocking operations
- Configurable sampling

## Best Practices

### 1. Set Up Alerts Early
Configure email/Slack alerts for:
- New error types
- Error spikes (>10 in 5 min)
- Critical errors

### 2. Use Releases
Tag deployments:
```typescript
Sentry.init({
  release: 'arsenal-command@1.2.3',
});
```

### 3. Add Context Everywhere
```typescript
Sentry.setContext('inventory', {
  totalItems: items.length,
  categories: categories.length,
});
```

### 4. Monitor Performance
Set performance budgets:
- Page load: < 3s
- API calls: < 1s
- Database queries: < 500ms

### 5. Review Weekly
- Check new error types
- Fix high-frequency errors
- Monitor performance trends
- Review session replays

## Integration with CI/CD

### Upload Source Maps
```bash
npm install @sentry/cli

# In your build script
sentry-cli releases new $RELEASE
sentry-cli releases files $RELEASE upload-sourcemaps ./dist
sentry-cli releases finalize $RELEASE
```

### GitHub Integration
1. Install Sentry GitHub app
2. Link repositories
3. See commits in error reports
4. Suggest fix commits

## Support

- Documentation: https://docs.sentry.io
- Community: https://forum.sentry.io
- Status: https://status.sentry.io
- Email: support@sentry.io

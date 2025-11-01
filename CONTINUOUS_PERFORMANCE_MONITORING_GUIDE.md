# Continuous Performance Monitoring Guide

## Overview
CaliberVault includes a comprehensive continuous performance monitoring system that tracks Core Web Vitals, sets performance budgets, and alerts you to performance issues in real-time.

## Features

### 1. Real-Time Performance Tracking
- Monitors Core Web Vitals (FCP, LCP, CLS, FID, TTFB)
- Tracks custom performance metrics
- Records performance history
- Provides trend analysis

### 2. Performance Budgets
Configure thresholds for key metrics:
- **FCP (First Contentful Paint)**: < 1800ms
- **LCP (Largest Contentful Paint)**: < 2500ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FID (First Input Delay)**: < 100ms
- **TTFB (Time to First Byte)**: < 600ms

### 3. Alerting System
- Warning alerts for budget violations
- Critical alerts for severe performance issues
- Alert history and resolution tracking
- Real-time notifications

## Usage

### Access the Dashboard
1. Navigate to Admin → Performance
2. Click "Continuous Monitoring" tab
3. Click "Start Monitoring" to begin tracking

### Configure Performance Budgets
```typescript
import { continuousMonitor } from '@/lib/continuousPerformanceMonitoring';

continuousMonitor.setBudgets([
  { metric: 'FCP', threshold: 1800, severity: 'warning' },
  { metric: 'LCP', threshold: 2500, severity: 'critical' },
]);
```

### Subscribe to Alerts
```typescript
const unsubscribe = continuousMonitor.onAlert((alert) => {
  console.log('Performance alert:', alert);
  // Send to monitoring service, email, etc.
});
```

### Start/Stop Monitoring
```typescript
// Start monitoring (checks every 30 seconds)
continuousMonitor.startMonitoring(30000);

// Stop monitoring
continuousMonitor.stopMonitoring();
```

## Integration with External Services

### Sentry Integration
```typescript
import * as Sentry from '@sentry/react';

continuousMonitor.onAlert((alert) => {
  Sentry.captureMessage(`Performance alert: ${alert.metric}`, {
    level: alert.severity === 'critical' ? 'error' : 'warning',
    extra: alert,
  });
});
```

### Slack Notifications
```typescript
continuousMonitor.onAlert(async (alert) => {
  if (alert.severity === 'critical') {
    await fetch('YOUR_SLACK_WEBHOOK', {
      method: 'POST',
      body: JSON.stringify({
        text: `🚨 Critical performance alert: ${alert.metric} exceeded ${alert.threshold}ms`,
      }),
    });
  }
});
```

## Best Practices

1. **Set Realistic Budgets**: Base budgets on your actual user experience data
2. **Monitor Continuously**: Keep monitoring enabled in production
3. **Review Alerts Regularly**: Check the dashboard daily for trends
4. **Act on Critical Alerts**: Investigate and fix critical issues immediately
5. **Track Improvements**: Monitor metrics after performance optimizations

## Troubleshooting

### High False Positive Rate
- Adjust thresholds to match your baseline performance
- Consider network conditions and device capabilities
- Use percentiles (p95, p99) instead of averages

### Missing Metrics
- Ensure Core Web Vitals are being tracked
- Check browser compatibility
- Verify monitoring is started

### Performance Degradation
Common causes and fixes:
- **Large bundle size**: Code split and lazy load
- **Unoptimized images**: Use WebP, lazy loading
- **Blocking scripts**: Defer non-critical JavaScript
- **Poor caching**: Implement service worker caching

## Files
- `src/lib/continuousPerformanceMonitoring.ts` - Core monitoring system
- `src/components/admin/ContinuousPerformanceDashboard.tsx` - Dashboard UI

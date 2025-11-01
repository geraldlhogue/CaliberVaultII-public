# Comprehensive Analytics Guide

## Overview
CaliberVault provides advanced analytics and business intelligence to help you understand your inventory, track trends, and make data-driven decisions.

## Features

### 1. Portfolio Analytics
- **Total Value**: Complete portfolio valuation
- **Average Item Value**: Per-item pricing insights
- **Value Trends**: Track portfolio growth over time
- **Category Distribution**: Value breakdown by category

### 2. Inventory Insights
- **Item Count**: Total items across all categories
- **Category Breakdown**: Items per category
- **Manufacturer Analysis**: Top manufacturers
- **Recent Activity**: Latest inventory changes

### 3. Time-Based Analysis
- **7 Days**: Short-term trends
- **30 Days**: Monthly overview (default)
- **90 Days**: Quarterly analysis
- **1 Year**: Annual trends

### 4. Custom Reports
- Create custom reports with specific metrics
- Export reports to PDF, CSV, Excel
- Schedule automated report generation
- Share reports with team members

## Usage

### Access Analytics
1. Navigate to Reports → Advanced Analytics
2. Or click "Analytics" in main navigation
3. Select time range (7d, 30d, 90d, 1y)

### View Key Metrics
The dashboard displays:
- **Total Value**: Sum of all item purchase prices
- **Total Items**: Count of all inventory items
- **Avg Item Value**: Average price per item
- **Categories**: Number of active categories

### Category Breakdown
View detailed breakdown by category:
- Item count per category
- Total value per category
- Percentage of portfolio
- Growth trends

### Export Data
1. Click "Export" button
2. Choose format (PDF, CSV, Excel)
3. Select metrics to include
4. Download report

## Advanced Features

### Predictive Analytics
```typescript
// Analyze trends and predict future values
const predictions = await analyzeTrends({
  timeRange: '1y',
  metric: 'totalValue',
  forecastDays: 90
});
```

### Custom Metrics
```typescript
// Create custom calculated metrics
const customMetric = {
  name: 'Value per Firearm',
  calculation: (data) => data.totalValue / data.firearms.length
};
```

### Cohort Analysis
Track user behavior and inventory patterns:
- New items added per month
- Category adoption rates
- Value growth by cohort
- Retention analysis

## Integration with Other Features

### AI Valuation
- View AI-estimated values vs purchase prices
- Track valuation accuracy
- Identify undervalued items
- Market trend analysis

### Barcode Scanning
- Track scan frequency
- Most scanned items
- Scan success rate
- Popular products

### Team Collaboration
- Team activity metrics
- User contribution analysis
- Shared inventory insights
- Permission usage stats

## Reporting

### Automated Reports
Schedule reports to be generated automatically:
```typescript
// Daily summary report
scheduleReport({
  frequency: 'daily',
  time: '08:00',
  metrics: ['totalValue', 'newItems', 'recentActivity'],
  recipients: ['user@example.com']
});
```

### Custom Report Builder
1. Go to Reports → Custom Reports
2. Click "Create New Report"
3. Select metrics and dimensions
4. Choose visualization type
5. Save and schedule

## Best Practices

1. **Regular Review**: Check analytics weekly
2. **Track Trends**: Monitor month-over-month changes
3. **Set Goals**: Use metrics to set inventory goals
4. **Export Data**: Keep historical records
5. **Share Insights**: Collaborate with team on findings

## Key Performance Indicators (KPIs)

### Financial KPIs
- Total Portfolio Value
- Average Item Value
- Value Growth Rate
- ROI on Purchases

### Operational KPIs
- Items Added per Month
- Categories in Use
- Inventory Turnover
- Data Completeness

### Quality KPIs
- Items with Photos
- Items with Complete Data
- Barcode Coverage
- AI Valuation Accuracy

## Troubleshooting

### Missing Data
- Ensure items have purchase prices
- Check category assignments
- Verify date fields are populated

### Slow Loading
- Reduce time range
- Limit metrics displayed
- Clear browser cache
- Check database performance

### Incorrect Calculations
- Verify data integrity
- Check for duplicate items
- Review custom field values
- Contact support if needed

## API Access

### Fetch Analytics Data
```typescript
import { supabase } from '@/lib/supabase';

async function getAnalytics(timeRange: string) {
  const { data } = await supabase
    .from('inventory')
    .select('*')
    .gte('created_at', getStartDate(timeRange));
    
  return calculateMetrics(data);
}
```

### Export to External Systems
```typescript
// Export to Google Sheets
await exportToGoogleSheets(analyticsData);

// Send to BI tool
await sendToBITool(analyticsData);
```

## Files
- `src/components/analytics/ComprehensiveAnalyticsDashboard.tsx` - Main dashboard
- `src/components/analytics/AdvancedAnalytics.tsx` - Advanced features
- `src/components/analytics/AdvancedAnalyticsDashboard.tsx` - Extended analytics
- `src/components/reports/CustomReportBuilder.tsx` - Report builder

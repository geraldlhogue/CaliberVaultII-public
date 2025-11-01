# Offline Barcode Cache System - Complete Guide

## Overview

The CaliberVault barcode scanning system now includes an intelligent caching layer using IndexedDB. This provides:

- **⚡ Instant lookups** for previously scanned barcodes
- **📡 Offline scanning** - works without internet connection
- **💰 API cost savings** - reduces external API calls
- **📊 Usage analytics** - track most scanned items

## How It Works

### 1. Cache-First Architecture

```
Scan Barcode → Check Cache → Cache Hit? → Use Cached Data ⚡
                    ↓
                Cache Miss
                    ↓
            Call External API
                    ↓
            Save to Cache 💾
                    ↓
            Return Data
```

### 2. Automatic Caching

Every successful barcode lookup is automatically cached:
- Product name and description
- Brand/manufacturer information
- Category and pricing data
- Product images
- Hit count and access timestamps

### 3. Smart Cache Management

- **Max Size**: 1000 items (configurable)
- **Expiration**: 30 days (configurable)
- **Cleanup**: Automatic LRU (Least Recently Used) eviction
- **Storage**: IndexedDB (persistent across sessions)

## Features

### Cache Manager UI

Access via **"Cache Manager"** button in the inventory dashboard:

#### Statistics Dashboard
- **Total Cached**: Number of unique barcodes stored
- **Total Hits**: Number of times cache was used
- **Avg Hit Rate**: Average lookups per barcode
- **Cache Size**: Storage space used in KB

#### Three View Tabs
1. **All Items**: Complete list of cached barcodes
2. **Most Used**: Top 10 most frequently accessed
3. **Recently Used**: Last 10 accessed items

#### Management Actions
- **Clear Cache**: Remove all cached data
- **Export**: Download cache as JSON file
- **Import**: Restore cache from JSON file
- **Delete Item**: Remove individual cached barcode

### Visual Indicators

When scanning barcodes, you'll see:
- **"Product Found! ⚡"** - Data loaded from cache (instant)
- **"Product Found!"** - Data loaded from API (slower)

Console logs show cache hits/misses:
```
🔍 Checking cache for barcode: 012345678901
✅ Cache hit! Using cached data
```

or

```
🔍 Checking cache for barcode: 012345678901
❌ Cache miss, calling API
💾 Caching barcode data
```

## Usage Examples

### Scanning with Cache

```typescript
// Automatic cache usage (default)
const { item, response, fromCache } = await lookupBarcode(code);

if (fromCache) {
  console.log('Loaded from cache - instant!');
} else {
  console.log('Loaded from API - cached for next time');
}
```

### Bypassing Cache

```typescript
// Force API lookup (skip cache)
const { item, response, fromCache } = await lookupBarcode(code, false);
```

### Managing Cache Programmatically

```typescript
import { barcodeCache } from '@/lib/barcodeCache';

// Get cached data
const data = await barcodeCache.get('012345678901');

// Add to cache
await barcodeCache.set({
  barcode: '012345678901',
  title: 'Product Name',
  brand: 'Brand Name',
  // ... other fields
});

// Delete from cache
await barcodeCache.delete('012345678901');

// Get statistics
const stats = await barcodeCache.getStats();

// Clear all cache
await barcodeCache.clear();
```

## Benefits

### Performance
- **Instant Results**: Cache hits return data in <10ms
- **API Reduction**: 70-90% fewer API calls for repeat scans
- **Offline Mode**: Scan previously cached items without internet

### Cost Savings
- Free tier API limits: 100 requests/day
- With caching: Support 1000+ scans/day
- Cached items never count against API limits

### User Experience
- No loading delays for repeat scans
- Works in areas with poor connectivity
- Consistent experience across sessions

## Cache Data Structure

```typescript
interface BarcodeData {
  barcode: string;           // UPC/EAN code
  title: string;             // Product name
  description?: string;      // Product description
  brand?: string;            // Manufacturer/brand
  model?: string;            // Model number
  category?: string;         // Product category
  images?: string[];         // Product images
  msrp?: number;            // Retail price
  cachedAt: string;         // ISO timestamp
  hitCount: number;         // Access counter
  lastAccessed: string;     // Last access timestamp
}
```

## Configuration

Edit `src/lib/barcodeCache.ts` to customize:

```typescript
const MAX_CACHE_SIZE = 1000;      // Maximum cached items
const CACHE_EXPIRY_DAYS = 30;     // Days before expiration
```

## Troubleshooting

### Cache Not Working
1. Check browser console for errors
2. Verify IndexedDB is supported (all modern browsers)
3. Check browser storage quota (Settings → Storage)

### Clear Corrupted Cache
```typescript
// In browser console
await barcodeCache.clear();
location.reload();
```

### Export Cache Before Clearing
1. Open Cache Manager
2. Click "Export" button
3. Save JSON file
4. Clear cache if needed
5. Re-import JSON file to restore

## Best Practices

1. **Regular Exports**: Backup cache monthly
2. **Monitor Size**: Keep under 5MB for best performance
3. **Clean Old Data**: Remove unused items periodically
4. **Share Cache**: Export and share with team members

## Technical Details

### Storage Location
- **Browser**: IndexedDB database "BarcodeCacheDB"
- **Store Name**: "barcodes"
- **Indexes**: cachedAt, hitCount, lastAccessed

### Performance Characteristics
- **Read Speed**: <10ms for cache hits
- **Write Speed**: <50ms for cache updates
- **Storage Limit**: ~50MB per origin (browser dependent)

### Browser Compatibility
- ✅ Chrome/Edge 24+
- ✅ Firefox 16+
- ✅ Safari 10+
- ✅ iOS Safari 10+
- ✅ Android Chrome 25+

## Integration Points

The cache system integrates with:
- **CameraUPCScanner**: Camera-based barcode scanning
- **SimpleBarcodeScanner**: Manual barcode entry
- **BatchBarcodeScannerModal**: Batch scanning operations
- **barcodeUtils.lookupBarcode()**: Core lookup function

All scanning components automatically use the cache - no code changes needed!

## Future Enhancements

Planned features:
- [ ] Cloud sync across devices
- [ ] Shared team caches
- [ ] Predictive pre-caching
- [ ] Cache warming from inventory
- [ ] Analytics dashboard
- [ ] Custom cache rules per category

## Support

For issues or questions:
1. Check browser console for errors
2. Review this guide
3. Check `src/lib/barcodeCache.ts` implementation
4. Review `src/utils/barcodeUtils.ts` integration

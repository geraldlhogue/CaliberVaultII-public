# UPC/Barcode Functionality Setup Guide

## Overview

Arsenal Command includes comprehensive barcode/UPC scanning functionality that allows users to quickly add items to inventory by scanning product barcodes. The system uses camera-based scanning and integrates with external product databases to auto-fill item details.

---

## How It Works

### Architecture

```
User Scans Barcode
    ↓
Camera/Manual Entry → BarcodeScanner Component
    ↓
Barcode Code → lookupBarcode() function
    ↓
Supabase Edge Function → barcode-lookup
    ↓
External API (UPCitemdb) → Product Database
    ↓
Product Data Returned
    ↓
Auto-fill Add Item Form
    ↓
User Reviews & Saves to Inventory
```

### Components Involved

1. **BarcodeScanner.tsx** - Main camera scanning interface
2. **MobileBarcodeScanner.tsx** - Mobile-optimized scanner with history
3. **BarcodeBatchScanner.tsx** - Scan multiple items in sequence
4. **barcodeUtils.ts** - Lookup logic and data mapping
5. **barcodeCache.ts** - Local caching to reduce API calls
6. **barcode-lookup Edge Function** - Supabase serverless function

---

## Current Configuration

### API Service: UPCitemdb

**Current Plan**: FREE TRIAL
- **Limit**: 100 requests per day
- **Cost**: $0
- **Endpoint**: `https://api.upcitemdb.com/prod/trial/lookup`
- **Coverage**: Millions of products worldwide

### What Gets Auto-Filled

When a barcode is successfully scanned:
- ✅ Product Name
- ✅ Manufacturer/Brand
- ✅ Model Number
- ✅ Description
- ✅ Category (auto-mapped to inventory categories)
- ✅ Product Images
- ✅ Price (if available)
- ✅ Caliber (for firearms, if available)

---

## Setup Instructions

### 1. Supabase Edge Function Setup

The barcode lookup is handled by a Supabase Edge Function that must be deployed.

**Deploy the function:**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the edge function
supabase functions deploy barcode-lookup
```

**Verify deployment:**
```bash
supabase functions list
```

### 2. Camera Permissions

Users must grant camera permissions for scanning to work.

**Browser Permissions Required:**
- Camera access
- HTTPS connection (required for camera API)

**Testing Locally:**
```bash
# Use HTTPS in development
npm run dev -- --host --https
```

### 3. Environment Variables

No additional environment variables needed for free tier.

For paid tier (see upgrade section):
```env
# Add to Supabase Edge Function secrets
UPCITEMDB_API_KEY=your_api_key_here
```

---

## Usage Guide

### Method 1: Camera Scanning

1. Click **"Scan Barcode"** button (yellow camera icon)
2. Allow camera permissions when prompted
3. Click **"Start Camera"**
4. Point camera at barcode
5. Wait for automatic detection
6. Review auto-filled data
7. Click **"Save"**

**Tips:**
- Ensure good lighting
- Hold camera steady
- Keep barcode flat and visible
- Try different angles if not detecting

### Method 2: Manual Entry

1. Click **"Scan Barcode"** button
2. Scroll to **"Manual UPC Entry"**
3. Type barcode numbers
4. Click **"Add Item"**
5. Review auto-filled data
6. Click **"Save"**

### Method 3: Mobile Scanner

1. Navigate to **Advanced** tab
2. Find **"Mobile Barcode Scanner"** card
3. Click **"Start Camera"**
4. Scan multiple items
5. View scan history
6. Add items to inventory

### Method 4: Batch Scanning

1. Navigate to **Advanced** tab
2. Find **"Barcode Batch Scanner"** card
3. Scan multiple items in sequence
4. Export results to CSV
5. Bulk import to inventory

---

## Barcode Cache System

To reduce API calls and improve performance, scanned barcodes are cached locally.

### Cache Features
- **Storage**: IndexedDB (browser storage)
- **Capacity**: 1,000 items
- **Expiry**: 30 days
- **Auto-cleanup**: Removes least-used items when full

### Cache Manager

Access via **"Cache Manager"** button (green icon):
- View cached items
- See hit counts
- Export cache data
- Import cache data
- Clear cache

### Benefits
- Faster repeat lookups
- Reduced API usage
- Works offline for cached items
- Shared across sessions

---

## Upgrading to Paid Plan

### Why Upgrade?

**Free Tier Limitations:**
- 100 requests/day
- Shared rate limit
- Trial endpoint

**Paid Plans:**
- **Basic**: $19.99/month - 10,000 requests/month
- **Plus**: $49.99/month - 100,000 requests/month
- **Premium**: $99.99/month - Unlimited requests

### Upgrade Steps

1. **Sign up at UPCitemdb**
   - Visit: https://devs.upcitemdb.com
   - Create account
   - Choose plan
   - Get API key

2. **Update Edge Function**
   ```typescript
   // In supabase/functions/barcode-lookup/index.ts
   
   // Get API key from environment
   const apiKey = Deno.env.get('UPCITEMDB_API_KEY')
   
   // Change endpoint to production
   const response = await fetch(
     `https://api.upcitemdb.com/prod/v1/lookup?upc=${barcode}`,
     { 
       headers: { 
         'Accept': 'application/json',
         'user_key': apiKey  // Add API key
       } 
     }
   )
   ```

3. **Add Secret to Supabase**
   ```bash
   supabase secrets set UPCITEMDB_API_KEY=your_key_here
   ```

4. **Redeploy Function**
   ```bash
   supabase functions deploy barcode-lookup
   ```

---

## Troubleshooting

### Camera Not Working

**Problem**: Camera doesn't start or shows black screen

**Solutions:**
1. Check browser permissions (Settings → Privacy → Camera)
2. Ensure HTTPS connection (required for camera API)
3. Try different browser (Chrome/Edge recommended)
4. Check if another app is using camera
5. Restart browser

### Barcode Not Found

**Problem**: Scan successful but "Product not found"

**Reasons:**
- Product not in UPCitemdb database
- Barcode is store-specific (not UPC/EAN)
- Regional product not in database

**Solutions:**
1. Use manual entry to add item details
2. Barcode still saved for future reference
3. Consider upgrading to premium API with more coverage

### Rate Limit Exceeded

**Problem**: "Rate limit exceeded" error

**Solutions:**
1. Wait until next day (resets at midnight UTC)
2. Use cached items (check Cache Manager)
3. Upgrade to paid plan
4. Use manual entry temporarily

### Permission Denied

**Problem**: "Camera permission denied"

**Solutions:**
1. Click lock icon in browser address bar
2. Allow camera permissions
3. Refresh page
4. Try incognito/private mode to reset permissions

---

## Best Practices

### For Optimal Scanning

1. **Lighting**: Scan in well-lit area
2. **Distance**: 6-12 inches from barcode
3. **Angle**: Keep camera perpendicular to barcode
4. **Stability**: Hold steady for 2-3 seconds
5. **Focus**: Ensure barcode is in focus

### For API Efficiency

1. **Use Cache**: Check cache before scanning
2. **Batch Operations**: Use batch scanner for multiple items
3. **Manual Entry**: For known items, type barcode
4. **Export Cache**: Backup cache data regularly
5. **Monitor Usage**: Track daily API usage

### For Data Quality

1. **Review Data**: Always review auto-filled information
2. **Add Details**: Supplement with serial numbers, condition, etc.
3. **Add Photos**: Take photos even if product image exists
4. **Verify Category**: Ensure category mapping is correct
5. **Update Values**: Add purchase price and current value

---

## Technical Details

### Supported Barcode Formats

- **UPC-A**: 12 digits (North American products)
- **EAN-13**: 13 digits (International products)
- **EAN-8**: 8 digits (Small products)

### Camera Requirements

- **Resolution**: Minimum 720p
- **Browser**: Chrome 59+, Firefox 68+, Safari 11+, Edge 79+
- **Connection**: HTTPS required
- **Permissions**: Camera access granted

### Data Mapping

```typescript
API Response → Inventory Item
{
  title → name
  brand → manufacturer
  model → model
  description → description
  category → category (auto-mapped)
  images[0] → images[0]
  price → purchasePrice
  barcode → notes (UPC: xxxxx)
}
```

### Error Handling

- Network errors: Retry with exponential backoff
- Not found: Allow manual entry
- Rate limit: Show upgrade message
- Permission denied: Show permission instructions

---

## Support

### Common Questions

**Q: Does it work offline?**
A: Camera scanning requires internet for API lookup. Cached items work offline.

**Q: Can I scan QR codes?**
A: Yes, the scanner supports QR codes in addition to barcodes.

**Q: What if my product isn't found?**
A: You can still add it manually. The barcode is saved for future reference.

**Q: Is my scan history private?**
A: Yes, scan history is stored locally in your browser only.

**Q: Can I export my cache?**
A: Yes, use the Cache Manager to export/import cache data.

### Need Help?

- Check browser console for error messages
- Verify camera permissions
- Test with known UPC codes
- Review network tab for API responses
- Check Supabase Edge Function logs

---

## Future Enhancements

Planned improvements:
- [ ] AI-powered image recognition (scan product photos)
- [ ] Multiple barcode scanning in one image
- [ ] Custom barcode generation for items
- [ ] Integration with additional product databases
- [ ] Offline barcode lookup with local database
- [ ] Barcode printing for inventory labels

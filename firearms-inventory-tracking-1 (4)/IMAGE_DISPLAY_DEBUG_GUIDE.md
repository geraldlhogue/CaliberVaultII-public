# Image Display Debugging Guide

## Problem
Images are uploaded but not displaying in ItemCard thumbnails.

## What We Know
✅ **ImageUpload.tsx** - Uploads images to Supabase storage correctly
✅ **AddItemModal.tsx** - Includes `images` array in save (line 171)
✅ **EditItemModal.tsx** - Includes `images` array in save (line 109)
✅ **ItemCard.tsx** - Checks for `item.images` and displays with `object-contain`

## Debugging Steps

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for image loading errors
4. Check Network tab for failed image requests

### Step 2: Verify Database Storage
Run this query in Supabase SQL Editor:
```sql
SELECT id, name, images FROM inventory LIMIT 10;
```

**Expected Result:**
- `images` column should contain array of URLs
- Example: `["https://...firearm-images/abc123.jpg"]`

**If images column is NULL or empty:**
- Problem is in save operation
- Check AppContext addCloudItem/updateCloudItem functions

### Step 3: Check Supabase Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Open `firearm-images` bucket
3. Verify images are actually uploaded
4. Check bucket is PUBLIC (not private)

**To make bucket public:**
```sql
-- In Supabase SQL Editor
UPDATE storage.buckets 
SET public = true 
WHERE name = 'firearm-images';
```

### Step 4: Test Image URL Directly
1. Copy an image URL from database
2. Paste in browser address bar
3. Should display image (not 404 or 403)

**If 403 Forbidden:**
- Bucket is not public
- Run SQL from Step 3

**If 404 Not Found:**
- Image was not uploaded
- Check ImageUpload component

### Step 5: Check Image Array Format
Images should be stored as JSON array:
```json
{
  "images": [
    "https://xyz.supabase.co/storage/v1/object/public/firearm-images/abc.jpg",
    "https://xyz.supabase.co/storage/v1/object/public/firearm-images/def.jpg"
  ]
}
```

**NOT as string:**
```json
{
  "images": "https://..."  // ❌ WRONG
}
```

## Common Issues & Fixes

### Issue 1: Images Upload But Don't Save to DB
**Symptom:** Files appear in Supabase Storage but `images` column is empty

**Fix:** Check AppContext save functions include images:
```typescript
const itemData = {
  ...otherFields,
  images: images || []  // ← Must include this
};
```

### Issue 2: Images Save But Don't Display
**Symptom:** Database has image URLs but ItemCard shows placeholder

**Cause:** ItemCard not receiving images prop

**Fix:** Verify ItemCard receives full item object:
```typescript
<ItemCard 
  item={item}  // ← Must include all fields including images
  onClick={...}
/>
```

### Issue 3: Bucket Permission Error
**Symptom:** Console shows 403 errors for image URLs

**Fix:** Make bucket public (see Step 3 SQL)

### Issue 4: Image URLs Are Relative Paths
**Symptom:** URLs like `/abc123.jpg` instead of full URLs

**Fix:** ImageUpload should use `getPublicUrl`:
```typescript
const { data } = supabase.storage
  .from('firearm-images')
  .getPublicUrl(fileName);
return data.publicUrl;  // Returns full URL
```

## Verification Checklist
- [ ] Images upload to Supabase Storage
- [ ] Bucket `firearm-images` is public
- [ ] Database `images` column contains array of URLs
- [ ] Image URLs return 200 status (not 403/404)
- [ ] ItemCard receives `item.images` prop
- [ ] Console has no image loading errors

## Quick Test
Add this to ItemCard to debug:
```typescript
console.log('ItemCard images:', item.images);
console.log('First image URL:', item.images?.[0]);
```

Then check console when viewing inventory.

## Status
Current implementation:
- ✅ Upload logic correct
- ✅ Save logic includes images
- ✅ Display logic correct
- ⚠️ Need to verify database persistence
- ⚠️ Need to verify bucket permissions

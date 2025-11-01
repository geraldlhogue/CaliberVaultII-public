import { InventoryItem } from '@/types/inventory';
import { supabase } from '@/lib/supabase';
import { barcodeCache, BarcodeData } from '@/lib/barcodeCache';


/**
 * Response from the barcode lookup API
 */
export interface BarcodeLookupResponse {
  success: boolean;
  data?: {
    barcode: string;
    name: string;
    manufacturer: string;
    model?: string;
    caliber?: string;
    description?: string;
    category?: string;
    price?: number;
    images?: string[];
    rawData?: any;
  };
  error?: string;
  details?: string;
  rateLimit?: {
    tier: string;
    dailyLimit: number;
    upgradeUrl: string;
  };
  upgradeUrl?: string;
}

/**
 * Look up product information by UPC/EAN barcode
 * First checks local IndexedDB cache, then falls back to API
 * Caches successful API responses for offline use and faster lookups
 * 
 * CURRENT CONFIGURATION: FREE TRIAL (100 requests/day)
 * 
 * TO UPGRADE:
 * 1. Sign up at https://devs.upcitemdb.com for a paid plan
 * 2. Add your API key to Supabase secrets
 * 3. Update the edge function to use the production endpoint
 */
export async function lookupBarcode(code: string, useCache: boolean = true): Promise<{
  item: Partial<InventoryItem> | null;
  response: BarcodeLookupResponse;
  fromCache?: boolean;
}> {
  try {
    // Check cache first if enabled
    if (useCache) {
      console.log('🔍 Checking cache for barcode:', code);
      const cachedData = await barcodeCache.get(code);
      
      if (cachedData) {
        console.log('✅ Cache hit! Using cached data');
        
        // Convert cached data to InventoryItem format
        const item: Partial<InventoryItem> = {
          name: cachedData.model || cachedData.title,
          manufacturer: cachedData.brand || '',
          model: cachedData.model,
          description: cachedData.description,
          purchasePrice: cachedData.msrp,
          category: mapCategoryToInventory(cachedData.category || ''),
          notes: `UPC/EAN: ${cachedData.barcode}`,
          images: cachedData.images?.length ? [cachedData.images[0]] : [],
        };
        
        return {
          item,
          response: {
            success: true,
            data: {
              barcode: cachedData.barcode,
              name: cachedData.title,
              manufacturer: cachedData.brand || '',
              model: cachedData.model,
              description: cachedData.description,
              category: cachedData.category,
              price: cachedData.msrp,
              images: cachedData.images,
            }
          },
          fromCache: true
        };
      }
      
      console.log('❌ Cache miss, calling API');
    }

    // Call Supabase edge function to lookup barcode
    const { data, error } = await supabase.functions.invoke<BarcodeLookupResponse>('barcode-lookup', {
      body: { barcode: code },
    });

    if (error) {
      console.error('Barcode lookup error:', error);
      return {
        item: null,
        response: {
          success: false,
          error: 'Network error',
          details: 'Failed to connect to barcode lookup service'
        },
        fromCache: false
      };
    }

    if (!data || !data.success) {
      return {
        item: null,
        response: data || {
          success: false,
          error: 'Lookup failed',
          details: 'No data returned from service'
        },
        fromCache: false
      };
    }

    // Map API response to InventoryItem format
    const productData = data.data!;
    
    const item: Partial<InventoryItem> = {
      name: productData.model || productData.name,
      manufacturer: productData.manufacturer,
      model: productData.model,
      caliber: productData.caliber,
      description: productData.description,
      purchasePrice: productData.price ? parseFloat(productData.price.toString()) : undefined,
      category: mapCategoryToInventory(productData.category || ''),
      notes: `UPC/EAN: ${productData.barcode}`,
      images: productData.images?.length ? [productData.images[0]] : [],
    };

    // For firearms, try to set appropriate subcategory based on caliber
    if (item.category === 'firearms' && productData.caliber) {
      item.firearmSubcategory = guessFirearmSubcategory(productData.caliber);
    }

    // Cache the successful result
    if (useCache && data.success && productData) {
      console.log('💾 Caching barcode data');
      const cacheData: BarcodeData = {
        barcode: productData.barcode,
        title: productData.name,
        description: productData.description,
        brand: productData.manufacturer,
        model: productData.model,
        category: productData.category,
        images: productData.images,
        msrp: productData.price,
        cachedAt: new Date().toISOString(),
        hitCount: 0,
        lastAccessed: new Date().toISOString(),
      };
      
      await barcodeCache.set(cacheData).catch(err => {
        console.error('Failed to cache barcode:', err);
      });
    }

    return { item, response: data, fromCache: false };
  } catch (error) {
    console.error('Barcode lookup failed:', error);
    return {
      item: null,
      response: {
        success: false,
        error: 'Unexpected error',
        details: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      fromCache: false
    };
  }
}


/**
 * Map UPCitemdb categories to inventory categories
 */
function mapCategoryToInventory(apiCategory: string): string {
  const lowerCategory = apiCategory.toLowerCase();
  
  // Check for firearm-related keywords
  if (lowerCategory.includes('firearm') || 
      lowerCategory.includes('gun') || 
      lowerCategory.includes('rifle') || 
      lowerCategory.includes('pistol') || 
      lowerCategory.includes('shotgun')) {
    return 'firearms';
  }
  
  // Check for ammunition
  if (lowerCategory.includes('ammo') || 
      lowerCategory.includes('ammunition') || 
      lowerCategory.includes('cartridge')) {
    return 'ammunition';
  }
  
  // Check for optics
  if (lowerCategory.includes('scope') || 
      lowerCategory.includes('optic') || 
      lowerCategory.includes('sight')) {
    return 'optics';
  }
  
  const categoryMap: Record<string, string> = {
    'Sports & Outdoors': 'accessories',
    'Sporting Goods': 'accessories',
    'Tools & Hardware': 'accessories',
    'Electronics': 'optics',
    'Optics': 'optics',
    'Ammunition': 'ammunition',
  };

  return categoryMap[apiCategory] || 'accessories';
}

/**
 * Guess firearm subcategory based on caliber
 */
function guessFirearmSubcategory(caliber: string): string {
  const lowerCaliber = caliber.toLowerCase();
  
  // Rimfire calibers
  if (lowerCaliber.includes('22') || lowerCaliber.includes('.17')) {
    return 'rimfire-rifle';
  }
  
  // Shotgun gauges
  if (lowerCaliber.includes('gauge') || lowerCaliber.includes('ga')) {
    return 'shotgun';
  }
  
  // Common pistol calibers
  if (lowerCaliber.includes('9mm') || 
      lowerCaliber.includes('45 acp') || 
      lowerCaliber.includes('40 s&w') || 
      lowerCaliber.includes('380') || 
      lowerCaliber.includes('357') || 
      lowerCaliber.includes('38 special')) {
    return 'pistol';
  }
  
  // Default to centerfire rifle for larger calibers
  return 'centerfire-rifle';
}

/**
 * Validate if a string is a valid UPC/EAN barcode
 */
export function isValidBarcode(code: string): boolean {
  // Remove any spaces or dashes
  const cleanCode = code.replace(/[\s-]/g, '');
  
  // UPC-A: 12 digits
  // EAN-13: 13 digits
  // EAN-8: 8 digits
  const upcPattern = /^\d{12}$/;
  const ean13Pattern = /^\d{13}$/;
  const ean8Pattern = /^\d{8}$/;
  
  return upcPattern.test(cleanCode) || ean13Pattern.test(cleanCode) || ean8Pattern.test(cleanCode);
}

/**
 * Format barcode for display (add dashes for readability)
 */
export function formatBarcode(code: string): string {
  const cleanCode = code.replace(/[\s-]/g, '');
  
  if (cleanCode.length === 12) {
    // UPC-A: X-XXXXX-XXXXX-X
    return `${cleanCode[0]}-${cleanCode.slice(1, 6)}-${cleanCode.slice(6, 11)}-${cleanCode[11]}`;
  } else if (cleanCode.length === 13) {
    // EAN-13: XXX-X-XXXXX-XXXXX-X
    return `${cleanCode.slice(0, 3)}-${cleanCode[3]}-${cleanCode.slice(4, 9)}-${cleanCode.slice(9, 13)}`;
  }
  
  return code;
}
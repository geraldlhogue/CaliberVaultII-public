/**
 * Category Mapping Service
 * 
 * Maps database table names to category IDs from the categories table.
 * This is the single source of truth for table-to-category mapping.
 */

import { supabase } from '@/lib/supabase';
import type { ItemCategory } from '@/types/inventory';

// Database table name to category ID mapping
// This should match the 'id' column in the categories table
export const TABLE_TO_CATEGORY_MAP: Record<string, ItemCategory> = {
  'firearms': 'firearms',
  'optics': 'optics',
  'ammunition': 'ammunition',
  'suppressors': 'suppressors',
  'magazines': 'magazines',
  'accessories': 'accessories',
  'bullets': 'bullets',
  'reloading_components': 'reloading',
  'cases': 'cases',
  'primers': 'primers',
  'powder': 'powder',
};

// Reverse mapping: category ID to table name
export const CATEGORY_TO_TABLE_MAP: Record<ItemCategory, string> = {
  'firearms': 'firearms',
  'optics': 'optics',
  'ammunition': 'ammunition',
  'suppressors': 'suppressors',
  'magazines': 'magazines',
  'accessories': 'accessories',
  'bullets': 'bullets',
  'reloading': 'reloading_components',
  'cases': 'cases',
  'primers': 'primers',
  'powder': 'powder',
};

/**
 * Get category ID from database table name
 */
export function getCategoryFromTable(tableName: string): ItemCategory | null {
  return TABLE_TO_CATEGORY_MAP[tableName] || null;
}

/**
 * Get database table name from category ID
 */
export function getTableFromCategory(category: ItemCategory): string | null {
  return CATEGORY_TO_TABLE_MAP[category] || null;
}

/**
 * Fetch all categories from the database
 */
export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, icon, description')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data || [];
}

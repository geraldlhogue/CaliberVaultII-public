import React, { useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { ItemCategory } from '@/types/inventory';

export const CategoryCountDebug: React.FC = () => {
  const { inventory } = useAppContext();

  useEffect(() => {
    console.log('=== CATEGORY COUNT DEBUG ===');
    console.log('Total inventory items:', inventory.length);
    
    // Group items by category
    const categoryGroups = inventory.reduce((acc, item) => {
      const cat = item.category || 'unknown';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, any[]>);
    
    console.log('Items grouped by category:', categoryGroups);
    
    // Count each category
    Object.keys(categoryGroups).forEach(cat => {
      console.log(`Category "${cat}": ${categoryGroups[cat].length} items`);
      console.log(`  Sample items:`, categoryGroups[cat].slice(0, 2).map(i => ({ id: i.id, name: i.name, category: i.category })));
    });
    
    // Check for exact matches
    const categories: ItemCategory[] = ['firearms', 'optics', 'ammunition', 'suppressors', 'magazines', 'accessories'];
    categories.forEach(cat => {
      const count = inventory.filter(i => i.category === cat).length;
      console.log(`Exact match for "${cat}": ${count} items`);
    });
  }, [inventory]);

  return null;
};

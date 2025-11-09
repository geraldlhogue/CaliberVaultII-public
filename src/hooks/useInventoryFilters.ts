import { useMemo, useCallback } from 'react';
import type { InventoryItem, ItemCategory, FirearmSubcategory } from '@/types/inventory';
import type { ActiveFilters } from '@/types/filters';

interface FilterParams {
  inventory: InventoryItem[];
  selectedCategory?: ItemCategory | null;
  searchQuery?: string;
  filterCaliber?: string;
  filterFirearmType?: FirearmSubcategory | '';
  filterAmmoType?: string;
  advancedFilters?: ActiveFilters;
}


export function useInventoryFilters({
  inventory,
  selectedCategory,
  searchQuery,
  filterCaliber,
  filterFirearmType,
  filterAmmoType,
  advancedFilters,
}: FilterParams) {
  // Memoize filtered inventory to prevent unnecessary recalculations
  const filteredInventory = useMemo(() => {
    // Guard against undefined inventory
    if (!inventory || !Array.isArray(inventory)) return [];
    
    return inventory.filter(item => {
      // Basic filters
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.storageLocation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.caliber && item.caliber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.manufacturer && item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCaliber = !filterCaliber || 
        (item.caliber && item.caliber.toLowerCase().includes(filterCaliber.toLowerCase()));
      const matchesFirearmType = !filterFirearmType || item.firearmSubcategory === filterFirearmType;
      const matchesAmmoType = !filterAmmoType || item.ammoType === filterAmmoType;
      
      // Advanced filters - add null checks for both advancedFilters and categories
      const categoriesArray = advancedFilters?.categories;
      const matchesAdvancedCategories = !categoriesArray || !Array.isArray(categoriesArray) || 
        categoriesArray.length === 0 || categoriesArray.includes(item.category);
      
      const matchesPriceMin = !advancedFilters || advancedFilters.priceMin === undefined || 
        item.purchasePrice >= advancedFilters.priceMin;
      const matchesPriceMax = !advancedFilters || advancedFilters.priceMax === undefined || 
        item.purchasePrice <= advancedFilters.priceMax;
      
      const matchesDateStart = !advancedFilters || !advancedFilters.dateStart || 
        new Date(item.purchaseDate) >= new Date(advancedFilters.dateStart);
      const matchesDateEnd = !advancedFilters || !advancedFilters.dateEnd || 
        new Date(item.purchaseDate) <= new Date(advancedFilters.dateEnd);
      
      return matchesCategory && matchesSearch && matchesCaliber && matchesFirearmType && 
             matchesAmmoType && matchesAdvancedCategories && matchesPriceMin && 
             matchesPriceMax && matchesDateStart && matchesDateEnd;
    });
  }, [
    inventory,
    selectedCategory,
    searchQuery,
    filterCaliber,
    filterFirearmType,
    filterAmmoType,
    advancedFilters,
  ]);

  // Memoize unique values for filter dropdowns
  const uniqueCalibers = useMemo(() => {
    if (!inventory || !Array.isArray(inventory)) return [];
    return Array.from(new Set(inventory.filter(i => i.caliber).map(i => i.caliber))).sort();
  }, [inventory]);

  const uniqueAmmoTypes = useMemo(() => {
    if (!inventory || !Array.isArray(inventory)) return [];
    return Array.from(new Set(inventory.filter(i => i.ammoType).map(i => i.ammoType))).sort();
  }, [inventory]);

  const uniqueManufacturers = useMemo(() => {
    if (!inventory || !Array.isArray(inventory)) return [];
    return Array.from(new Set(inventory.filter(i => i.manufacturer).map(i => i.manufacturer))).sort();
  }, [inventory]);

  const maxPrice = useMemo(() => {
    if (!inventory || !Array.isArray(inventory) || inventory.length === 0) return 0;
    return Math.max(...inventory.map(i => i.purchasePrice || 0));
  }, [inventory]);


  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    return (advancedFilters?.categories?.length || 0) +
      (advancedFilters?.priceMin !== undefined ? 1 : 0) +
      (advancedFilters?.priceMax !== undefined ? 1 : 0) +
      (advancedFilters?.manufacturers?.length || 0) +
      (advancedFilters?.dateStart ? 1 : 0) +
      (advancedFilters?.dateEnd ? 1 : 0) +
      (filterCaliber ? 1 : 0) +
      (filterFirearmType ? 1 : 0) +
      (filterAmmoType ? 1 : 0);
  }, [advancedFilters, filterCaliber, filterFirearmType, filterAmmoType]);

  return {
    filteredInventory,
    uniqueCalibers,
    uniqueAmmoTypes,
    uniqueManufacturers,
    maxPrice,
    activeFilterCount,
  };
}
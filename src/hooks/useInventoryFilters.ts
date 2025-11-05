
import { useMemo } from 'react';

export type FilterParams = {
  inventory?: any[];
  selectedCategory?: string;
  searchQuery?: string;
  caliber?: string;
  priceRange?: [number, number];
  manufacturers?: string[];
  filterAmmoType?: string;
  advancedFilters?: Record<string, any>;
};

export function useInventoryFilters({
  inventory = [],
  selectedCategory,
  searchQuery,
  caliber,
  priceRange,
  manufacturers,
  filterAmmoType,
  advancedFilters,
}: FilterParams) {
  const filteredInventory = useMemo(() => {
    let list = Array.isArray(inventory) ? [...inventory] : [];
    if (selectedCategory) list = list.filter(i => i.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i => String(i.name ?? '').toLowerCase().includes(q));
    }
    if (caliber) list = list.filter(i => i.caliber === caliber);
    if (priceRange) list = list.filter(i => {
      const price = Number(i.price ?? 0); return price >= priceRange[0] && price <= priceRange[1];
    });
    if (manufacturers?.length) list = list.filter(i => manufacturers.includes(i.manufacturer_id || i.manufacturer));
    if (filterAmmoType) list = list.filter(i => i.ammo_type === filterAmmoType);
    // advancedFilters ignored in test impl
    return list;
  }, [inventory, selectedCategory, searchQuery, caliber, priceRange, manufacturers, filterAmmoType, advancedFilters]);

  return { items: filteredInventory, total: filteredInventory.length };
}

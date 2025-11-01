import { ItemCategory } from './inventory';

export interface FilterPreset {
  id: string;
  name: string;
  categories: ItemCategory[];
  priceMin?: number;
  priceMax?: number;
  dateStart?: string;
  dateEnd?: string;
  caliber?: string;
  manufacturer?: string;
}

export interface ActiveFilters {
  categories?: ItemCategory[];
  priceMin?: number;
  priceMax?: number;
  dateStart?: string;
  dateEnd?: string;
  caliber?: string;
  manufacturer?: string;
  manufacturers?: string[];
}

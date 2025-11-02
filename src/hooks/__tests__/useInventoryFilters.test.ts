import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInventoryFilters } from '../useInventoryFilters';
import type { InventoryItem } from '@/types/inventory';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Test Rifle',
    category: 'firearms',
    manufacturer: 'Test Mfg',
    caliber: '5.56mm',
    purchasePrice: 1000,
    purchaseDate: '2024-01-01',
    quantity: 1,
    storageLocation: 'Safe 1'
  } as InventoryItem,
  {
    id: '2',
    name: 'Test Ammo',
    category: 'ammunition',
    manufacturer: 'Ammo Co',
    caliber: '9mm',
    purchasePrice: 500,
    purchaseDate: '2024-02-01',
    quantity: 1000,
    storageLocation: 'Cabinet A'
  } as InventoryItem
];

describe('useInventoryFilters', () => {
  it('returns all items when no filters applied', () => {
    const { result } = renderHook(() => 
      useInventoryFilters({
        inventory: mockInventory
      })
    );
    
    expect(result.current.filteredInventory).toHaveLength(2);
  });

  it('filters by category', () => {
    const { result } = renderHook(() => 
      useInventoryFilters({
        inventory: mockInventory,
        selectedCategory: 'firearms'
      })
    );
    
    expect(result.current.filteredInventory).toHaveLength(1);
    expect(result.current.filteredInventory[0].category).toBe('firearms');
  });

  it('filters by search query', () => {
    const { result } = renderHook(() => 
      useInventoryFilters({
        inventory: mockInventory,
        searchQuery: 'rifle'
      })
    );
    
    expect(result.current.filteredInventory).toHaveLength(1);
    expect(result.current.filteredInventory[0].name).toContain('Rifle');
  });

  it('filters by caliber', () => {
    const { result } = renderHook(() => 
      useInventoryFilters({
        inventory: mockInventory,
        filterCaliber: '9mm'
      })
    );
    
    expect(result.current.filteredInventory).toHaveLength(1);
    expect(result.current.filteredInventory[0].caliber).toBe('9mm');
  });

  it('returns unique calibers', () => {
    const { result } = renderHook(() => 
      useInventoryFilters({
        inventory: mockInventory
      })
    );
    
    expect(result.current.uniqueCalibers).toEqual(['5.56mm', '9mm']);
  });

  it('returns unique manufacturers', () => {
    const { result } = renderHook(() => 
      useInventoryFilters({
        inventory: mockInventory
      })
    );
    
    expect(result.current.uniqueManufacturers).toEqual(['Ammo Co', 'Test Mfg']);
  });

  it('calculates max price correctly', () => {
    const { result } = renderHook(() => 
      useInventoryFilters({
        inventory: mockInventory
      })
    );
    
    expect(result.current.maxPrice).toBe(1000);
  });

  it('handles empty inventory gracefully', () => {
    const { result } = renderHook(() => 
      useInventoryFilters({
        inventory: []
      })
    );
    
    expect(result.current.filteredInventory).toHaveLength(0);
    expect(result.current.uniqueCalibers).toHaveLength(0);
  });

  it('filters with advanced price range', () => {
    const { result } = renderHook(() => 
      useInventoryFilters({
        inventory: mockInventory,
        advancedFilters: {
          priceMin: 600,
          priceMax: 1500
        }
      })
    );
    
    expect(result.current.filteredInventory).toHaveLength(1);
    expect(result.current.filteredInventory[0].name).toBe('Test Rifle');
  });

  it('calculates active filter count', () => {
    const { result } = renderHook(() => 
      useInventoryFilters({
        inventory: mockInventory,
        filterCaliber: '9mm',
        advancedFilters: {
          priceMin: 100,
          priceMax: 2000
        }
      })
    );
    
    expect(result.current.activeFilterCount).toBeGreaterThan(0);
  });
});

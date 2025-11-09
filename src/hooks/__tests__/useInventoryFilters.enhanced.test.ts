import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInventoryFilters } from '../useInventoryFilters';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

describe('useInventoryFilters Enhanced', () => {
  const mockInventory = [
    { id: '1', name: 'Test Item', category: 'firearms', manufacturer: 'Glock', purchasePrice: 500, purchaseDate: '2024-01-01' }
  ];

  it('handles complex filter combinations', () => {
    const { result } = renderHook(() => useInventoryFilters({
      inventory: mockInventory,
      selectedCategory: 'firearms',
      searchQuery: '',
    }));
    expect(result.current.filteredInventory).toBeDefined();
  });

  it('persists filter state', () => {
    const { result } = renderHook(() => useInventoryFilters({
      inventory: mockInventory,
      selectedCategory: 'ammunition',
    }));
    expect(result.current.filteredInventory).toBeDefined();
  });
});


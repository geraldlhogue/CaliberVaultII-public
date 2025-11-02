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
  it('handles complex filter combinations', () => {
    const { result } = renderHook(() => useInventoryFilters());
    act(() => {
      result.current.setFilters({ 
        category: 'firearms', 
        manufacturer: 'Glock' 
      });
    });
    expect(result.current.filters.category).toBe('firearms');
    expect(result.current.filters.manufacturer).toBe('Glock');
  });

  it('persists filter state', () => {
    const { result } = renderHook(() => useInventoryFilters());
    act(() => {
      result.current.setFilters({ category: 'ammunition' });
    });
    expect(result.current.filters.category).toBe('ammunition');
  });
});

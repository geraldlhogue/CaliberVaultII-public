import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInventoryFilters } from '../useInventoryFilters';

describe('useInventoryFilters', () => {
  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useInventoryFilters());
    
    expect(result.current.filters).toEqual({
      search: '',
      category: 'all',
      manufacturer: 'all',
      caliber: 'all',
      location: 'all'
    });
  });

  it('should update search filter', () => {
    const { result } = renderHook(() => useInventoryFilters());
    
    act(() => {
      result.current.updateFilter('search', 'test');
    });
    
    expect(result.current.filters.search).toBe('test');
  });

  it('should reset all filters', () => {
    const { result } = renderHook(() => useInventoryFilters());
    
    act(() => {
      result.current.updateFilter('search', 'test');
      result.current.updateFilter('category', 'firearms');
      result.current.resetFilters();
    });
    
    expect(result.current.filters).toEqual({
      search: '',
      category: 'all',
      manufacturer: 'all',
      caliber: 'all',
      location: 'all'
    });
  });
});

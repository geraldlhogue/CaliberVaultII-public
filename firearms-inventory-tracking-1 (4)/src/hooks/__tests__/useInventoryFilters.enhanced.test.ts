import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInventoryFilters } from '../useInventoryFilters';
import { mockFirearm, mockAmmunition } from '../../test/fixtures/inventory.fixtures';

describe('useInventoryFilters - Enhanced Tests', () => {
  it('initializes with empty filters', () => {
    const { result } = renderHook(() => useInventoryFilters());
    expect(result.current.filters).toEqual({});
  });

  it('sets category filter', () => {
    const { result } = renderHook(() => useInventoryFilters());
    
    act(() => {
      result.current.setFilter('category', 'firearms');
    });
    
    expect(result.current.filters.category).toBe('firearms');
  });

  it('filters items by category', () => {
    const items = [mockFirearm, mockAmmunition];
    const { result } = renderHook(() => useInventoryFilters());
    
    act(() => {
      result.current.setFilter('category', 'firearms');
    });
    
    const filtered = items.filter(item => 
      result.current.filters.category ? 
      item.category === result.current.filters.category : 
      true
    );
    
    expect(filtered).toHaveLength(1);
    expect(filtered[0].category).toBe('firearms');
  });

  it('clears all filters', () => {
    const { result } = renderHook(() => useInventoryFilters());
    
    act(() => {
      result.current.setFilter('category', 'firearms');
      result.current.setFilter('manufacturer', 'Test');
    });
    
    act(() => {
      result.current.clearFilters();
    });
    
    expect(result.current.filters).toEqual({});
  });

  it('applies multiple filters simultaneously', () => {
    const { result } = renderHook(() => useInventoryFilters());
    
    act(() => {
      result.current.setFilter('category', 'firearms');
      result.current.setFilter('manufacturer', 'Test Manufacturer');
    });
    
    expect(result.current.filters.category).toBe('firearms');
    expect(result.current.filters.manufacturer).toBe('Test Manufacturer');
  });
});

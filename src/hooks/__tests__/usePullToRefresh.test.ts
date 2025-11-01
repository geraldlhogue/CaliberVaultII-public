import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePullToRefresh } from '../usePullToRefresh';

describe('usePullToRefresh Hook Tests', () => {
  it('initializes pull-to-refresh', () => {
    const onRefresh = vi.fn();
    const { result } = renderHook(() => usePullToRefresh({ onRefresh }));
    
    expect(result.current.isRefreshing).toBe(false);
  });

  it('triggers refresh on pull gesture', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePullToRefresh({ onRefresh }));
    
    // Simulate pull gesture
    act(() => {
      result.current.handleTouchStart({ touches: [{ clientY: 0 }] } as any);
      result.current.handleTouchMove({ touches: [{ clientY: 100 }] } as any);
      result.current.handleTouchEnd();
    });

    expect(onRefresh).toHaveBeenCalled();
  });

  it('shows loading state during refresh', async () => {
    const onRefresh = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    const { result } = renderHook(() => usePullToRefresh({ onRefresh }));
    
    act(() => {
      result.current.handleTouchStart({ touches: [{ clientY: 0 }] } as any);
      result.current.handleTouchMove({ touches: [{ clientY: 100 }] } as any);
      result.current.handleTouchEnd();
    });

    expect(result.current.isRefreshing).toBe(true);
  });

  it('handles iOS-specific behavior', () => {
    const onRefresh = vi.fn();
    const { result } = renderHook(() => 
      usePullToRefresh({ onRefresh, iosOptimized: true })
    );
    
    expect(result.current).toBeDefined();
  });
});

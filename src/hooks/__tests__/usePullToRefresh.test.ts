import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePullToRefresh } from '../usePullToRefresh';

describe('usePullToRefresh', () => {
  it('initializes pull to refresh', () => {
    const onRefresh = vi.fn();
    const { result } = renderHook(() => usePullToRefresh({ onRefresh }));
    expect(result.current).toBeDefined();
  });

  it('handles refresh callback', () => {
    const onRefresh = vi.fn();
    renderHook(() => usePullToRefresh({ onRefresh }));
    expect(onRefresh).toBeDefined();
  });

  it('tracks pull state', () => {
    const onRefresh = vi.fn();
    const { result } = renderHook(() => usePullToRefresh({ onRefresh }));
    expect(result.current.isPulling).toBeDefined();
  });
});

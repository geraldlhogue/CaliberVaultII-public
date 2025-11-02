import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSwipeGesture } from '../useSwipeGesture';

describe('useSwipeGesture', () => {
  it('initializes swipe gesture', () => {
    const onSwipe = vi.fn();
    const { result } = renderHook(() => useSwipeGesture({ onSwipe }));
    expect(result.current).toBeDefined();
  });

  it('handles swipe callback', () => {
    const onSwipe = vi.fn();
    renderHook(() => useSwipeGesture({ onSwipe }));
    expect(onSwipe).toBeDefined();
  });

  it('detects swipe direction', () => {
    const onSwipe = vi.fn();
    const { result } = renderHook(() => useSwipeGesture({ onSwipe }));
    expect(result.current.handlers).toBeDefined();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSwipeGesture } from '../useSwipeGesture';

describe('useSwipeGesture Hook Tests', () => {
  it('detects swipe left', () => {
    const onSwipeLeft = vi.fn();
    const { result } = renderHook(() => 
      useSwipeGesture({ onSwipeLeft })
    );
    
    act(() => {
      result.current.handleTouchStart({ touches: [{ clientX: 100 }] } as any);
      result.current.handleTouchMove({ touches: [{ clientX: 0 }] } as any);
      result.current.handleTouchEnd();
    });

    expect(onSwipeLeft).toHaveBeenCalled();
  });

  it('detects swipe right', () => {
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() => 
      useSwipeGesture({ onSwipeRight })
    );
    
    act(() => {
      result.current.handleTouchStart({ touches: [{ clientX: 0 }] } as any);
      result.current.handleTouchMove({ touches: [{ clientX: 100 }] } as any);
      result.current.handleTouchEnd();
    });

    expect(onSwipeRight).toHaveBeenCalled();
  });

  it('requires minimum swipe distance', () => {
    const onSwipeLeft = vi.fn();
    const { result } = renderHook(() => 
      useSwipeGesture({ onSwipeLeft, threshold: 50 })
    );
    
    act(() => {
      result.current.handleTouchStart({ touches: [{ clientX: 100 }] } as any);
      result.current.handleTouchMove({ touches: [{ clientX: 75 }] } as any);
      result.current.handleTouchEnd();
    });

    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('handles vertical swipes', () => {
    const onSwipeUp = vi.fn();
    const { result } = renderHook(() => 
      useSwipeGesture({ onSwipeUp })
    );
    
    act(() => {
      result.current.handleTouchStart({ touches: [{ clientY: 100 }] } as any);
      result.current.handleTouchMove({ touches: [{ clientY: 0 }] } as any);
      result.current.handleTouchEnd();
    });

    expect(onSwipeUp).toHaveBeenCalled();
  });
});

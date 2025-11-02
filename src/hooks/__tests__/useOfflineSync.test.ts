import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOfflineSync } from '../useOfflineSync';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }
}));

describe('useOfflineSync', () => {
  it('initializes sync state', () => {
    const { result } = renderHook(() => useOfflineSync());
    expect(result.current).toBeDefined();
  });

  it('handles offline mode', () => {
    const { result } = renderHook(() => useOfflineSync());
    expect(result.current.isOnline).toBeDefined();
  });

  it('queues offline changes', () => {
    const { result } = renderHook(() => useOfflineSync());
    expect(result.current.queuedChanges).toBeDefined();
  });
});

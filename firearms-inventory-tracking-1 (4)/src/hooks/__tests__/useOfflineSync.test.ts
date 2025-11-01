import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOfflineSync } from '../useOfflineSync';

describe('useOfflineSync Hook Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with online status', () => {
    const { result } = renderHook(() => useOfflineSync());
    expect(result.current.isOnline).toBe(navigator.onLine);
  });

  it('detects offline status', async () => {
    const { result } = renderHook(() => useOfflineSync());
    
    // Simulate going offline
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(false);
    });
  });

  it('queues operations when offline', async () => {
    const { result } = renderHook(() => useOfflineSync());
    
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await act(async () => {
      await result.current.queueOperation('create', { id: '1', name: 'Test' });
    });

    expect(result.current.queueLength).toBeGreaterThan(0);
  });

  it('syncs queue when back online', async () => {
    const { result } = renderHook(() => useOfflineSync());
    
    // Go offline and queue operation
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await act(async () => {
      await result.current.queueOperation('create', { id: '1' });
    });

    // Go back online
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(result.current.queueLength).toBe(0);
    });
  });

  it('handles sync errors', async () => {
    const { result } = renderHook(() => useOfflineSync());
    
    await act(async () => {
      await result.current.queueOperation('create', { shouldFail: true });
    });

    // Should handle error gracefully
  });
});

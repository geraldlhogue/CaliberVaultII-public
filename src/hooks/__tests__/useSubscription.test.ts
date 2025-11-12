import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSubscription } from '../useSubscription';

// Mock AuthProvider
vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'user-1' }
  })
}));

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ 
        data: { status: 'active', plan_type: 'pro' }, 
        error: null 
      })),
      then: (onFulfilled: any) => Promise.resolve({ 
        count: 10, 
        error: null 
      }).then(onFulfilled)
    }))
  }
}));

// Mock featureGating
vi.mock('@/lib/featureGating', () => ({
  getTierLimits: vi.fn(() => ({ maxItems: 1000, maxLocations: 10, maxUsers: 5 })),
  canAccessFeature: vi.fn(() => true),
  getItemLimit: vi.fn(() => 1000),
  getLocationLimit: vi.fn(() => 10),
  getUserLimit: vi.fn(() => 5)
}));

describe('useSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns subscription data with tier pro', async () => {
    const { result } = renderHook(() => useSubscription());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.planType).toBe('pro');
    expect(result.current.isActive).toBe(true);
  });

  it('has hasFeature function that returns true', async () => {
    const { result } = renderHook(() => useSubscription());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const hasAdvancedAnalytics = await result.current.hasFeature('advanced_analytics');
    expect(hasAdvancedAnalytics).toBe(true);
  });

  it('returns defined limits', async () => {
    const { result } = renderHook(() => useSubscription());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.itemLimit).toBeDefined();
    expect(result.current.itemLimit).toBeGreaterThan(0);
  });
});

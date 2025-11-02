import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSubscription } from '../useSubscription';

vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    subscription: {
      tier: 'pro',
      status: 'active',
      features: ['advanced_analytics', 'team_collaboration'],
    },
  }),
}));

describe('useSubscription', () => {
  it('returns subscription data', () => {
    const { result } = renderHook(() => useSubscription());
    expect(result.current.tier).toBe('pro');
    expect(result.current.status).toBe('active');
  });

  it('checks feature availability', () => {
    const { result } = renderHook(() => useSubscription());
    expect(result.current.hasFeature('advanced_analytics')).toBe(true);
    expect(result.current.hasFeature('nonexistent_feature')).toBe(false);
  });

  it('returns tier limits', () => {
    const { result } = renderHook(() => useSubscription());
    expect(result.current.limits).toBeDefined();
    expect(result.current.limits.maxItems).toBeGreaterThan(0);
  });
});

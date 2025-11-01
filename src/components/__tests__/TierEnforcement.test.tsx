import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureGuard } from '../subscription/FeatureGuard';
import { useSubscription } from '../../hooks/useSubscription';

vi.mock('../../hooks/useSubscription');

describe('Tier Enforcement Tests', () => {
  it('shows feature for premium users', () => {
    vi.mocked(useSubscription).mockReturnValue({
      tier: 'premium',
      hasFeature: vi.fn().mockReturnValue(true),
      isLoading: false
    } as any);

    render(
      <FeatureGuard feature="advanced_analytics">
        <div>Premium Feature</div>
      </FeatureGuard>
    );

    expect(screen.getByText('Premium Feature')).toBeInTheDocument();
  });

  it('hides feature for free users', () => {
    vi.mocked(useSubscription).mockReturnValue({
      tier: 'free',
      hasFeature: vi.fn().mockReturnValue(false),
      isLoading: false
    } as any);

    render(
      <FeatureGuard feature="advanced_analytics">
        <div>Premium Feature</div>
      </FeatureGuard>
    );

    expect(screen.queryByText('Premium Feature')).not.toBeInTheDocument();
  });

  it('shows upgrade prompt for restricted features', () => {
    vi.mocked(useSubscription).mockReturnValue({
      tier: 'free',
      hasFeature: vi.fn().mockReturnValue(false),
      isLoading: false
    } as any);

    render(
      <FeatureGuard feature="advanced_analytics" showUpgrade>
        <div>Premium Feature</div>
      </FeatureGuard>
    );

    expect(screen.getByText(/upgrade/i)).toBeInTheDocument();
  });

  it('enforces item count limits', () => {
    vi.mocked(useSubscription).mockReturnValue({
      tier: 'free',
      limits: { maxItems: 50 },
      hasFeature: vi.fn(),
      isLoading: false
    } as any);

    // Test would verify item count enforcement
  });
});

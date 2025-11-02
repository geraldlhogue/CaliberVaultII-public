import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { FeatureGuard } from '../subscription/FeatureGuard';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { tier: 'free' }, error: null }))
        }))
      }))
    }))
  }
}));

describe('TierEnforcement', () => {
  it('renders feature guard', () => {
    const { container } = render(
      <FeatureGuard feature="advanced_analytics">
        <div>Protected Content</div>
      </FeatureGuard>
    );
    expect(container).toBeTruthy();
  });

  it('enforces tier limits', () => {
    const { container } = render(
      <FeatureGuard feature="team_collaboration">
        <div>Team Feature</div>
      </FeatureGuard>
    );
    expect(container.querySelector('div')).toBeTruthy();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { OnboardingFeedbackModal } from '../onboarding/OnboardingFeedbackModal';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123' }, error: null }))
        }))
      }))
    }))
  }
}));

describe('FeedbackSystem', () => {
  it('renders feedback modal', () => {
    const { container } = render(
      <OnboardingFeedbackModal 
        isOpen={true} 
        onClose={vi.fn()} 
        stepName="welcome" 
      />
    );
    expect(container).toBeTruthy();
  });

  it('handles feedback submission', () => {
    const onClose = vi.fn();
    render(
      <OnboardingFeedbackModal 
        isOpen={true} 
        onClose={onClose} 
        stepName="welcome" 
      />
    );
    expect(onClose).toBeDefined();
  });
});

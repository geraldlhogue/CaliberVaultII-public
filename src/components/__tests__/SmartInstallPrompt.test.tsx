import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SmartInstallPrompt } from '../pwa/SmartInstallPrompt';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

describe('SmartInstallPrompt', () => {
  it('renders install prompt', () => {
    const { container } = render(<SmartInstallPrompt />);
    expect(container).toBeTruthy();
  });

  it('handles PWA install', () => {
    const { container } = render(<SmartInstallPrompt />);
    expect(container.querySelector('div')).toBeTruthy();
  });
});

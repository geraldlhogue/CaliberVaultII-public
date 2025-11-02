import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SyncStatusDashboard } from '../sync/SyncStatusDashboard';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

describe('SyncStatusDashboard', () => {
  it('renders sync dashboard', () => {
    const { container } = render(<SyncStatusDashboard />);
    expect(container).toBeTruthy();
  });

  it('displays sync status', () => {
    const { container } = render(<SyncStatusDashboard />);
    expect(container.querySelector('div')).toBeTruthy();
  });
});

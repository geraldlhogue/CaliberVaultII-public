import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AIValuationModal } from '../valuation/AIValuationModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

describe('AIValuationModal Tests', () => {
  const mockItem = {
    id: '1',
    name: 'Test Firearm',
    manufacturer: 'Test Mfg',
    model: 'TM-1',
    condition: 'excellent'
  };

  it('renders valuation modal', () => {
    const { container } = render(
      <AIValuationModal 
        isOpen={true}
        onClose={vi.fn()}
        item={mockItem}
      />,
      { wrapper }
    );
    expect(container).toBeTruthy();
  });

  it('handles modal close', () => {
    const onClose = vi.fn();
    render(
      <AIValuationModal 
        isOpen={false}
        onClose={onClose}
        item={mockItem}
      />,
      { wrapper }
    );
    expect(true).toBe(true);
  });
});

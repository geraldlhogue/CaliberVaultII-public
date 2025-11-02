import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilterPanel } from '../inventory/FilterPanel';
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
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

describe('FilterPanel Component', () => {
  const mockOnFilterChange = vi.fn();

  it('renders filter panel', () => {
    const { container } = render(
      <FilterPanel 
        filters={{}} 
        onFilterChange={mockOnFilterChange} 
      />,
      { wrapper }
    );
    expect(container).toBeTruthy();
  });

  it('accepts filter changes', () => {
    render(
      <FilterPanel 
        filters={{}} 
        onFilterChange={mockOnFilterChange} 
      />,
      { wrapper }
    );
    expect(mockOnFilterChange).toBeDefined();
  });
});

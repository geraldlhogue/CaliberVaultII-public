import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel } from '../inventory/FilterPanel';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('FilterPanel Component', () => {
  const mockOnFilterChange = vi.fn();

  it('renders all filter options', () => {
    render(
      <FilterPanel 
        filters={{}} 
        onFilterChange={mockOnFilterChange} 
      />,
      { wrapper }
    );
    
    expect(screen.getByText(/category/i)).toBeInTheDocument();
    expect(screen.getByText(/manufacturer/i)).toBeInTheDocument();
  });

  it('calls onFilterChange when category selected', () => {
    render(
      <FilterPanel 
        filters={{}} 
        onFilterChange={mockOnFilterChange} 
      />,
      { wrapper }
    );
    
    const categorySelect = screen.getByLabelText(/category/i);
    fireEvent.change(categorySelect, { target: { value: 'firearms' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'firearms' })
    );
  });

  it('clears all filters', () => {
    render(
      <FilterPanel 
        filters={{ category: 'firearms' }} 
        onFilterChange={mockOnFilterChange} 
      />,
      { wrapper }
    );
    
    const clearButton = screen.getByText(/clear/i);
    fireEvent.click(clearButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({});
  });
});

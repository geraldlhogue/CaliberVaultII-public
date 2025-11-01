import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIValuationModal } from '../valuation/AIValuationModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('AIValuationModal Tests', () => {
  const mockItem = {
    id: '1',
    name: 'Test Firearm',
    manufacturer: 'Test Mfg',
    model: 'TM-1',
    condition: 'excellent'
  };

  it('renders valuation modal', () => {
    render(
      <AIValuationModal 
        isOpen={true}
        onClose={vi.fn()}
        item={mockItem}
      />,
      { wrapper }
    );

    expect(screen.getByText(/valuation/i)).toBeInTheDocument();
  });

  it('fetches AI valuation', async () => {
    render(
      <AIValuationModal 
        isOpen={true}
        onClose={vi.fn()}
        item={mockItem}
      />,
      { wrapper }
    );

    const valuateButton = screen.getByText(/get valuation/i);
    fireEvent.click(valuateButton);

    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  it('displays valuation result', async () => {
    render(
      <AIValuationModal 
        isOpen={true}
        onClose={vi.fn()}
        item={mockItem}
      />,
      { wrapper }
    );

    // Would test display of valuation results
  });

  it('handles valuation errors', async () => {
    render(
      <AIValuationModal 
        isOpen={true}
        onClose={vi.fn()}
        item={mockItem}
      />,
      { wrapper }
    );

    // Would test error handling
  });
});

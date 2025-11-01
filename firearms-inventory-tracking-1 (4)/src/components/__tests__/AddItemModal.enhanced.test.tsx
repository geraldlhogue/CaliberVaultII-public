import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddItemModal } from '../inventory/AddItemModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('AddItemModal - Enhanced Tests', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  it('renders modal when open', () => {
    render(
      <AddItemModal 
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    );
    
    expect(screen.getByText(/add item/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <AddItemModal 
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    );
    
    const submitButton = screen.getByText(/save/i);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    render(
      <AddItemModal 
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    );
    
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test Item' }
    });
    
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'firearms' }
    });
    
    const submitButton = screen.getByText(/save/i);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});

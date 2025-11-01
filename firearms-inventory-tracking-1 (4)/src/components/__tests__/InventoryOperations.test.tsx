import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InventoryDashboard } from '../inventory/InventoryDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockFirearm } from '../../test/fixtures/inventory.fixtures';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('Inventory Operations', () => {
  it('displays inventory items', async () => {
    render(<InventoryDashboard />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/inventory/i)).toBeInTheDocument();
    });
  });

  it('opens add item modal', async () => {
    render(<InventoryDashboard />, { wrapper });
    
    const addButton = screen.getByText(/add item/i);
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('performs search operation', async () => {
    render(<InventoryDashboard />, { wrapper });
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('test');
    });
  });

  it('applies filters', async () => {
    render(<InventoryDashboard />, { wrapper });
    
    const filterButton = screen.getByText(/filter/i);
    fireEvent.click(filterButton);
    
    await waitFor(() => {
      expect(screen.getByText(/category/i)).toBeInTheDocument();
    });
  });

  it('handles bulk selection', async () => {
    render(<InventoryDashboard />, { wrapper });
    
    const selectAllCheckbox = screen.getByLabelText(/select all/i);
    fireEvent.click(selectAllCheckbox);
    
    expect(selectAllCheckbox).toBeChecked();
  });
});

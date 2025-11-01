import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SyncStatusDashboard } from '../sync/SyncStatusDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('SyncStatusDashboard', () => {
  it('displays sync status', () => {
    render(<SyncStatusDashboard />, { wrapper });
    expect(screen.getByText(/sync/i)).toBeInTheDocument();
  });

  it('shows pending sync items', async () => {
    render(<SyncStatusDashboard />, { wrapper });
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });

  it('displays last sync time', () => {
    render(<SyncStatusDashboard />, { wrapper });
    expect(screen.getByText(/last sync/i)).toBeInTheDocument();
  });

  it('shows sync errors if any', () => {
    render(<SyncStatusDashboard />, { wrapper });
    // Should handle errors gracefully
  });

  it('displays sync queue count', () => {
    render(<SyncStatusDashboard />, { wrapper });
    expect(screen.getByText(/queue/i)).toBeInTheDocument();
  });
});

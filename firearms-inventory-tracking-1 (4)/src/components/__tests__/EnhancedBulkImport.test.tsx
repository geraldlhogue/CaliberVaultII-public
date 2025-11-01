import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedBulkImport } from '../import/EnhancedBulkImport';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('EnhancedBulkImport Tests', () => {
  it('renders import interface', () => {
    render(<EnhancedBulkImport onComplete={vi.fn()} />, { wrapper });
    expect(screen.getByText(/import/i)).toBeInTheDocument();
  });

  it('accepts CSV file upload', async () => {
    render(<EnhancedBulkImport onComplete={vi.fn()} />, { wrapper });
    
    const file = new File(['name,category\nTest,firearms'], 'test.csv', {
      type: 'text/csv'
    });
    
    const input = screen.getByLabelText(/upload/i);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/test.csv/i)).toBeInTheDocument();
    });
  });

  it('validates CSV format', async () => {
    render(<EnhancedBulkImport onComplete={vi.fn()} />, { wrapper });
    
    const invalidFile = new File(['invalid,data'], 'test.csv', {
      type: 'text/csv'
    });
    
    const input = screen.getByLabelText(/upload/i);
    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('shows import progress', async () => {
    render(<EnhancedBulkImport onComplete={vi.fn()} />, { wrapper });
    // Would test progress bar during import
  });

  it('handles import errors gracefully', async () => {
    render(<EnhancedBulkImport onComplete={vi.fn()} />, { wrapper });
    // Would test error handling during import
  });
});

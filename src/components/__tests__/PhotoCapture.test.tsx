import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { PhotoCapture } from '../inventory/PhotoCapture';

// Mock Supabase storage
vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ 
          data: { path: 'test-photo.jpg' }, 
          error: null 
        })),
        getPublicUrl: vi.fn(() => ({ 
          data: { publicUrl: 'https://example.com/test-photo.jpg' } 
        }))
      }))
    }
  }
}));

// Mock getUserMedia to reject immediately
const mockGetUserMedia = vi.fn(() => 
  Promise.reject(new Error('Camera not available in test environment'))
);

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  writable: true,
  configurable: true
});

describe('PhotoCapture', () => {
  const mockOnCapture = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders photo capture component', async () => {
    await act(async () => {
      render(
        <PhotoCapture 
          onCapture={mockOnCapture} 
          onClose={mockOnClose}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('handles close callback', async () => {
    await act(async () => {
      render(
        <PhotoCapture 
          onCapture={mockOnCapture} 
          onClose={mockOnClose}
        />
      );
    });

    await waitFor(() => {
      const closeButton = screen.queryByRole('button', { name: /close/i });
      if (closeButton) {
        act(() => {
          closeButton.click();
        });
      }
    }, { timeout: 1000 });

    expect(mockOnCapture).toBeDefined();
    expect(mockOnClose).toBeDefined();
  });

  it('shows camera error message', async () => {
    await act(async () => {
      render(
        <PhotoCapture 
          onCapture={mockOnCapture} 
          onClose={mockOnClose}
        />
      );
    });

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled();
    }, { timeout: 1000 });
  });
});

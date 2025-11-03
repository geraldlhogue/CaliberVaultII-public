import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoCapture } from '../inventory/PhotoCapture';

// Mock camera and video APIs
const mockGetUserMedia = vi.fn(() => 
  Promise.resolve({
    getTracks: () => [{ stop: vi.fn() }]
  } as any)
);

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  writable: true,
  configurable: true
});

// Mock HTMLVideoElement.play to prevent pending promises
vi.spyOn(HTMLVideoElement.prototype, 'play').mockResolvedValue();

// Mock requestAnimationFrame for smooth test execution
window.requestAnimationFrame = ((cb: any) => setTimeout(cb, 0)) as any;

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

describe('PhotoCapture', () => {
  const mockOnCapture = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }]
    } as any);
  });

  afterEach(() => {
    vi.clearAllTimers();
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

    const dialog = await screen.findByText(/capture photo/i);
    expect(dialog).toBeInTheDocument();
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

    const closeButton = await screen.findByRole('button', { name: /×/i });
    
    await act(async () => {
      await userEvent.click(closeButton);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('initializes camera on mount', async () => {
    await act(async () => {
      render(
        <PhotoCapture 
          onCapture={mockOnCapture} 
          onClose={mockOnClose}
        />
      );
    });

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.any(Object),
          audio: false
        })
      );
    }, { timeout: 1000 });
  });
});

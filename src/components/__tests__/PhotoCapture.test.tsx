import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoCapture } from '../inventory/PhotoCapture';

// Comprehensive camera and video mocks
const mockStream = {
  getTracks: vi.fn(() => [{ stop: vi.fn() }]),
  getVideoTracks: vi.fn(() => [{ stop: vi.fn() }])
};

const mockGetUserMedia = vi.fn(() => Promise.resolve(mockStream as any));

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  writable: true,
  configurable: true
});

// Prevent pending play promise
vi.spyOn(HTMLVideoElement.prototype, 'play').mockResolvedValue();
vi.spyOn(HTMLVideoElement.prototype, 'pause').mockImplementation(() => {});

// Mock RAF to flush immediately
globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
  const id = setTimeout(() => cb(performance.now()), 0);
  return id as unknown as number;
}) as any;

globalThis.cancelAnimationFrame = ((id: number) => clearTimeout(id)) as any;

// Mock Supabase storage
vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ 
          data: { path: 'test.jpg' }, 
          error: null 
        })),
        getPublicUrl: vi.fn(() => ({ 
          data: { publicUrl: 'https://example.com/test.jpg' } 
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
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
  });

  it('renders photo capture dialog', async () => {
    await act(async () => {
      render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    });

    expect(await screen.findByText(/capture photo/i)).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    await act(async () => {
      render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    });

    const closeBtn = await screen.findByRole('button', { name: /×/i });
    
    await act(async () => {
      await userEvent.click(closeBtn);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('initializes camera on mount', async () => {
    await act(async () => {
      render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith(
          expect.objectContaining({
            video: expect.any(Object),
            audio: false
          })
        );
      }, { timeout: 1000 });
    });
  });
});

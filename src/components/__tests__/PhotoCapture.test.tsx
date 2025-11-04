import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoCapture } from '../inventory/PhotoCapture';

// Mock stream with proper cleanup
const mockTrack = { stop: vi.fn() };
const mockStream = {
  getTracks: vi.fn(() => [mockTrack]),
  getVideoTracks: vi.fn(() => [mockTrack]),
  active: true
};

const mockGetUserMedia = vi.fn(() => Promise.resolve(mockStream as any));

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  writable: true,
  configurable: true
});

// Mock video element methods
const mockPlay = vi.fn(() => Promise.resolve());
const mockPause = vi.fn();
vi.spyOn(HTMLVideoElement.prototype, 'play').mockImplementation(mockPlay);
vi.spyOn(HTMLVideoElement.prototype, 'pause').mockImplementation(mockPause);

// Mock RAF to execute immediately
let rafCallbacks: FrameRequestCallback[] = [];
globalThis.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
  rafCallbacks.push(cb);
  const id = setTimeout(() => cb(performance.now()), 0);
  return id as unknown as number;
}) as any;

globalThis.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
}) as any;

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'test.jpg' }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/test.jpg' } }))
      }))
    }
  }
}));

describe('PhotoCapture', () => {
  const mockOnCapture = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    rafCallbacks = [];
    mockTrack.stop.mockClear();
  });

  afterEach(async () => {
    // Flush all RAF callbacks
    rafCallbacks.forEach(cb => cb(performance.now()));
    rafCallbacks = [];
    
    // Stop all tracks
    mockTrack.stop();
    
    cleanup();
    vi.clearAllTimers();
  });

  it('renders photo capture dialog', async () => {
    await act(async () => {
      render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/capture photo/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('calls onClose when close button clicked', async () => {
    await act(async () => {
      render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    });

    await waitFor(async () => {
      const closeBtn = screen.getByRole('button', { name: /close|×/i });
      await act(async () => {
        await userEvent.click(closeBtn);
      });
    }, { timeout: 2000 });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('initializes camera on mount', async () => {
    await act(async () => {
      render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    });

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({ video: expect.any(Object), audio: false })
      );
    }, { timeout: 2000 });
  });
});

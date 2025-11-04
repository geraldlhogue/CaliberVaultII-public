import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoCapture } from '../inventory/PhotoCapture';

// Track for cleanup
let activeTracks: any[] = [];
let activeStreams: any[] = [];

// Mock stream with proper cleanup
const createMockTrack = () => {
  const track = {
    stop: vi.fn(() => {
      activeTracks = activeTracks.filter(t => t !== track);
    }),
    readyState: 'live',
    enabled: true
  };
  activeTracks.push(track);
  return track;
};

const createMockStream = () => {
  const track = createMockTrack();
  const stream = {
    getTracks: vi.fn(() => [track]),
    getVideoTracks: vi.fn(() => [track]),
    active: true
  };
  activeStreams.push(stream);
  return stream;
};

const mockGetUserMedia = vi.fn(() => Promise.resolve(createMockStream() as any));

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  writable: true,
  configurable: true
});

// Mock video element
const mockPlay = vi.fn(() => Promise.resolve());
const mockPause = vi.fn();
Object.defineProperty(HTMLVideoElement.prototype, 'play', {
  value: mockPlay,
  writable: true,
  configurable: true
});
Object.defineProperty(HTMLVideoElement.prototype, 'pause', {
  value: mockPause,
  writable: true,
  configurable: true
});

// Mock RAF with immediate execution
globalThis.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
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
    activeTracks = [];
    activeStreams = [];
    mockGetUserMedia.mockClear();
    mockPlay.mockClear();
    mockPause.mockClear();
  });

  afterEach(async () => {
    // Stop all active tracks
    activeTracks.forEach(track => track.stop());
    activeTracks = [];
    activeStreams = [];
    
    cleanup();
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  it('renders photo capture dialog', async () => {
    const { unmount } = render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText(/capture photo/i)).toBeInTheDocument();
    }, { timeout: 1000 });
    
    unmount();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText(/capture photo/i)).toBeInTheDocument();
    }, { timeout: 1000 });

    const closeBtn = screen.getByRole('button', { name: /×/i });
    await user.click(closeBtn);
    
    expect(mockOnClose).toHaveBeenCalled();
    unmount();
  });

  it('initializes camera on mount', async () => {
    const { unmount } = render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({ video: expect.any(Object), audio: false })
      );
    }, { timeout: 1000 });
    
    unmount();
  });
});

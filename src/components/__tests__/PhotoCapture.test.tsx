import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoCapture } from '../inventory/PhotoCapture';

// Track RAF callbacks for cleanup
let rafCallbacks: FrameRequestCallback[] = [];
let rafIds = 0;

// Mock RAF to execute immediately and track callbacks
globalThis.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
  rafCallbacks.push(cb);
  const id = ++rafIds;
  // Execute immediately
  Promise.resolve().then(() => cb(performance.now()));
  return id;
}) as any;

globalThis.cancelAnimationFrame = vi.fn((id: number) => {
  // Remove from tracking
}) as any;

// Track streams for cleanup
let activeStreams: MediaStream[] = [];

const createMockTrack = () => ({
  stop: vi.fn(),
  readyState: 'live',
  enabled: true,
  kind: 'video' as const,
  id: Math.random().toString(),
  label: 'mock',
  muted: false,
  getSettings: () => ({}),
  getCapabilities: () => ({}),
  getConstraints: () => ({}),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
});

const createMockStream = () => {
  const track = createMockTrack();
  const stream = {
    getTracks: vi.fn(() => [track]),
    getVideoTracks: vi.fn(() => [track]),
    getAudioTracks: vi.fn(() => []),
    active: true,
    id: Math.random().toString(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  } as unknown as MediaStream;
  activeStreams.push(stream);
  return stream;
};

const mockGetUserMedia = vi.fn(() => Promise.resolve(createMockStream()));

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  writable: true,
  configurable: true
});

// Mock video play
HTMLVideoElement.prototype.play = vi.fn(() => Promise.resolve());
HTMLVideoElement.prototype.pause = vi.fn();

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
    activeStreams = [];
    rafCallbacks = [];
    rafIds = 0;
  });

  afterEach(async () => {
    // Stop all streams
    activeStreams.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    activeStreams = [];
    rafCallbacks = [];
    
    cleanup();
    
    // Wait for any pending promises
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  it('renders photo capture dialog', async () => {
    const { unmount } = render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText(/capture photo/i)).toBeInTheDocument();
    }, { timeout: 500 });
    
    unmount();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText(/capture photo/i)).toBeInTheDocument();
    }, { timeout: 500 });

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
    }, { timeout: 500 });
    
    unmount();
  });
});

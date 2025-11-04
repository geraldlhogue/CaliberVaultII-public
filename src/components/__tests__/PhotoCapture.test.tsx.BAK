import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoCapture } from '../inventory/PhotoCapture';

// Track active streams for cleanup
let activeStreams: MediaStream[] = [];

const createMockStream = () => {
  const track = {
    stop: vi.fn(),
    readyState: 'live',
    enabled: true,
    kind: 'video' as const,
    id: 'mock-track',
    label: 'mock camera',
    muted: false,
    getSettings: () => ({}),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  };
  
  const stream = {
    getTracks: () => [track],
    getVideoTracks: () => [track],
    getAudioTracks: () => [],
    active: true,
    id: 'mock-stream',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  } as unknown as MediaStream;
  
  activeStreams.push(stream);
  return stream;
};

// Mock getUserMedia
const mockGetUserMedia = vi.fn(() => Promise.resolve(createMockStream()));
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  configurable: true
});

// Mock video play
vi.spyOn(HTMLVideoElement.prototype, 'play').mockResolvedValue();
HTMLVideoElement.prototype.pause = vi.fn();

// Mock RAF with Promise resolution
globalThis.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
  Promise.resolve().then(() => cb(performance.now()));
  return 1;
}) as any;

globalThis.cancelAnimationFrame = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: { path: 'test.jpg' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/test.jpg' } })
      })
    }
  }
}));

describe('PhotoCapture', () => {
  const mockOnCapture = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    activeStreams = [];
  });

  afterEach(() => {
    // Stop all active streams
    activeStreams.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    activeStreams = [];
    cleanup();
  });

  it('renders photo capture dialog', async () => {
    const { unmount } = render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    await waitFor(() => expect(screen.getByText(/capture photo/i)).toBeInTheDocument(), { timeout: 1000 });
    unmount();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    
    await waitFor(() => expect(screen.getByText(/capture photo/i)).toBeInTheDocument(), { timeout: 1000 });
    const closeBtn = screen.getByRole('button', { name: /×/i });
    await user.click(closeBtn);
    
    expect(mockOnClose).toHaveBeenCalled();
    unmount();
  });

  it('initializes camera on mount', async () => {
    const { unmount } = render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    }, { timeout: 1000 });
    unmount();
  });
});

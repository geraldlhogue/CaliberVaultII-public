import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoCapture } from '../inventory/PhotoCapture';

const activeStreams: MediaStream[] = [];

beforeAll(() => {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: vi.fn(async () => {
        const stream = new MediaStream();
        const track: any = { kind: 'video', stop: vi.fn() };
        // @ts-ignore
        stream.addTrack?.(track);
        activeStreams.push(stream);
        return stream;
      })
    }
  });
  vi.spyOn(HTMLVideoElement.prototype, 'play').mockResolvedValue();
  // resolve RAF on microtask queue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
    Promise.resolve().then(() => cb(performance.now()));
    return 0 as unknown as number;
  };
});

afterEach(async () => {
  activeStreams.forEach(s => s.getTracks().forEach(t => t.stop?.()));
  activeStreams.length = 0;
  await act(async () => {
    cleanup();
  });
});

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

  it('renders photo capture dialog', async () => {
    const { unmount } = render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    const heading = await screen.findByRole('heading', { name: /capture photo/i });
    expect(heading).toBeInTheDocument();
    await act(async () => {
      unmount();
    });
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    
    await screen.findByRole('heading', { name: /capture photo/i });
    const closeBtn = screen.getByRole('button', { name: /close/i });
    await user.click(closeBtn);
    
    expect(mockOnClose).toHaveBeenCalled();
    await act(async () => {
      unmount();
    });
  });

  it('initializes camera on mount', async () => {
    const { unmount } = render(<PhotoCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
    
    await screen.findByRole('heading', { name: /capture photo/i });
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    await act(async () => {
      unmount();
    });
  });
});

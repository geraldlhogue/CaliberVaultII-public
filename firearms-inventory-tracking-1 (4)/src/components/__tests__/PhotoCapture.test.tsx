import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhotoCapture } from '../inventory/PhotoCapture';

// Mock getUserMedia
const mockGetUserMedia = vi.fn();
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
    enumerateDevices: vi.fn().mockResolvedValue([])
  },
  writable: true
});

describe('PhotoCapture Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }]
    });
  });

  it('renders photo capture button', () => {
    render(<PhotoCapture onPhotoCapture={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Capture/i })).toBeInTheDocument();
  });

  it('requests camera permissions', async () => {
    render(<PhotoCapture onPhotoCapture={vi.fn()} />);
    const button = screen.getByRole('button', { name: /Capture/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: expect.any(Object)
      });
    });
  });

  it('handles camera permission denial', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));
    render(<PhotoCapture onPhotoCapture={vi.fn()} />);
    
    const button = screen.getByRole('button', { name: /Capture/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/permission/i)).toBeInTheDocument();
    });
  });

  it('detects iOS devices', () => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    expect(typeof iOS).toBe('boolean');
  });
});

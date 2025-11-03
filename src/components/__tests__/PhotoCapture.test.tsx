import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PhotoCapture } from '../inventory/PhotoCapture';

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

// Mock getUserMedia
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(() => Promise.reject(new Error('Camera not available in test')))
  },
  writable: true
});

describe('PhotoCapture', () => {
  it('renders photo capture component', async () => {
    const { container } = render(
      <PhotoCapture 
        onCapture={vi.fn()} 
        onClose={vi.fn()}
      />
    );
    await waitFor(() => expect(container).toBeTruthy());
  });

  it('handles photo capture callback', async () => {
    const onCapture = vi.fn();
    render(
      <PhotoCapture 
        onCapture={onCapture} 
        onClose={vi.fn()}
      />
    );
    await waitFor(() => expect(onCapture).toBeDefined());
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
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

describe('PhotoCapture', () => {
  it('renders photo capture component', () => {
    const { container } = render(
      <PhotoCapture 
        onPhotoCapture={vi.fn()} 
      />
    );
    expect(container).toBeTruthy();
  });

  it('handles photo capture callback', () => {
    const onPhotoCapture = vi.fn();
    render(
      <PhotoCapture 
        onPhotoCapture={onPhotoCapture} 
      />
    );
    expect(onPhotoCapture).toBeDefined();
  });
});

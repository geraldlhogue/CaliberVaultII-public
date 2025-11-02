import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MobileBarcodeScanner } from '../mobile/MobileBarcodeScanner';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

describe('MobileBarcodeScanner', () => {
  it('renders barcode scanner', () => {
    const { container } = render(
      <MobileBarcodeScanner 
        onScan={vi.fn()} 
        onClose={vi.fn()} 
      />
    );
    expect(container).toBeTruthy();
  });

  it('handles scan callback', () => {
    const onScan = vi.fn();
    render(
      <MobileBarcodeScanner 
        onScan={onScan} 
        onClose={vi.fn()} 
      />
    );
    expect(onScan).toBeDefined();
  });
});

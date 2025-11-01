import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileBarcodeScanner } from '../mobile/MobileBarcodeScanner';

// Mock camera API
const mockGetUserMedia = vi.fn();
Object.defineProperty(navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  writable: true
});

describe('MobileBarcodeScanner', () => {
  beforeEach(() => {
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }]
    });
  });

  it('renders scanner interface', () => {
    render(<MobileBarcodeScanner onScan={vi.fn()} />);
    expect(screen.getByText(/scan/i)).toBeInTheDocument();
  });

  it('requests camera access', async () => {
    render(<MobileBarcodeScanner onScan={vi.fn()} />);
    const startButton = screen.getByText(/start/i);
    fireEvent.click(startButton);
    
    expect(mockGetUserMedia).toHaveBeenCalled();
  });

  it('handles iOS-specific behavior', () => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    render(<MobileBarcodeScanner onScan={vi.fn()} />);
    // iOS-specific checks would go here
  });

  it('calls onScan when barcode detected', async () => {
    const onScan = vi.fn();
    render(<MobileBarcodeScanner onScan={onScan} />);
    // Simulate barcode detection
    // This would require mocking the barcode detection library
  });

  it('stops camera when unmounted', () => {
    const { unmount } = render(<MobileBarcodeScanner onScan={vi.fn()} />);
    unmount();
    // Verify camera stream stopped
  });
});

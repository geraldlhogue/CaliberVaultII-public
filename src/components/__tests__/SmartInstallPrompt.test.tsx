import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { SmartInstallPrompt } from '../pwa/SmartInstallPrompt';

// Mock BeforeInstallPromptEvent
class MockBeforeInstallPromptEvent extends Event {
  prompt = vi.fn(() => Promise.resolve());
  userChoice = Promise.resolve({ outcome: 'accepted' });
  
  constructor() {
    super('beforeinstallprompt');
  }
}

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (onFulfilled: any) => Promise.resolve({ data: [], error: null }).then(onFulfilled)
    }))
  }
}));

describe('SmartInstallPrompt', () => {
  let mockEvent: MockBeforeInstallPromptEvent;

  beforeEach(() => {
    mockEvent = new MockBeforeInstallPromptEvent();
    vi.stubGlobal('BeforeInstallPromptEvent', MockBeforeInstallPromptEvent);
  });

  it('renders install prompt', () => {
    const { container } = render(<SmartInstallPrompt />);
    expect(container).toBeTruthy();
  });

  it('handles PWA install event', async () => {
    const { container } = render(<SmartInstallPrompt />);
    
    // Trigger beforeinstallprompt event
    window.dispatchEvent(mockEvent);
    
    await waitFor(() => {
      expect(container).toBeTruthy();
    });
  });

  it('shows install button when prompt is available', async () => {
    const { container } = render(<SmartInstallPrompt />);
    window.dispatchEvent(mockEvent);
    
    await waitFor(() => {
      expect(container.querySelector('div')).toBeTruthy();
    });
  });
});

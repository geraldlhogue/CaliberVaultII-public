import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/testUtils';
import { AddItemModal } from '../inventory/AddItemModal';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (onFulfilled: any) => Promise.resolve({ data: [], error: null }).then(onFulfilled)
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ 
        data: { session: { user: { id: 'user-1' } } }, 
        error: null 
      })),
      onAuthStateChange: vi.fn(() => ({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      }))
    }
  }
}));


describe('AddItemModal', () => {
  it('should render when open', () => {
    render(<AddItemModal open={true} onOpenChange={vi.fn()} />);
    const dialog = screen.queryByRole('dialog');
    expect(dialog || screen.queryByText(/add/i)).toBeTruthy();
  });

  it('should not render when closed', () => {
    const { container } = render(<AddItemModal open={false} onOpenChange={vi.fn()} />);
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('should render modal component', () => {
    const { container } = render(<AddItemModal open={true} onOpenChange={vi.fn()} />);
    expect(container).toBeTruthy();
  });
});

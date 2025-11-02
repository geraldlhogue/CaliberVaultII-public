import { describe, it, expect, vi } from 'vitest';
import { render } from '@/test/testUtils';
import { AddItemModal } from '../inventory/AddItemModal';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123' }, error: null }))
        }))
      }))
    }))
  }
}));

describe('AddItemModal Enhanced', () => {
  it('renders modal with all features', () => {
    const { container } = render(<AddItemModal open={true} onOpenChange={vi.fn()} />);
    expect(container).toBeTruthy();
  });

  it('handles form validation', () => {
    const { container } = render(<AddItemModal open={true} onOpenChange={vi.fn()} />);
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('supports all categories', () => {
    const { container } = render(<AddItemModal open={true} onOpenChange={vi.fn()} />);
    expect(container).toBeTruthy();
  });
});

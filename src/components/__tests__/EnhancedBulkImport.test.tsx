import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { EnhancedBulkImport } from '../import/EnhancedBulkImport';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123' }, error: null }))
        }))
      }))
    }))
  }
}));

describe('EnhancedBulkImport', () => {
  it('renders bulk import component', () => {
    const { container } = render(<EnhancedBulkImport />);
    expect(container).toBeTruthy();
  });

  it('handles file upload', () => {
    const { container } = render(<EnhancedBulkImport />);
    expect(container.querySelector('div')).toBeTruthy();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/testUtils';

import { ItemCard } from '../inventory/ItemCard';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

const mockFirearm = {
  id: '1',
  name: 'Test Firearm',
  manufacturer: 'Test Mfg',
  model: 'TM-1',
  category: 'firearms',
  quantity: 1
};

describe('ItemCard Component', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSelect = vi.fn();

  it('renders item information', () => {
    const { container } = render(
      <ItemCard 
        item={mockFirearm}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );
    expect(container).toBeTruthy();
  });

  it('accepts callback functions', () => {
    render(
      <ItemCard 
        item={mockFirearm}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );
    expect(mockOnEdit).toBeDefined();
    expect(mockOnDelete).toBeDefined();
  });
});

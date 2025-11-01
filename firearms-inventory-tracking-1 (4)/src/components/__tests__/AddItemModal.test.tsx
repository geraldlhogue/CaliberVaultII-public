import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/testUtils';
import { AddItemModal } from '../inventory/AddItemModal';

describe('AddItemModal', () => {
  it('should render when open', () => {
    render(<AddItemModal open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByText(/add new item/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    const { container } = render(<AddItemModal open={false} onOpenChange={vi.fn()} />);
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('should have category selection', () => {
    render(<AddItemModal open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByText(/category/i)).toBeInTheDocument();
  });

  it('should have name input field', () => {
    render(<AddItemModal open={true} onOpenChange={vi.fn()} />);
    const nameInputs = screen.getAllByText(/name/i);
    expect(nameInputs.length).toBeGreaterThan(0);
  });
});

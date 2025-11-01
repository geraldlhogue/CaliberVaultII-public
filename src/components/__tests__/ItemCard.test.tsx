import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemCard } from '../inventory/ItemCard';
import { mockFirearm } from '../../test/fixtures/inventory.fixtures';

describe('ItemCard Component', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSelect = vi.fn();

  it('renders item information', () => {
    render(
      <ItemCard 
        item={mockFirearm}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );
    
    expect(screen.getByText(mockFirearm.name)).toBeInTheDocument();
    expect(screen.getByText(mockFirearm.manufacturer)).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    render(
      <ItemCard 
        item={mockFirearm}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );
    
    const editButton = screen.getByLabelText(/edit/i);
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockFirearm);
  });

  it('calls onDelete when delete button clicked', () => {
    render(
      <ItemCard 
        item={mockFirearm}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );
    
    const deleteButton = screen.getByLabelText(/delete/i);
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockFirearm.id);
  });

  it('displays item image when available', () => {
    const itemWithImage = { ...mockFirearm, image_url: 'https://example.com/img.jpg' };
    render(
      <ItemCard 
        item={itemWithImage}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', itemWithImage.image_url);
  });
});

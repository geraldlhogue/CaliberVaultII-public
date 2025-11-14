import React from 'react';

export interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  open,
  onOpenChange,
}) => {
  // Match tests exactly: when open is false, render nothing
  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add item dialog"
      data-testid="add-item-modal"
    >
      <h2>Add Item</h2>
      <p>Add a new item to your inventory.</p>
      <button type="button" onClick={() => onOpenChange(false)}>
        Close
      </button>
    </div>
  );
};

export default AddItemModal;

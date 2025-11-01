import React, { useState } from 'react';
import { ItemCategory } from '@/types/inventory';

interface QueuedItem {
  id: string;
  upc?: string;
  manufacturer?: string;
  model?: string;
  name?: string;
  description?: string;
  purchasePrice?: number;
  category?: ItemCategory;
  caliber?: string;
  images?: string[];
  quantity?: number;
  storageLocation?: string;
  serialNumber?: string;
}

interface QueuedItemCardProps {
  item: QueuedItem;
  onUpdate: (updates: Partial<QueuedItem>) => void;
  onRemove: () => void;
}

export const QueuedItemCard: React.FC<QueuedItemCardProps> = ({ item, onUpdate, onRemove }) => {
  const [editing, setEditing] = useState(false);

  return (
    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="text-white font-semibold">{item.name || item.upc || 'Unknown Item'}</p>
          <p className="text-slate-400 text-sm">{item.manufacturer} {item.model}</p>
          {item.upc && <p className="text-slate-500 text-xs">UPC: {item.upc}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {editing ? '✓' : '✏️'}
          </button>
          <button
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            🗑️
          </button>
        </div>
      </div>

      {editing && (
        <div className="space-y-2 mt-3 pt-3 border-t border-slate-700">
          <input
            type="text"
            placeholder="Name"
            value={item.name || ''}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Manufacturer"
              value={item.manufacturer || ''}
              onChange={(e) => onUpdate({ manufacturer: e.target.value })}
              className="bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 text-sm"
            />
            <input
              type="text"
              placeholder="Model"
              value={item.model || ''}
              onChange={(e) => onUpdate({ model: e.target.value })}
              className="bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Price"
              value={item.purchasePrice || ''}
              onChange={(e) => onUpdate({ purchasePrice: parseFloat(e.target.value) })}
              className="bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 text-sm"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={item.quantity || 1}
              onChange={(e) => onUpdate({ quantity: parseInt(e.target.value) })}
              className="bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 text-sm"
            />
          </div>
          <input
            type="text"
            placeholder="Serial Number"
            value={item.serialNumber || ''}
            onChange={(e) => onUpdate({ serialNumber: e.target.value })}
            className="w-full bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 text-sm"
          />
          <input
            type="text"
            placeholder="Storage Location"
            value={item.storageLocation || ''}
            onChange={(e) => onUpdate({ storageLocation: e.target.value })}
            className="w-full bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 text-sm"
          />
        </div>
      )}
    </div>
  );
};

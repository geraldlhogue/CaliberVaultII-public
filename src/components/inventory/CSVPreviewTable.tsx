import React from 'react';
import { InventoryItem } from '@/types/inventory';
import { ValidationWarning } from '@/utils/csvValidator';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface CSVPreviewTableProps {
  items: Partial<InventoryItem>[];
  warnings: ValidationWarning[];
  onEdit: (index: number, field: keyof InventoryItem, value: any) => void;
}

export const CSVPreviewTable: React.FC<CSVPreviewTableProps> = ({ items, warnings, onEdit }) => {
  const getWarningsForRow = (rowIndex: number) => 
    warnings.filter(w => w.row === rowIndex);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-700 text-slate-200">
          <tr>
            <th className="p-2 text-left">#</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Manufacturer</th>
            <th className="p-2 text-left">Storage</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const rowWarnings = getWarningsForRow(idx);
            const hasErrors = rowWarnings.some(w => w.severity === 'error');
            
            return (
              <tr key={idx} className={`border-b border-slate-700 ${hasErrors ? 'bg-red-900/20' : ''}`}>
                <td className="p-2">{idx + 1}</td>
                <td className="p-2">
                  <input
                    value={item.name || ''}
                    onChange={(e) => onEdit(idx, 'name', e.target.value)}
                    className="bg-slate-700 text-white px-2 py-1 rounded w-full"
                  />
                </td>
                <td className="p-2">
                  <input
                    value={item.category || ''}
                    onChange={(e) => onEdit(idx, 'category', e.target.value)}
                    className="bg-slate-700 text-white px-2 py-1 rounded w-full"
                  />
                </td>
                <td className="p-2">{item.manufacturer || '-'}</td>
                <td className="p-2">
                  <input
                    value={item.storageLocation || ''}
                    onChange={(e) => onEdit(idx, 'storageLocation', e.target.value)}
                    className="bg-slate-700 text-white px-2 py-1 rounded w-full"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={item.purchasePrice || ''}
                    onChange={(e) => onEdit(idx, 'purchasePrice', parseFloat(e.target.value))}
                    className="bg-slate-700 text-white px-2 py-1 rounded w-24"
                  />
                </td>
                <td className="p-2">
                  {rowWarnings.length > 0 && (
                    <div className="flex items-center gap-1">
                      {hasErrors ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="text-xs">{rowWarnings.length}</span>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

import React, { useState, memo } from 'react';
import { InventoryItem } from '../../types/inventory';
import { QuickScanButton } from './QuickScanButton';
import { formatCurrency, safeNumber } from '@/lib/formatters';
import { CategoryIcon } from './CategoryIcon';

interface ItemCardProps {
  item: InventoryItem;
  onClick: () => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onQuickScan?: () => void;
}



const firearmTypeLabels: Record<string, string> = {
  'centerfire-rifle': 'Centerfire Rifle',
  'rimfire-rifle': 'Rimfire Rifle',
  'centerfire-pistol': 'Centerfire Pistol',
  'rimfire-pistol': 'Rimfire Pistol',
  'revolver': 'Revolver',
  'shotgun': 'Shotgun',
  'other': 'Other'
};

const ItemCardComponent: React.FC<ItemCardProps> = ({ item, onClick, isSelected = false, onToggleSelect, onQuickScan }) => {
  const currentValue = safeNumber(item.currentValue || item.purchasePrice);
  const purchasePrice = safeNumber(item.purchasePrice);
  const valueChange = item.currentValue ? currentValue - purchasePrice : 0;
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelect) {
      onToggleSelect(item.id);
    }
  };



  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setShowQuickActions(true)}
      onMouseLeave={() => setShowQuickActions(false)}
      className={`bg-slate-800 rounded-lg overflow-hidden border ${
        isSelected ? 'border-yellow-500 ring-2 ring-yellow-500' : 'border-slate-700 hover:border-yellow-600'
      } transition-all cursor-pointer group relative`}
    >
      {onQuickScan && showQuickActions && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <QuickScanButton onScan={onQuickScan} size="sm" />
        </div>
      )}

      {onToggleSelect && (
        <div
          onClick={handleCheckboxClick}
          className="absolute top-2 left-2 z-10"
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-4 h-4 rounded border-2 border-slate-600 bg-slate-800 checked:bg-yellow-600 checked:border-yellow-600 cursor-pointer"
          />
        </div>
      )}
      {/* ✅ CODE VERSION: OCT-25-2025 - Thumbnails optimized + Full image display */}
      <div className="aspect-[2/1] bg-slate-900 overflow-hidden relative">
        {/* Version indicator */}
        <div className="absolute top-0 left-0 bg-green-500 text-white text-[8px] px-1 py-0.5 z-20 font-bold">
          v2.1.0
        </div>



        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.name}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={(e) => {
              console.error('❌ Image failed to load:', item.images[0]);
              // Show placeholder instead of hiding
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23334155" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="40"%3E📷%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

      </div>







      {/* Reduced padding from p-4 to p-2 */}
      <div className="p-2">
        <div className="flex items-center gap-2 mb-1">
          <CategoryIcon category={item.category || ''} className="w-4 h-4 text-yellow-500" />
          <h3 className="text-white font-semibold text-sm truncate flex-1">{item.name}</h3>
        </div>
        
        {/* Show caliber and type info - smaller text */}
        <div className="flex flex-wrap gap-1 mb-1">

          {item.caliber && (
            <span className="text-xs bg-slate-700 text-yellow-500 px-1.5 py-0.5 rounded">
              {item.caliber}
            </span>
          )}
          {item.firearmSubcategory && (
            <span className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
              {firearmTypeLabels[item.firearmSubcategory]}
            </span>
          )}
          {item.ammoType && (
            <span className="text-xs bg-slate-700 text-orange-400 px-1.5 py-0.5 rounded">
              {item.ammoType}
            </span>
          )}
          {item.quantity && (
            <span className="text-xs bg-slate-700 text-blue-400 px-1.5 py-0.5 rounded">
              Qty: {item.quantity}
            </span>
          )}
        </div>
        
        <p className="text-slate-400 text-xs mb-1 truncate">{item.storageLocation}</p>

        <div className="flex justify-between items-center">
          <span className="text-yellow-600 font-bold text-sm">{formatCurrency(currentValue)}</span>
          {valueChange !== 0 && (
            <span className={`text-xs ${valueChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {valueChange > 0 ? '+' : ''}{formatCurrency(Math.abs(valueChange))}
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

// Memoized export for performance optimization
export const ItemCard = memo(ItemCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.item.currentValue === nextProps.item.currentValue &&
    prevProps.item.images?.[0] === nextProps.item.images?.[0]
  );
});

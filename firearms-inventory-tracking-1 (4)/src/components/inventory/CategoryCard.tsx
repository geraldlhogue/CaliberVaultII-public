import React from 'react';
import { ItemCategory } from '../../types/inventory';

interface CategoryCardProps {
  category: ItemCategory;
  icon: string;
  label: string;
  count: number;
  onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  icon, 
  label, 
  count, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-slate-800 hover:bg-slate-700 rounded-lg p-6 border border-slate-700 hover:border-yellow-600 transition-all text-left group"
    >
      <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-1">{label}</h3>
      <p className="text-slate-400 text-sm">{count} items</p>
    </button>
  );
};

export default CategoryCard;


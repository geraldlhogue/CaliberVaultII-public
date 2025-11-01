import React from 'react';
import { X } from 'lucide-react';

interface SimpleFilterPanelProps {
  onClose: () => void;
}

export const SimpleFilterPanel: React.FC<SimpleFilterPanelProps> = ({ onClose }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold text-lg">Filters</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>
      <p className="text-slate-400 text-sm">
        Advanced filters coming soon. Use the search bar and category cards to filter items.
      </p>
    </div>
  );
};

export default SimpleFilterPanel;

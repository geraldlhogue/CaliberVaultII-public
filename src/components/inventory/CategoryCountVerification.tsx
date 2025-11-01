import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const CategoryCountVerification: React.FC = () => {
  const { inventory } = useAppContext();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const categoryCounts = {
      firearms: inventory.filter(i => i.category === 'firearms').length,
      optics: inventory.filter(i => i.category === 'optics').length,
      ammunition: inventory.filter(i => i.category === 'ammunition').length,
      suppressors: inventory.filter(i => i.category === 'suppressors').length,
      magazines: inventory.filter(i => i.category === 'magazines').length,
      accessories: inventory.filter(i => i.category === 'accessories').length,
      reloading: inventory.filter(i => i.category === 'reloading').length,
    };
    
    setCounts(categoryCounts);
    
    console.log('=== CATEGORY COUNT VERIFICATION ===');
    console.log('Total Items:', inventory.length);
    console.log('Category Breakdown:', categoryCounts);
    console.log('Sample Items:', inventory.slice(0, 3).map(i => ({ 
      id: i.id, 
      name: i.name, 
      category: i.category 
    })));
  }, [inventory]);

  const categories = [
    { key: 'firearms', label: 'Firearms', icon: '🔫' },
    { key: 'optics', label: 'Optics', icon: '🔭' },
    { key: 'ammunition', label: 'Ammunition', icon: '🎯' },
    { key: 'suppressors', label: 'Suppressors', icon: '🔇' },
    { key: 'magazines', label: 'Magazines', icon: '📦' },
    { key: 'accessories', label: 'Accessories', icon: '🔧' },
    { key: 'reloading', label: 'Reloading', icon: '⚙️' },
  ];

  return (
    <Card className="p-6 bg-slate-800 border-slate-700">
      <h3 className="text-xl font-bold text-white mb-4">Category Count Verification</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map(cat => {
          const count = counts[cat.key] || 0;
          const status = count > 0 ? 'success' : 'warning';
          
          return (
            <div key={cat.key} className="bg-slate-900 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{cat.icon}</span>
                {status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <div className="text-slate-400 text-sm">{cat.label}</div>
              <div className="text-2xl font-bold text-white">{count}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

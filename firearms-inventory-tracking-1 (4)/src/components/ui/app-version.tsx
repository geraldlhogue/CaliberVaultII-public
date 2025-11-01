import React from 'react';
import { Badge } from '@/components/ui/badge';

export const AppVersion: React.FC = () => {
  const version = '2.1.0';
  const appName = 'CaliberVault';
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-slate-300">{appName}</span>
      <Badge variant="outline" className="text-xs">
        v{version}
      </Badge>
    </div>
  );
};
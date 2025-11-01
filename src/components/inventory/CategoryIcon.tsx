import React from 'react';
import { 
  Crosshair, 
  Zap, 
  Box, 
  Package, 
  Layers, 
  Briefcase,
  Circle,
  Target,
  Shield,
  Wrench
} from 'lucide-react';

interface CategoryIconProps {
  category: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = 'w-5 h-5' }) => {
  const categoryLower = category?.toLowerCase() || '';

  switch (categoryLower) {
    case 'firearms':
      return <Crosshair className={className} />;
    case 'ammunition':
      return <Zap className={className} />;
    case 'optics':
      return <Target className={className} />;
    case 'suppressors':
      return <Shield className={className} />;
    case 'magazines':
      return <Layers className={className} />;
    case 'accessories':
      return <Briefcase className={className} />;
    case 'reloading':
      return <Wrench className={className} />;
    case 'powder':
      return <Box className={className} />;
    case 'primers':
      return <Circle className={className} />;
    case 'bullets':
      return <Target className={className} />;
    case 'cases':
      return <Package className={className} />;
    default:
      return <Package className={className} />;
  }
};

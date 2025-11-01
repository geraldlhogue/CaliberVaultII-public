import React from 'react';
import { Button } from '@/components/ui/button';
import { ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickScanButtonProps {
  onScan: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function QuickScanButton({ 
  onScan, 
  variant = 'outline', 
  size = 'sm',
  className,
  showLabel = true 
}: QuickScanButtonProps) {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        onScan();
      }}
      variant={variant}
      size={size}
      className={cn('gap-2', className)}
      title="Quick scan barcode"
    >
      <ScanLine className="h-4 w-4" />
      {showLabel && size !== 'icon' && 'Scan'}
    </Button>
  );
}

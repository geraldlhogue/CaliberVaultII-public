// Bottom Sheet Component
import { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  snapPoints?: number[];
}

export function BottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children,
  snapPoints = [0.5, 0.9]
}: BottomSheetProps) {
  const [height, setHeight] = useState(snapPoints[0]);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    const newHeight = height + (diff / window.innerHeight);
    
    if (newHeight >= 0.3 && newHeight <= 0.95) {
      setHeight(newHeight);
    }
  };

  const handleTouchEnd = () => {
    const closest = snapPoints.reduce((prev, curr) => 
      Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev
    );
    
    if (closest < 0.3) {
      onClose();
    } else {
      setHeight(closest);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-background rounded-t-3xl shadow-2xl',
          'transition-transform duration-300'
        )}
        style={{ height: `${height * 100}vh` }}
      >
        {/* Handle */}
        <div
          className="w-full py-4 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1 bg-muted rounded-full mx-auto" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-6 pb-4 flex items-center justify-between border-b">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button onClick={onClose} className="p-2">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto h-full px-6 py-4">
          {children}
        </div>
      </div>
    </>
  );
}

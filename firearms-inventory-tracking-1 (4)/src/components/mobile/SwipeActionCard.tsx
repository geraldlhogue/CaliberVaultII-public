// Swipe Action Card Component
import { ReactNode, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Trash2, Edit, Share2 } from 'lucide-react';

interface SwipeAction {
  icon: ReactNode;
  label: string;
  color: string;
  onAction: () => void;
}

interface SwipeActionCardProps {
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  className?: string;
}

export function SwipeActionCard({ 
  children, 
  onEdit, 
  onDelete, 
  onShare,
  className 
}: SwipeActionCardProps) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);

  const actions: SwipeAction[] = [
    onShare && { icon: <Share2 className="h-5 w-5" />, label: 'Share', color: 'bg-blue-500', onAction: onShare },
    onEdit && { icon: <Edit className="h-5 w-5" />, label: 'Edit', color: 'bg-yellow-500', onAction: onEdit },
    onDelete && { icon: <Trash2 className="h-5 w-5" />, label: 'Delete', color: 'bg-red-500', onAction: onDelete },
  ].filter(Boolean) as SwipeAction[];

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    
    if (diff < 0 && diff > -200) {
      setOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (offset < -100) {
      setOffset(-150);
    } else {
      setOffset(0);
    }
  };

  const handleAction = (action: SwipeAction) => {
    action.onAction();
    setOffset(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Action Buttons */}
      <div className="absolute right-0 top-0 bottom-0 flex">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => handleAction(action)}
            className={cn(
              'w-16 flex flex-col items-center justify-center text-white',
              action.color
            )}
          >
            {action.icon}
            <span className="text-xs mt-1">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Card Content */}
      <div
        className={cn('transition-transform', className)}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

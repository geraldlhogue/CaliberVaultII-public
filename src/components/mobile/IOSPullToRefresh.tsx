import React from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { RefreshCw } from 'lucide-react';

interface Props {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function IOSPullToRefresh({ onRefresh, children }: Props) {
  const { isPulling, pullDistance, isRefreshing, pullProgress } = usePullToRefresh({
    onRefresh,
    threshold: 80,
  });

  // Trigger haptic feedback when threshold is reached
  React.useEffect(() => {
    if (pullProgress >= 100 && !isRefreshing && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [pullProgress, isRefreshing]);

  return (
    <div className="relative">
      {/* Pull to refresh indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 ease-out overflow-hidden"
        style={{
          height: isPulling || isRefreshing ? `${Math.min(pullDistance, 80)}px` : '0px',
          opacity: isPulling || isRefreshing ? 1 : 0,
        }}
      >
        <div className="flex flex-col items-center gap-2 py-2">
          <div
            className={`transition-transform duration-200 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: isRefreshing ? 'rotate(0deg)' : `rotate(${pullProgress * 3.6}deg)`,
            }}
          >
            <RefreshCw 
              className="h-6 w-6 text-blue-500" 
              strokeWidth={2.5}
            />
          </div>
          <p className="text-xs text-slate-600 font-medium">
            {isRefreshing
              ? 'Refreshing...'
              : pullProgress >= 100
              ? 'Release to refresh'
              : 'Pull to refresh'}
          </p>
        </div>
      </div>

      {/* Content with padding when pulling */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: isPulling || isRefreshing 
            ? `translateY(${Math.min(pullDistance, 80)}px)` 
            : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedPullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

export function EnhancedPullToRefresh({ 
  onRefresh, 
  children, 
  disabled = false 
}: EnhancedPullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'refreshing' | 'success' | 'error'>('idle');
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const threshold = 80;
  const resistance = 2.5;

  useEffect(() => {
    if (disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && !isRefreshing) {
        setStartY(e.touches[0].clientY);
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = (currentY - startY) / resistance;

      if (distance > 0 && window.scrollY === 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, threshold * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        setRefreshStatus('refreshing');
        
        // Haptic feedback on iOS
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }

        try {
          await onRefresh();
          setRefreshStatus('success');
          
          // Show success state for 1 second
          setTimeout(() => {
            setRefreshStatus('idle');
            setIsRefreshing(false);
          }, 1000);
        } catch (error) {
          console.error('Refresh failed:', error);
          setRefreshStatus('error');
          
          // Show error state for 2 seconds
          setTimeout(() => {
            setRefreshStatus('idle');
            setIsRefreshing(false);
          }, 2000);
        }
      }
      
      setIsPulling(false);
      if (!isRefreshing) {
        setPullDistance(0);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, isRefreshing, startY, onRefresh, disabled]);

  const pullProgress = Math.min((pullDistance / threshold) * 100, 100);
  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div className="relative">
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex justify-center transition-all duration-300 z-50",
          showIndicator ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{
          transform: `translateY(${isRefreshing ? 20 : pullDistance - 40}px)`,
        }}
      >
        <div className="bg-white dark:bg-slate-800 rounded-full shadow-lg p-3">
          {refreshStatus === 'success' ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : refreshStatus === 'error' ? (
            <XCircle className="w-6 h-6 text-red-500" />
          ) : (
            <RefreshCw 
              className={cn(
                "w-6 h-6 transition-transform",
                isRefreshing ? "animate-spin text-blue-500" : "text-slate-600"
              )}
              style={{
                transform: !isRefreshing ? `rotate(${pullProgress * 3.6}deg)` : undefined,
              }}
            />
          )}
        </div>
      </div>

      {/* Progress bar */}
      {showIndicator && !isRefreshing && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700">
          <div 
            className="h-full bg-blue-500 transition-all duration-100"
            style={{ width: `${pullProgress}%` }}
          />
        </div>
      )}

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: showIndicator && !isRefreshing ? `translateY(${pullDistance}px)` : 'translateY(0)',
        }}
      >
        {children}
      </div>

      {/* Status message */}
      {refreshStatus !== 'idle' && (
        <div className={cn(
          "fixed top-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300",
          refreshStatus === 'refreshing' && "bg-blue-500 text-white",
          refreshStatus === 'success' && "bg-green-500 text-white",
          refreshStatus === 'error' && "bg-red-500 text-white"
        )}>
          {refreshStatus === 'refreshing' && 'Refreshing data...'}
          {refreshStatus === 'success' && 'Data refreshed successfully!'}
          {refreshStatus === 'error' && 'Failed to refresh. Please try again.'}
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function IOSSafeArea({ children, className = '' }: Props) {
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    // Detect iOS safe area insets
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // Get CSS safe area insets
      const computedStyle = getComputedStyle(document.documentElement);
      
      setSafeAreaInsets({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
      });
    }
  }, []);

  return (
    <div
      className={className}
      style={{
        paddingTop: `max(env(safe-area-inset-top), ${safeAreaInsets.top}px)`,
        paddingRight: `max(env(safe-area-inset-right), ${safeAreaInsets.right}px)`,
        paddingBottom: `max(env(safe-area-inset-bottom), ${safeAreaInsets.bottom}px)`,
        paddingLeft: `max(env(safe-area-inset-left), ${safeAreaInsets.left}px)`,
      }}
    >
      {children}
    </div>
  );
}

// Touch-Optimized Button Component
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TouchOptimizedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  haptic?: 'light' | 'medium' | 'heavy';
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const TouchOptimizedButton = forwardRef<HTMLButtonElement, TouchOptimizedButtonProps>(
  ({ className, haptic = 'medium', variant = 'default', size = 'md', onClick, children, ...props }, ref) => {
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      const isNative = typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
      
      if (isNative) {
        try {
          const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
          const style = haptic === 'light' ? ImpactStyle.Light : 
                        haptic === 'heavy' ? ImpactStyle.Heavy : 
                        ImpactStyle.Medium;
          await Haptics.impact({ style });
        } catch {}
      }

      onClick?.(e);
    };

    const variantStyles = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    };

    const sizeStyles = {
      sm: 'min-h-[44px] px-4 text-sm',
      md: 'min-h-[48px] px-6 text-base',
      lg: 'min-h-[56px] px-8 text-lg',
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium',
          'transition-colors focus-visible:outline-none focus-visible:ring-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-95 transition-transform',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TouchOptimizedButton.displayName = 'TouchOptimizedButton';

import { useCallback } from 'react';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [30, 100, 30, 100, 30],
};

export function useHapticFeedback() {
  const trigger = useCallback((pattern: HapticPattern = 'light') => {
    if ('vibrate' in navigator) {
      const vibrationPattern = HAPTIC_PATTERNS[pattern];
      navigator.vibrate(vibrationPattern);
    }
  }, []);

  const triggerCustom = useCallback((duration: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }, []);

  const isSupported = 'vibrate' in navigator;

  return {
    trigger,
    triggerCustom,
    isSupported,
  };
}

/**
 * Automated Error Recovery System
 * Attempts to recover from common error scenarios
 */

import { toast } from 'sonner';
import { logError } from './errorHandler';

interface RecoveryStrategy {
  errorPattern: RegExp;
  recover: () => Promise<boolean>;
  description: string;
}

const recoveryStrategies: RecoveryStrategy[] = [
  {
    errorPattern: /network|fetch|timeout/i,
    description: 'Network connectivity issue',
    recover: async () => {
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      return navigator.onLine;
    }
  },
  {
    errorPattern: /session|auth|unauthorized/i,
    description: 'Authentication issue',
    recover: async () => {
      // Attempt to refresh session
      try {
        const { supabase } = await import('./supabase');
        const { data } = await supabase.auth.refreshSession();
        return !!data.session;
      } catch {
        return false;
      }
    }
  },
  {
    errorPattern: /storage|quota|disk/i,
    description: 'Storage quota exceeded',
    recover: async () => {
      // Clear old cache data
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
        toast.success('Cleared cache to free up space');
        return true;
      } catch {
        return false;
      }
    }
  }
];

export async function attemptErrorRecovery(error: Error): Promise<boolean> {
  const errorMessage = error.message.toLowerCase();
  
  for (const strategy of recoveryStrategies) {
    if (strategy.errorPattern.test(errorMessage)) {
      try {
        toast.info(`Attempting recovery: ${strategy.description}`);
        const recovered = await strategy.recover();
        
        if (recovered) {
          toast.success('Recovery successful! Please try again.');
          logError(new Error('Recovery successful'), {
            originalError: error.message,
            strategy: strategy.description
          });
          return true;
        }
      } catch (recoveryError: any) {
        logError(recoveryError, {
          context: 'Error recovery failed',
          originalError: error.message,
          strategy: strategy.description
        });
      }
    }
  }
  
  return false;
}

export function registerRecoveryStrategy(strategy: RecoveryStrategy) {
  recoveryStrategies.push(strategy);
}

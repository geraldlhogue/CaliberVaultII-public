/**
 * Comprehensive Error Handler for all I/O operations
 * Provides consistent error handling, logging, and user notifications
 */

import { toast } from '@/components/ui/use-toast';
import { getUserFriendlyError, logError } from './errorMessages';

export interface OperationContext {
  operation: string;
  component?: string;
  data?: any;
  userId?: string;
}

export interface ErrorResult {
  success: false;
  error: Error;
  userMessage: string;
  technicalMessage: string;
  context: OperationContext;
}

export interface SuccessResult<T = any> {
  success: true;
  data: T;
}

export type Result<T = any> = SuccessResult<T> | ErrorResult;

class ErrorHandler {
  /**
   * Wraps async operations with comprehensive error handling
   */
  async handleOperation<T>(
    operation: () => Promise<T>,
    context: OperationContext
  ): Promise<Result<T>> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error: any) {
      return this.handleError(error, context);
    }
  }

  /**
   * Handles errors with logging and user notification
   */
  private handleError(error: any, context: OperationContext): ErrorResult {
    const friendlyError = getUserFriendlyError(error);
    
    // Log error with full context
    this.logDetailedError(error, context);
    
    // Show user notification
    this.notifyUser(friendlyError);
    
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      userMessage: friendlyError.message,
      technicalMessage: error.message || String(error),
      context
    };
  }

  /**
   * Logs detailed error information
   */
  private logDetailedError(error: any, context: OperationContext) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      operation: context.operation,
      component: context.component,
      userId: context.userId,
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      },
      dataState: context.data,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    console.error('❌ Operation Failed:', errorLog);
    
    // Send to external monitoring
    logError(error, context.operation);
    
    // Store in local error log
    this.storeErrorLog(errorLog);
  }

  /**
   * Stores error in local storage for diagnostics
   */
  private storeErrorLog(errorLog: any) {
    try {
      const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      logs.unshift(errorLog);
      // Keep last 50 errors
      if (logs.length > 50) logs.length = 50;
      localStorage.setItem('error_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to store error log:', e);
    }
  }

  /**
   * Shows user-friendly notification
   */
  private notifyUser(friendlyError: ReturnType<typeof getUserFriendlyError>) {
    toast({
      variant: 'destructive',
      title: friendlyError.title,
      description: friendlyError.message,
      duration: 5000
    });
  }

  /**
   * Gets stored error logs for diagnostics
   */
  getErrorLogs(): any[] {
    try {
      return JSON.parse(localStorage.getItem('error_logs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clears error logs
   */
  clearErrorLogs() {
    localStorage.removeItem('error_logs');
  }
}

export const errorHandler = new ErrorHandler();

/**
 * Convenience function for wrapping operations
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: OperationContext
): Promise<Result<T>> {
  return errorHandler.handleOperation(operation, context);
}

/**
 * Export logError function for direct use
 */
export { logError } from './errorMessages';

/**
 * Get error logs
 */
export function getErrorLogs(): any[] {
  return errorHandler.getErrorLogs();
}

/**
 * Clear error logs
 */
export function clearErrorLogs() {
  errorHandler.clearErrorLogs();
}

/**
 * Export error logs as CSV
 */
export function exportErrorLogs(): string {
  const logs = getErrorLogs();
  const headers = ['Timestamp', 'Operation', 'Component', 'Error', 'User Agent'];
  const rows = logs.map(log => [
    log.timestamp,
    log.operation,
    log.component || '',
    log.error?.message || '',
    log.userAgent
  ]);
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  return csv;
}

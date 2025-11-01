import { ErrorInfo } from 'react';

export interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
  errorType: 'runtime' | 'network' | 'auth' | 'validation' | 'unknown';
}

class ErrorLoggingService {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  logError(
    error: Error,
    errorInfo?: ErrorInfo,
    errorType: ErrorLog['errorType'] = 'runtime'
  ) {
    const log: ErrorLog = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorType,
    };

    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', log);
    }

    // Send to external service in production
    this.sendToMonitoring(log);
  }

  private sendToMonitoring(log: ErrorLog) {
    // Integrate with Sentry, LogRocket, etc.
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(new Error(log.message), {
        contexts: {
          error: log,
        },
      });
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const errorLogger = new ErrorLoggingService();

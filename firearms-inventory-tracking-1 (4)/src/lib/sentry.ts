// Sentry error tracking wrapper with safe initialization
export const initSentry = () => {
  // Check if Sentry is available and can be loaded
  try {
    // Dynamically import Sentry only if available
    import('@sentry/react').then((Sentry) => {
      const sentryDSN = import.meta.env.VITE_SENTRY_DSN;
      const isProduction = import.meta.env.PROD;
      
      if (!sentryDSN) {
        console.log('Sentry DSN not configured. Error reporting disabled.');
        return;
      }

      Sentry.init({
        dsn: sentryDSN,
        enabled: !!sentryDSN,
        environment: isProduction ? 'production' : 'development',
        
        // Performance Monitoring
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
          }),
        ],
        
        // Performance traces
        tracesSampleRate: isProduction ? 0.1 : 1.0,
        
        // Session Replay
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        
        // Error filtering
        beforeSend(event, hint) {
          // Filter out non-critical errors
          if (event.exception) {
            const error = hint.originalException;
            if (error instanceof Error) {
              // Ignore network errors and third-party errors
              if (error.message.includes('NetworkError') || 
                  error.message.includes('Failed to fetch') ||
                  error.message.includes('.open is not a function') ||
                  error.message.includes('postMessage')) {
                return null;
              }
            }
          }
          return event;
        },
      });
      
      console.log('Sentry initialized successfully');
    }).catch((error) => {
      console.log('Sentry not available, continuing without error tracking');
    });
  } catch (error) {
    console.log('Sentry initialization skipped');
  }
};

// Safe error reporting wrapper
export const reportError = (error: Error, context?: Record<string, any>) => {
  try {
    import('@sentry/react').then((Sentry) => {
      Sentry.captureException(error, {
        contexts: { custom: context },
      });
    }).catch(() => {
      console.error('Error reporting failed:', error, context);
    });
  } catch {
    console.error('Error:', error, context);
  }
};

// Safe performance monitoring
export const startTransaction = (name: string, op: string) => {
  try {
    import('@sentry/react').then((Sentry) => {
      return Sentry.startTransaction({ name, op });
    });
  } catch {
    // Silently fail
  }
};

// Safe user context
export const setUserContext = (user: { id: string; email?: string; username?: string }) => {
  try {
    import('@sentry/react').then((Sentry) => {
      Sentry.setUser(user);
    });
  } catch {
    // Silently fail
  }
};

// Safe clear user context
export const clearUserContext = () => {
  try {
    import('@sentry/react').then((Sentry) => {
      Sentry.setUser(null);
    });
  } catch {
    // Silently fail
  }
};

// Safe breadcrumb
export const addBreadcrumb = (message: string, category: string, level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info') => {
  try {
    import('@sentry/react').then((Sentry) => {
      Sentry.addBreadcrumb({
        message,
        category,
        level,
        timestamp: Date.now() / 1000,
      });
    });
  } catch {
    console.log(`[${category}] ${message}`);
  }
};

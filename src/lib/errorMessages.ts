/**
 * Maps technical error codes and messages to user-friendly descriptions
 */

export interface ErrorDetails {
  title: string;
  message: string;
  action?: string;
}

export function getUserFriendlyError(error: any): ErrorDetails {
  // PostgreSQL error codes
  if (error.code === '23505') {
    return {
      title: 'Duplicate Entry',
      message: 'This item already exists in your inventory.',
      action: 'Try editing the existing item instead.'
    };
  }

  if (error.code === '23503') {
    return {
      title: 'Invalid Reference',
      message: 'The referenced item could not be found.',
      action: 'Please refresh and try again.'
    };
  }

  if (error.code === '42501') {
    return {
      title: 'Permission Denied',
      message: 'You do not have permission to perform this action.',
      action: 'Contact your administrator if you believe this is an error.'
    };
  }

  // Authentication errors
  if (error.message?.includes('JWT') || error.message?.includes('token')) {
    return {
      title: 'Session Expired',
      message: 'Your session has expired. Please log in again.',
      action: 'Click here to log in'
    };
  }

  if (error.message?.includes('Invalid login credentials')) {
    return {
      title: 'Login Failed',
      message: 'The email or password you entered is incorrect.',
      action: 'Please try again or reset your password.'
    };
  }

  // Network errors
  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      action: 'Try again when online.'
    };
  }

  // Validation errors
  if (error.message?.includes('violates check constraint')) {
    return {
      title: 'Invalid Data',
      message: 'The data you entered does not meet the required format.',
      action: 'Please check all fields and try again.'
    };
  }

  // File upload errors
  if (error.message?.includes('payload too large')) {
    return {
      title: 'File Too Large',
      message: 'The file you are trying to upload is too large.',
      action: 'Please use a smaller file (max 10MB).'
    };
  }

  // Subscription errors
  if (error.message?.includes('subscription') || error.message?.includes('trial')) {
    return {
      title: 'Subscription Required',
      message: 'This feature requires an active subscription.',
      action: 'Upgrade your plan to continue.'
    };
  }

  // Default error
  return {
    title: 'Something Went Wrong',
    message: error.message || 'An unexpected error occurred.',
    action: 'Please try again. If the problem persists, contact support.'
  };
}

export function logError(error: any, context?: string) {
  const errorDetails = getUserFriendlyError(error);
  
  console.error('Error occurred:', {
    context,
    technical: error,
    userFriendly: errorDetails,
    timestamp: new Date().toISOString()
  });

  // Send to monitoring service in production
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Integration point for Sentry, LogRocket, etc.
    if ((window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          error: errorDetails,
          context
        }
      });
    }
  }
}

export type ErrorCategory =
  | 'network'
  | 'database'
  | 'validation'
  | 'auth'
  | 'generic';

export interface CategorizedError {
  type: ErrorCategory;
  message: string;
  original?: unknown;
  context?: Record<string, unknown>;
}

/**
 * Central error handler used in both app code and tests.
 * The tests expect:
 *  - `ErrorHandler` to be a constructor (class)
 *  - instances to have `.log()` and `.categorize()` methods
 */
export class ErrorHandler {
  log(message: string, meta?: Record<string, unknown>): void {
    try {
      // Keep logging side-effect simple and resilient
      if (typeof console !== 'undefined' && console.error) {
        console.error('[ErrorHandler]', message, meta ?? {});
      }
    } catch {
      // Never let logging throw in tests
    }
  }

  categorize(error: unknown): ErrorCategory {
    const message =
      error instanceof Error ? error.message : String(error ?? '');
    const lower = message.toLowerCase();

    if (
      lower.includes('network') ||
      lower.includes('fetch') ||
      lower.includes('timeout')
    ) {
      return 'network';
    }

    if (
      lower.includes('database') ||
      lower.includes('db') ||
      lower.includes('sql')
    ) {
      return 'database';
    }

    if (
      lower.includes('validation') ||
      lower.includes('invalid') ||
      lower.includes('schema')
    ) {
      return 'validation';
    }

    if (
      lower.includes('auth') ||
      lower.includes('unauthorized') ||
      lower.includes('forbidden')
    ) {
      return 'auth';
    }

    return 'generic';
  }

  handle(
    error: unknown,
    context?: Record<string, unknown>
  ): CategorizedError {
    const type = this.categorize(error);
    const message =
      error instanceof Error ? error.message : String(error ?? 'Unknown error');

    this.log(message, { ...context, type });

    return {
      type,
      message,
      original: error,
      context,
    };
  }
}

// Shared singleton used by the helper function below
const defaultHandler = new ErrorHandler();

/**
 * Helper used across the codebase/tests to "handle errors gracefully".
 * It always returns a structured object and never throws.
 */
export function handleError(
  error: unknown,
  context?: Record<string, unknown>
): CategorizedError {
  return defaultHandler.handle(error, context);
}

export default ErrorHandler;

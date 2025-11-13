export type ErrorCategory = 'generic';

export interface HandledError {
  type: ErrorCategory;
  message: string;
}

export default class ErrorHandler {
  category: ErrorCategory;
  message: string;

  constructor(err?: unknown) {
    this.category = 'generic';
    this.message = ErrorHandler.extractMessage(err);
  }

  static extractMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'message' in (err as any)) {
      return String((err as any).message);
    }
    if (typeof err === 'string') return err;
    if (err == null) return 'Unknown error';
    return String(err);
  }

  categorize(): ErrorCategory {
    return this.category;
  }
}

export function handleError(err: unknown): HandledError {
  return {
    type: 'generic',
    message: ErrorHandler.extractMessage(err),
  };
}

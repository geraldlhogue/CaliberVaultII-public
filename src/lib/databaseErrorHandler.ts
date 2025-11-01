/**
 * Specialized error handler for database operations
 */

import { PostgrestError } from '@supabase/supabase-js';
import { withErrorHandling, OperationContext } from './errorHandler';

export interface DatabaseOperationContext extends OperationContext {
  table: string;
  action: 'select' | 'insert' | 'update' | 'delete' | 'upsert';
  recordId?: string;
}

/**
 * Wraps Supabase operations with error handling
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  context: DatabaseOperationContext
) {
  const result = await withErrorHandling(async () => {
    const { data, error } = await operation();
    
    if (error) {
      // Enhance error with database context
      const enhancedError = new Error(error.message);
      (enhancedError as any).code = error.code;
      (enhancedError as any).details = error.details;
      (enhancedError as any).hint = error.hint;
      (enhancedError as any).table = context.table;
      (enhancedError as any).action = context.action;
      throw enhancedError;
    }
    
    return data;
  }, {
    ...context,
    operation: `Database ${context.action} on ${context.table}`
  });

  return result;
}

/**
 * Gets user-friendly message for database errors
 */
export function getDatabaseErrorMessage(error: PostgrestError): string {
  // Schema cache errors
  if (error.code === 'PGRST204') {
    return 'Database schema mismatch. Please contact support.';
  }
  
  // Foreign key violations
  if (error.code === '23503') {
    return 'Cannot complete operation: related record not found.';
  }
  
  // Unique constraint violations
  if (error.code === '23505') {
    return 'This record already exists.';
  }
  
  // Permission errors
  if (error.code === '42501') {
    return 'You do not have permission for this operation.';
  }
  
  // Not null violations
  if (error.code === '23502') {
    return 'Required field is missing.';
  }
  
  return error.message || 'Database operation failed';
}

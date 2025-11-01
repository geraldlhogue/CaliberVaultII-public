/**
 * Safe formatting utilities to prevent runtime errors
 * Provides fallbacks for undefined/null values
 */

/**
 * Safely format a number as currency
 * Returns $0 if value is invalid
 */
export function formatCurrency(value: any): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '$0';
  }
  
  const numValue = Number(value);
  return `$${numValue.toLocaleString('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Safely format a number with commas
 * Returns 0 if value is invalid
 */
export function formatNumber(value: any): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0';
  }
  
  const numValue = Number(value);
  return numValue.toLocaleString('en-US');
}

/**
 * Safely format a date
 * Returns 'N/A' if date is invalid
 */
export function formatDate(value: any): string {
  if (!value) return 'N/A';
  
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US');
  } catch {
    return 'N/A';
  }
}

/**
 * Safely get a numeric value
 * Returns 0 if value is invalid
 */
export function safeNumber(value: any): number {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return 0;
  }
  return Number(value);
}

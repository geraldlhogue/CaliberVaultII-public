/**
 * Safe formatting utilities to prevent toLocaleString errors
 */

export function safeNumber(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(num) ? 0 : num;
}

export function formatCurrency(value: any): string {
  const num = safeNumber(value);
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(value: any): string {
  const num = safeNumber(value);
  return num.toLocaleString('en-US');
}

export function formatPercent(value: any): string {
  const num = safeNumber(value);
  return `${num.toFixed(1)}%`;
}

export function formatDate(value: any): string {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('en-US');
  } catch {
    return String(value);
  }
}

export function formatDateTime(value: any): string {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('en-US');
  } catch {
    return String(value);
  }
}

// Safe wrapper for toLocaleString
export function safeToLocaleString(value: any): string {
  const num = safeNumber(value);
  return num.toLocaleString('en-US');
}

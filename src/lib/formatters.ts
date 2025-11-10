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
  if (num < 0) {
    return `-$${Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}


export function formatNumber(value: any, decimals?: number): string {
  const num = safeNumber(value);
  if (decimals !== undefined) {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  }
  return num.toLocaleString('en-US');
}

export function formatPercent(value: any): string {
  const num = safeNumber(value);
  return `${num.toFixed(1)}%`;
}

export function formatPercentage(value: any): string {
  const num = safeNumber(value);
  return `${(num * 100).toFixed(2)}%`;
}

export function formatDate(value: any): string {
  if (!value) return '-';
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US');
  } catch {
    return 'Invalid Date';
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

export function safeToLocaleString(value: any): string {
  const num = safeNumber(value);
  return num.toLocaleString('en-US');
}

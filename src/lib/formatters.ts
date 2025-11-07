export function formatCurrency(n: number, currency = 'USD', locale = 'en-US') {
  if (typeof n !== 'number' || Number.isNaN(n)) return '$0.00'
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(n)
}
export function formatNumber(n: number, fractionDigits = 0, locale = 'en-US') {
  if (typeof n !== 'number' || Number.isNaN(n)) return '0'
  return new Intl.NumberFormat(locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(n)
}
export function formatPercentage(v: number, fractionDigits = 2, locale = 'en-US') {
  if (typeof v !== 'number' || Number.isNaN(v)) return '0%'
  return `${formatNumber(v * 100, fractionDigits, locale)}%`
}
export function formatDate(value: string | number | Date, locale = 'en-US') {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleString(locale)
}
export default { formatCurrency, formatNumber, formatPercentage, formatDate }

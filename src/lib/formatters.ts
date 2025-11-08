import { safeNumber as sn } from './utils'
export function formatCurrency(n: number, currency='USD', locale='en-US') {
  const v = Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat(locale, { style:'currency', currency, maximumFractionDigits:2 }).format(v)
}
export function formatNumber(n:number, digits=0, locale='en-US'){
  const v = Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat(locale, { minimumFractionDigits:digits, maximumFractionDigits:digits }).format(v)
}
export function formatPercentage(v:number, digits=2, locale='en-US'){
  const pct = (Number.isFinite(v) ? v : 0) * 100
  return `${formatNumber(pct, digits, locale)}%`
}
export function formatDate(val: string|number|Date, locale='en-US'){
  const d = new Date(val); return Number.isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleString(locale)
}
export { sn as safeNumber }
export default { formatCurrency, formatNumber, formatPercentage, formatDate, safeNumber: sn }

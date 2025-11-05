
export function formatCurrency(n: number): string {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}
export function formatDate(s: string): string {
  const d = new Date(s);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toISOString().slice(0,10);
}
export function formatNumber(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
export function formatPercentage(n: number): string {
  return (n * 100).toFixed(2) + '%';
}


export function validateCSVRow(
  row: Record<string,string>,
  requiredFields: string[],
  fieldTypes?: Record<string,'number'|'string'>
): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  (requiredFields||[]).forEach((f) => {
    const v = (row?.[f] ?? '').toString().trim();
    if (!v) errors.push(`Missing required field: ${f}`);
  });
  Object.entries(fieldTypes||{}).forEach(([field, t]) => {
    const v = (row?.[field] ?? '').toString().trim();
    if (t==='number' && v && isNaN(Number(v))) errors.push(`Field ${field} must be a number`);
  });
  return errors.length ? { valid: false, errors } : { valid: true };
}
export function validateCSVHeaders(
  headers: string[],
  required: string[]
): { valid: boolean; missing?: string[] } {
  const set = new Set(headers||[]);
  const missing = (required||[]).filter(f => !set.has(f));
  return missing.length ? { valid: false, missing } : { valid: true };
}

import { CSVRow } from './csvParser';

export interface ValidationWarning {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

// Export validateCSVHeaders
export const validateCSVHeaders = (headers: string[]): boolean => {
  const requiredHeaders = ['name', 'category'];
  return requiredHeaders.every(req => 
    headers.some(h => h.toLowerCase() === req.toLowerCase())
  );
};

// Export validateCSVRow
export const validateCSVRow = (
  row: CSVRow,
  rowIndex: number,
  fieldMapping: { [key: string]: string }
): ValidationWarning[] => {
  const warnings: ValidationWarning[] = [];
  const requiredFields = ['name', 'category', 'storageLocation', 'purchasePrice'];
  
  // Check required fields
  requiredFields.forEach(field => {
    const csvField = Object.keys(fieldMapping).find(k => fieldMapping[k] === field);
    if (!csvField || !row[csvField]?.trim()) {
      warnings.push({
        row: rowIndex,
        field,
        message: `Missing required field: ${field}`,
        severity: 'error'
      });
    }
  });
  
  // Validate price
  const priceField = Object.keys(fieldMapping).find(k => fieldMapping[k] === 'purchasePrice');
  if (priceField && row[priceField]) {
    const price = parseFloat(row[priceField]);
    if (isNaN(price) || price < 0) {
      warnings.push({
        row: rowIndex,
        field: 'purchasePrice',
        message: 'Invalid price format',
        severity: 'error'
      });
    }
  }
  
  // Validate category
  const validCategories = ['firearms', 'optics', 'ammunition', 'accessories', 'parts'];
  const catField = Object.keys(fieldMapping).find(k => fieldMapping[k] === 'category');
  if (catField && row[catField] && !validCategories.includes(row[catField].toLowerCase())) {
    warnings.push({
      row: rowIndex,
      field: 'category',
      message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      severity: 'warning'
    });
  }
  
  return warnings;
};

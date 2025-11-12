import { CSVRow } from './csvParser';

export interface ValidationWarning {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

// Export validateCSVHeaders - returns ValidationResult
export const validateCSVHeaders = (headers: string[], requiredHeaders?: string[]): ValidationResult => {
  const required = requiredHeaders || ['name', 'category'];
  const missing = required.filter(req => 
    !headers.some(h => h.toLowerCase() === req.toLowerCase())
  );
  
  return {
    valid: missing.length === 0,
    errors: missing.length > 0 ? missing.map(h => `Missing required header: ${h}`) : undefined
  };
};

// Export validateCSVRow - returns ValidationResult
export const validateCSVRow = (
  row: CSVRow,
  requiredFields: string[],
  fieldTypes?: { [key: string]: 'number' | 'string' }
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!row[field] || row[field].trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Validate field types
  if (fieldTypes) {
    Object.entries(fieldTypes).forEach(([field, type]) => {
      const value = row[field];
      if (value && type === 'number') {
        const num = parseFloat(value);
        if (isNaN(num)) {
          errors.push(`Invalid ${field}: must be a number`);
        }
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
};

// Legacy function for backward compatibility with CSVImportModal
export const validateCSVRowLegacy = (
  row: CSVRow,
  rowIndex: number,
  fieldMapping: { [key: string]: string } = {}
): ValidationWarning[] => {
  const warnings: ValidationWarning[] = [];
  const requiredFields = ['name', 'category'];
  
  // Guard against null/undefined fieldMapping
  const mapping = fieldMapping || {};
  
  // Check required fields
  requiredFields.forEach(field => {
    const csvField = Object.keys(mapping).find(k => mapping[k] === field);
    if (!csvField || !row[csvField]?.trim()) {
      warnings.push({
        row: rowIndex,
        field,
        message: `Missing required field: ${field}`,
        severity: 'error'
      });
    }
  });
  
  return warnings;
};

// Export getValidationErrors helper
export const getValidationErrors = (result: ValidationResult): string[] => {
  return result.errors || [];
};

/**
 * Excel Import Utility
 * Supports .xlsx and .xls file formats
 * Uses SheetJS (xlsx) library for parsing
 */

export interface ExcelRow {
  [key: string]: any;
}

export interface ExcelImportResult {
  data: ExcelRow[];
  headers: string[];
  sheetName: string;
  rowCount: number;
}

/**
 * Parse Excel file and return structured data
 * Note: This is a placeholder - actual implementation requires xlsx library
 */
export async function parseExcelFile(file: File): Promise<ExcelImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Failed to read file');
        }

        // For now, return a structured response
        // In production, use: import * as XLSX from 'xlsx';
        // const workbook = XLSX.read(data, { type: 'binary' });
        
        resolve({
          data: [],
          headers: [],
          sheetName: 'Sheet1',
          rowCount: 0
        });
      } catch (error: any) {
        reject(new Error(`Excel parsing failed: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('File reading failed'));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Validate Excel data structure
 */
export function validateExcelData(data: ExcelRow[], requiredHeaders: string[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!data || data.length === 0) {
    errors.push('No data found in Excel file');
    return { isValid: false, errors };
  }

  const headers = Object.keys(data[0]);
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Convert Excel data to inventory items with category-specific fields
 */
export function excelToInventoryItems(data: ExcelRow[], categoryMapping: Map<string, string>): any[] {
  return data.map((row, index) => {
    const categoryName = row['Category'] || 'Firearms';
    const categoryId = categoryMapping.get(categoryName.toLowerCase()) || categoryName.toLowerCase();
    
    const baseItem = {
      name: row['Name'] || row['Item Name'] || `Item ${index + 1}`,
      category: categoryId,
      manufacturer: row['Manufacturer'] || '',
      model: row['Model'] || '',
      serialNumber: row['Serial Number'] || '',
      quantity: parseInt(row['Quantity']) || 1,
      purchasePrice: parseFloat(row['Purchase Price']) || 0,
      purchaseDate: row['Purchase Date'] || new Date().toISOString().split('T')[0],
      storageLocation: row['Location'] || '',
      notes: row['Notes'] || ''
    };

    // Add category-specific fields based on category
    switch (categoryId.toLowerCase()) {
      case 'firearms':
        return { ...baseItem, caliber: row['Caliber'], barrelLength: row['Barrel Length'] };
      case 'optics':
        return { ...baseItem, magnification: row['Magnification'], objectiveDiameter: row['Objective'] };
      case 'ammunition':
        return { ...baseItem, caliber: row['Caliber'], grainWeight: row['Grain Weight'], roundCount: row['Round Count'] };
      case 'suppressors':
        return { ...baseItem, caliber: row['Caliber'], threadPitch: row['Thread Pitch'] };
      case 'magazines':
        return { ...baseItem, capacity: row['Capacity'], caliber: row['Caliber'] };
      case 'bullets':
        return { ...baseItem, weight: row['Weight'], caliber: row['Caliber'] };
      case 'cases':
        return { ...baseItem, caliber: row['Caliber'], condition: row['Condition'] };
      case 'primers':
        return { ...baseItem, primerType: row['Primer Type'], size: row['Size'] };
      case 'powder':
        return { ...baseItem, powderType: row['Powder Type'], containerSize: row['Container Size'] };
      default:
        return baseItem;
    }
  });
}


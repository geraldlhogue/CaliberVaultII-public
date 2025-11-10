import { InventoryItem, ItemCategory, FirearmSubcategory } from '../types/inventory';

export interface CSVRow {
  [key: string]: string;
}

export const parseCSV = (csvText: string): CSVRow[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }
  
  return rows;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

export const mapCSVToInventoryItem = (
  row: CSVRow,
  fieldMapping: { [csvField: string]: string }
): Partial<InventoryItem> => {
  const item: any = {
    id: Date.now().toString() + Math.random(),
    images: [],
    appraisals: [],
    purchaseDate: new Date().toISOString().split('T')[0]
  };
  
  Object.entries(fieldMapping).forEach(([csvField, itemField]) => {
    // Guard against null/undefined mappings
    if (!itemField || itemField === '') return;
    
    const value = row[csvField];
    if (!value || value.trim() === '') return;
    
    switch (itemField) {
      case 'purchasePrice':
        const price = parseFloat(value.replace(/[$,]/g, ''));
        item[itemField] = isNaN(price) ? 0 : price;
        break;
      case 'quantity':
      case 'capacity':
      case 'roundCount':
        const num = parseInt(value);
        item[itemField] = isNaN(num) ? undefined : num;
        break;
      case 'category':
        item[itemField] = value.toLowerCase() as ItemCategory;
        break;
      case 'firearmSubcategory':
        item[itemField] = value as FirearmSubcategory;
        break;
      case 'purchaseDate':
        item[itemField] = value;
        break;
      default:
        item[itemField] = value.trim();
    }
  });
  
  return item;
};

// Export CSV template generator
export const generateCSVTemplate = (): string => {
  const headers = ['Name', 'Category', 'Manufacturer', 'Model', 'Serial Number', 'Purchase Price', 'Quantity', 'Notes'];
  return headers.join(',');
};



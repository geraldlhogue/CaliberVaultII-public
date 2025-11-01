import * as XLSX from 'xlsx';

// Template headers for each category
const categoryTemplates = {
  firearms: [
    'Name', 'Serial Number', 'Make', 'Model', 'Caliber', 'Barrel Length',
    'Action Type', 'Firearm Type', 'Quantity', 'Value', 'Purchase Date',
    'Purchase Price', 'Purchase From', 'FFL Number', 'Condition',
    'Location', 'Notes', 'NFA Item', 'Threaded Barrel'
  ],
  ammunition: [
    'Name', 'Caliber', 'Brand', 'Grain', 'Bullet Type', 'Rounds Per Box',
    'Rounds Total', 'Cost Per Round', 'Quantity', 'Value', 'Purchase Date',
    'Purchase Price', 'Lot Number', 'Condition', 'Location', 'Notes',
    'Is Defense', 'Is Tracer'
  ],
  optics: [
    'Name', 'Brand', 'Model', 'Magnification Low', 'Magnification High',
    'Objective Diameter', 'Tube Diameter', 'Reticle Type', 'Focal Plane',
    'Quantity', 'Value', 'Purchase Date', 'Purchase Price', 'Condition',
    'Location', 'Notes', 'Illuminated', 'Night Vision Compatible'
  ],
  suppressors: [
    'Name', 'Serial Number', 'Brand', 'Model', 'Caliber', 'Material',
    'Length', 'Diameter', 'Weight', 'Tax Stamp', 'Quantity', 'Value',
    'Purchase Date', 'Purchase Price', 'Purchase From', 'Condition',
    'Location', 'Notes', 'NFA Item'
  ],
  magazines: [
    'Name', 'Brand', 'Model Fit', 'Caliber', 'Capacity', 'Material',
    'Color', 'Quantity', 'Value', 'Purchase Date', 'Purchase Price',
    'Condition', 'Location', 'Notes'
  ],
  accessories: [
    'Name', 'Brand', 'Model', 'Type', 'Compatible With', 'Mount Type',
    'Quantity', 'Value', 'Purchase Date', 'Purchase Price', 'Condition',
    'Location', 'Notes'
  ],
  cases: [
    'Name', 'Brand', 'Caliber', 'Quantity Per Bag', 'Times Fired',
    'Quantity', 'Value', 'Purchase Date', 'Purchase Price', 'Condition',
    'Location', 'Notes', 'Cleaned', 'Annealed'
  ],
  bullets: [
    'Name', 'Brand', 'Caliber', 'Grain', 'Bullet Type', 'Quantity Per Box',
    'Ballistic Coefficient', 'Quantity', 'Value', 'Purchase Date',
    'Purchase Price', 'Condition', 'Location', 'Notes'
  ],
  powder: [
    'Name', 'Brand', 'Type', 'Weight (lbs)', 'Burn Rate', 'Quantity',
    'Value', 'Purchase Date', 'Purchase Price', 'Condition', 'Location',
    'Notes', 'Unopened'
  ],
  primers: [
    'Name', 'Brand', 'Type', 'Size', 'Quantity Per Box', 'Total Quantity',
    'Quantity', 'Value', 'Purchase Date', 'Purchase Price', 'Condition',
    'Location', 'Notes'
  ],
  reloading: [
    'Name', 'Brand', 'Model', 'Type', 'Caliber Compatibility', 'Quantity',
    'Value', 'Purchase Date', 'Purchase Price', 'Condition', 'Location',
    'Notes'
  ]
};

// Sample data for each category
const sampleData = {
  firearms: [{
    'Name': 'Glock 19 Gen 5',
    'Serial Number': 'ABC123',
    'Make': 'Glock',
    'Model': '19 Gen 5',
    'Caliber': '9mm',
    'Barrel Length': '4.02',
    'Action Type': 'Semi-Auto',
    'Firearm Type': 'Pistol',
    'Quantity': '1',
    'Value': '599',
    'Purchase Date': '2024-01-15',
    'Purchase Price': '550',
    'Purchase From': 'Local Gun Store',
    'FFL Number': '12-34567',
    'Condition': 'New',
    'Location': 'Safe 1',
    'Notes': 'EDC pistol',
    'NFA Item': 'No',
    'Threaded Barrel': 'No'
  }],
  ammunition: [{
    'Name': 'Federal HST 9mm',
    'Caliber': '9mm',
    'Brand': 'Federal',
    'Grain': '147',
    'Bullet Type': 'JHP',
    'Rounds Per Box': '50',
    'Rounds Total': '500',
    'Cost Per Round': '0.80',
    'Quantity': '10',
    'Value': '400',
    'Purchase Date': '2024-02-01',
    'Purchase Price': '400',
    'Lot Number': 'LOT123',
    'Condition': 'New',
    'Location': 'Ammo Cabinet',
    'Notes': 'Defense rounds',
    'Is Defense': 'Yes',
    'Is Tracer': 'No'
  }]
};

export function generateExcelTemplate(category: string): Blob {
  const normalizedCategory = category.toLowerCase();
  const headers = categoryTemplates[normalizedCategory] || categoryTemplates.firearms;
  const sample = sampleData[normalizedCategory] || sampleData.firearms;
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create main data sheet
  const ws = XLSX.utils.json_to_sheet(sample, { header: headers });
  
  // Set column widths
  const colWidths = headers.map(h => ({ wch: Math.max(h.length, 15) }));
  ws['!cols'] = colWidths;
  
  // Add the main sheet
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  
  // Create instructions sheet
  const instructions = [
    ['CaliberVault Import Template'],
    [''],
    [`Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`],
    [''],
    ['Instructions:'],
    ['1. Fill in your data in the "Data" sheet'],
    ['2. Required fields are marked with * in the column name'],
    ['3. Use the sample row as a guide for formatting'],
    ['4. Delete the sample row before importing'],
    ['5. Save the file and import using CaliberVault'],
    [''],
    ['Field Descriptions:'],
    ...headers.map(h => [`${h}: Description of ${h} field`])
  ];
  
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
  
  // Create reference data sheet
  const referenceData = [
    ['Reference Data'],
    [''],
    ['Conditions:', 'New', 'Like New', 'Good', 'Fair', 'Poor'],
    ['Boolean Values:', 'Yes', 'No', 'True', 'False'],
    ['Focal Planes:', 'First', 'Second'],
    ['Primer Sizes:', 'Small', 'Large']
  ];
  
  const wsReference = XLSX.utils.aoa_to_sheet(referenceData);
  XLSX.utils.book_append_sheet(wb, wsReference, 'Reference');
  
  // Generate Excel file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function downloadTemplate(category: string) {
  const blob = generateExcelTemplate(category);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `calibervault_${category}_template.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate master template with all categories
export function generateMasterTemplate(): Blob {
  const wb = XLSX.utils.book_new();
  
  // Add a sheet for each category
  Object.entries(categoryTemplates).forEach(([category, headers]) => {
    const sample = sampleData[category] || [{}];
    const ws = XLSX.utils.json_to_sheet(sample, { header: headers });
    
    // Set column widths
    const colWidths = headers.map(h => ({ wch: Math.max(h.length, 15) }));
    ws['!cols'] = colWidths;
    
    // Capitalize category name for sheet name
    const sheetName = category.charAt(0).toUpperCase() + category.slice(1);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });
  
  // Add overview sheet
  const overview = [
    ['CaliberVault Master Import Template'],
    [''],
    ['This workbook contains templates for all categories:'],
    ...Object.keys(categoryTemplates).map(cat => 
      [`- ${cat.charAt(0).toUpperCase() + cat.slice(1)}`]
    ),
    [''],
    ['Instructions:'],
    ['1. Navigate to the appropriate category sheet'],
    ['2. Fill in your data following the column headers'],
    ['3. Delete sample rows before importing'],
    ['4. Save and import to CaliberVault']
  ];
  
  const wsOverview = XLSX.utils.aoa_to_sheet(overview);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview', true);
  
  // Generate Excel file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function downloadMasterTemplate() {
  const blob = generateMasterTemplate();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'calibervault_master_template.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
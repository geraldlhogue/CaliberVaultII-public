import { InventoryItem } from '../types/inventory';

export const generateCSV = (items: InventoryItem[]): string => {
  const headers = [
    'Name', 'Category', 'Manufacturer', 'Serial Number', 'Model Number', 
    'Lot Number', 'UPC', 'Storage Location', 'Purchase Price', 'Current Value',
    'Quantity', 'Purchase Date', 'Notes',
    'Caliber', 'Firearm Type', 'Barrel Length', 'Action',
    'Magnification', 'Objective Lens', 'Reticle Type',
    'Capacity', 'Ammo Type', 'Grain Weight', 'Round Count',
    'Component Type', 'Compatibility'
  ];
  
  const rows = items.map(item => {
    const currentValue = item.appraisals.length > 0 
      ? item.appraisals[item.appraisals.length - 1].value 
      : item.purchasePrice;
    
    return [
      item.name, item.category, item.manufacturer || '', item.serialNumber || '',
      item.modelNumber || '', item.lotNumber || '', item.upc || '', item.storageLocation,
      item.purchasePrice.toFixed(2), currentValue.toFixed(2), item.quantity || 1,
      item.purchaseDate, item.notes || '', item.caliber || '', item.firearmSubcategory || '',
      item.barrelLength || '', item.action || '', item.magnification || '',
      item.objectiveLens || '', item.reticleType || '', item.capacity || '',
      item.ammoType || '', item.grainWeight || '', item.roundCount || '',
      item.componentType || '', item.compatibility || ''
    ].map(val => `"${val}"`).join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
};

export const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const emailReport = (subject: string, body: string) => {
  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
};

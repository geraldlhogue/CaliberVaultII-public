export const generateSampleCSV = (): string => {
  const headers = [
    'Name',
    'Category',
    'Manufacturer',
    'Serial Number',
    'Model Number',
    'Storage Location',
    'Purchase Price',
    'Purchase Date',
    'Quantity',
    'Notes',
    'Caliber',
    'Firearm Type',
    'Barrel Length',
    'Action'
  ];
  
  const sampleRows = [
    [
      'Glock 19 Gen 5',
      'firearms',
      'Glock',
      'ABC123456',
      'G19-G5',
      'Safe A - Shelf 1',
      '599.99',
      '2024-01-15',
      '1',
      'Standard black finish',
      '9mm',
      'pistol',
      '4.02"',
      'striker-fired'
    ],
    [
      'Vortex Viper PST',
      'optics',
      'Vortex',
      'VPR987654',
      'PST-416F2-A',
      'Cabinet B - Drawer 2',
      '899.99',
      '2024-02-20',
      '1',
      'First focal plane',
      '',
      '',
      '',
      ''
    ],
    [
      'Federal Premium 9mm',
      'ammunition',
      'Federal',
      '',
      'P9HST1',
      'Ammo Locker 1',
      '29.99',
      '2024-03-10',
      '50',
      '124gr HST',
      '9mm',
      '',
      '',
      ''
    ]
  ];
  
  return [headers.join(','), ...sampleRows.map(row => row.join(','))].join('\n');
};

export const downloadSampleCSV = () => {
  const csv = generateSampleCSV();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventory_import_template.csv';
  a.click();
  URL.revokeObjectURL(url);
};

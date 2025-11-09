export const mockFirearm = {
  id: 'firearm-1',
  name: 'Glock 19 Gen 5',
  category: 'firearms',
  manufacturer: 'Glock',
  model: '19 Gen 5',
  caliber: '9mm',
  serial_number: 'ABC123456',
  quantity: 1,
  purchase_price: 549.99,
  purchase_date: '2024-01-15',
  condition: 'new',
  notes: 'Test firearm for unit tests',
};

export const mockAmmunition = {
  id: 'ammo-1',
  name: 'Federal 9mm 115gr FMJ',
  category: 'ammunition',
  manufacturer: 'Federal',
  caliber: '9mm',
  bullet_weight: 115,
  quantity: 1000,
  purchase_price: 299.99,
  rounds_per_box: 50,
  notes: 'Test ammunition',
};

export const mockOptic = {
  id: 'optic-1',
  name: 'Vortex Viper PST',
  category: 'optics',
  manufacturer: 'Vortex',
  magnification: '6-24x',
  objective_lens: 50,
  quantity: 1,
  purchase_price: 899.99,
};

export const mockInventoryItems = [
  mockFirearm,
  mockAmmunition,
  mockOptic,
];

export const createMockItem = (overrides = {}) => ({
  id: `item-${Date.now()}`,
  name: 'Test Item',
  category: 'firearms',
  quantity: 1,
  purchase_price: 100,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

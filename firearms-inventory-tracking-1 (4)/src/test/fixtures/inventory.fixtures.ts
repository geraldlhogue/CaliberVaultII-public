// Test fixtures for inventory items across all 11 categories

export const mockFirearm = {
  id: 'firearm-test-1',
  name: 'Test AR-15 Rifle',
  category: 'firearms',
  manufacturer: 'Test Arms Co',
  model: 'TAC-15',
  caliber: '5.56mm',
  serial_number: 'TEST123456',
  barrel_length: 16,
  action_type: 'Semi-Auto',
  purchase_price: 1200,
  current_value: 1200,
  condition: 'excellent',
  quantity: 1,
  notes: 'Test firearm for E2E testing'
};

export const mockAmmunition = {
  id: 'ammo-test-1',
  name: 'Test 5.56 NATO Ammunition',
  category: 'ammunition',
  manufacturer: 'Test Ammo Corp',
  caliber: '5.56mm',
  grain_weight: 55,
  bullet_type: 'FMJ',
  quantity: 1000,
  rounds_per_box: 20,
  purchase_price: 0.50,
  current_value: 0.50,
  notes: 'Test ammunition for E2E testing'
};

export const mockOptic = {
  id: 'optic-test-1',
  name: 'Test Red Dot Sight',
  category: 'optics',
  manufacturer: 'Test Optics Inc',
  model: 'RDS-500',
  magnification: '1x',
  objective_lens: 30,
  reticle_type: 'Red Dot',
  tube_diameter: 30,
  purchase_price: 400,
  current_value: 400,
  quantity: 1,
  notes: 'Test optic for E2E testing'
};

export const mockMagazine = {
  id: 'mag-test-1',
  name: 'Test PMAG 30',
  category: 'magazines',
  manufacturer: 'Test Mags LLC',
  caliber: '5.56mm',
  capacity: 30,
  material: 'Polymer',
  quantity: 5,
  purchase_price: 15,
  current_value: 15,
  notes: 'Test magazine for E2E testing'
};

export const mockAccessory = {
  id: 'acc-test-1',
  name: 'Test Vertical Grip',
  category: 'accessories',
  manufacturer: 'Test Accessories',
  model: 'VG-100',
  accessory_type: 'Grip',
  material: 'Polymer',
  quantity: 2,
  purchase_price: 25,
  current_value: 25,
  notes: 'Test accessory for E2E testing'
};

export const mockSuppressor = {
  id: 'supp-test-1',
  name: 'Test Suppressor',
  category: 'suppressors',
  manufacturer: 'Test Suppressors Inc',
  model: 'TS-556',
  caliber: '5.56mm',
  material: 'Titanium',
  length: 6.5,
  diameter: 1.5,
  serial_number: 'SUPP123456',
  quantity: 1,
  purchase_price: 800,
  current_value: 800,
  notes: 'Test suppressor for E2E testing'
};

export const mockPowder = {
  id: 'powder-test-1',
  name: 'Test Powder H335',
  category: 'powder',
  manufacturer: 'Test Powder Co',
  powder_type: 'Rifle',
  weight: 1,
  unit_of_measure: 'lb',
  quantity: 2,
  purchase_price: 35,
  current_value: 35,
  notes: 'Test powder for E2E testing'
};

export const mockPrimer = {
  id: 'primer-test-1',
  name: 'Test Small Rifle Primers',
  category: 'primers',
  manufacturer: 'Test Primers Inc',
  primer_type: 'Small Rifle',
  quantity: 1000,
  purchase_price: 0.05,
  current_value: 0.05,
  notes: 'Test primers for E2E testing'
};

export const mockBullet = {
  id: 'bullet-test-1',
  name: 'Test 55gr FMJ Bullets',
  category: 'bullets',
  manufacturer: 'Test Bullets Co',
  caliber: '5.56mm',
  grain_weight: 55,
  bullet_type: 'FMJ',
  quantity: 500,
  purchase_price: 0.20,
  current_value: 0.20,
  notes: 'Test bullets for E2E testing'
};

export const mockCase = {
  id: 'case-test-1',
  name: 'Test 5.56 Brass Cases',
  category: 'cases',
  manufacturer: 'Test Cases LLC',
  caliber: '5.56mm',
  material: 'Brass',
  quantity: 500,
  times_fired: 0,
  purchase_price: 0.15,
  current_value: 0.15,
  notes: 'Test cases for E2E testing'
};

export const mockReloading = {
  id: 'reload-test-1',
  name: 'Test Reloading Press',
  category: 'reloading',
  manufacturer: 'Test Reloading Co',
  model: 'RP-1000',
  equipment_type: 'Press',
  quantity: 1,
  purchase_price: 500,
  current_value: 500,
  notes: 'Test reloading equipment for E2E testing'
};

export const allMockItems = [
  mockFirearm,
  mockAmmunition,
  mockOptic,
  mockMagazine,
  mockAccessory,
  mockSuppressor,
  mockPowder,
  mockPrimer,
  mockBullet,
  mockCase,
  mockReloading
];

export const mockUser = {
  id: 'test-user-1',
  email: 'test@calibervault.com',
  password: 'TestPassword123!'
};

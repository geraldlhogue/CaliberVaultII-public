/**
 * Test Reference Data Seeding
 * Provides consistent reference data for tests
 */

export const testCategories = [
  { id: '1', name: 'Firearms', slug: 'firearms' },
  { id: '2', name: 'Ammunition', slug: 'ammunition' },
  { id: '3', name: 'Optics', slug: 'optics' },
  { id: '4', name: 'Accessories', slug: 'accessories' },
  { id: '5', name: 'Magazines', slug: 'magazines' },
  { id: '6', name: 'Suppressors', slug: 'suppressors' },
];

export const testManufacturers = [
  { id: '1', name: 'Glock', category_id: '1' },
  { id: '2', name: 'Federal', category_id: '2' },
  { id: '3', name: 'Vortex', category_id: '3' },
];

export const testCalibers = [
  { id: '1', name: '9mm', category: 'Pistol' },
  { id: '2', name: '.223 Remington', category: 'Rifle' },
  { id: '3', name: '12 Gauge', category: 'Shotgun' },
];

export const testActions = [
  { id: '1', name: 'Semi-Auto' },
  { id: '2', name: 'Bolt Action' },
  { id: '3', name: 'Pump Action' },
];

export function seedTestReferenceData(supabaseMock: any) {
  const mockFrom = supabaseMock.from as any;
  
  mockFrom.mockImplementation((table: string) => {
    const data = {
      categories: testCategories,
      manufacturers: testManufacturers,
      calibers: testCalibers,
      actions: testActions,
    }[table] || [];

    return {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve: any) => Promise.resolve({ data, error: null }).then(resolve),
    };
  });
}

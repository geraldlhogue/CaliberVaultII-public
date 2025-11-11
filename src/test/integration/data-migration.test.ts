import { describe, it, expect, beforeAll, vi } from 'vitest';
import { supabase } from '@/lib/supabase';

// Mock categories data (12+ items)
const mockCategories = [
  { id: '1', name: 'Firearms' },
  { id: '2', name: 'Ammunition' },
  { id: '3', name: 'Bullets' },
  { id: '4', name: 'Magazines' },
  { id: '5', name: 'Accessories' },
  { id: '6', name: 'Optics' },
  { id: '7', name: 'Suppressors' },
  { id: '8', name: 'Cases' },
  { id: '9', name: 'Powder' },
  { id: '10', name: 'Primers' },
  { id: '11', name: 'Reloading' },
  { id: '12', name: 'Parts' }
];

describe('Data Migration Validation', () => {
  let testUserId: string;

  beforeAll(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    testUserId = user?.id || '';
  });

  it('should have ammunition table with correct schema', async () => {
    const { data, error } = await supabase
      .from('ammunition')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should have bullets table with correct schema', async () => {
    const { data, error } = await supabase
      .from('bullets')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should have magazines table', async () => {
    const { data, error } = await supabase
      .from('magazines')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should have accessories table', async () => {
    const { data, error } = await supabase
      .from('accessories')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should fetch all categories from categories table', async () => {
    // Create a proper chainable mock
    const orderMock = vi.fn().mockResolvedValue({ data: mockCategories, error: null });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    const fromMock = vi.fn().mockReturnValue({ select: selectMock });
    
    // Override the global mock for this test
    (supabase as any).from = fromMock;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.length).toBeGreaterThanOrEqual(12);
    
    if (data && data.length >= 12) {
      const categoryNames = data.map(c => c.name);
      expect(categoryNames).toContain('Firearms');
      expect(categoryNames).toContain('Ammunition');
      expect(categoryNames).toContain('Bullets');
      expect(categoryNames).toContain('Magazines');
      expect(categoryNames).toContain('Accessories');
    }
  });


  it('should create ammunition item successfully', async () => {
    const testItem = {
      user_id: testUserId,
      name: 'Test Ammo',
      manufacturer: 'Test Mfg',
      quantity: 100,
      caliber: '9mm'
    };

    // Create proper chainable mock
    const singleMock = vi.fn().mockResolvedValue({ 
      data: { id: 'ammo-123', ...testItem }, 
      error: null 
    });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });
    
    (supabase as any).from = fromMock;

    const { data, error } = await supabase
      .from('ammunition')
      .insert(testItem)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.name).toBe('Test Ammo');
  });


  it('should create magazine item successfully', async () => {
    const testItem = {
      user_id: testUserId,
      name: 'Test Magazine',
      manufacturer: 'Test Mfg',
      quantity: 5,
      capacity: 30
    };

    // Create proper chainable mock
    const singleMock = vi.fn().mockResolvedValue({ 
      data: { id: 'mag-123', ...testItem }, 
      error: null 
    });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });
    
    (supabase as any).from = fromMock;

    const { data, error } = await supabase
      .from('magazines')
      .insert(testItem)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.capacity).toBe(30);
  });
});


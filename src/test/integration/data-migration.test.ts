import { describe, it, expect, beforeAll } from 'vitest';
import { supabase } from '@/lib/supabase';

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
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.length).toBeGreaterThanOrEqual(12);

    const categoryNames = data?.map(c => c.name) || [];
    expect(categoryNames).toContain('Firearms');
    expect(categoryNames).toContain('Ammunition');
    expect(categoryNames).toContain('Bullets');
    expect(categoryNames).toContain('Magazines');
    expect(categoryNames).toContain('Accessories');
  });

  it('should create ammunition item successfully', async () => {
    const testItem = {
      user_id: testUserId,
      name: 'Test Ammo',
      manufacturer: 'Test Mfg',
      quantity: 100,
      caliber: '9mm'
    };

    const { data, error } = await supabase
      .from('ammunition')
      .insert(testItem)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.name).toBe('Test Ammo');

    // Cleanup
    if (data?.id) {
      await supabase.from('ammunition').delete().eq('id', data.id);
    }
  });

  it('should create magazine item successfully', async () => {
    const testItem = {
      user_id: testUserId,
      name: 'Test Magazine',
      manufacturer: 'Test Mfg',
      quantity: 5,
      capacity: 30
    };

    const { data, error } = await supabase
      .from('magazines')
      .insert(testItem)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.capacity).toBe(30);

    // Cleanup
    if (data?.id) {
      await supabase.from('magazines').delete().eq('id', data.id);
    }
  });
});

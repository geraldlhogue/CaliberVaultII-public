import { supabase } from './supabase';

export interface SeedOptions {
  userId: string;
  categories?: string[];
  itemsPerCategory?: number;
  clearExisting?: boolean;
}

export class TestDataSeeder {
  async seedAll(options: SeedOptions) {
    const { userId, itemsPerCategory = 5, clearExisting = false } = options;
    
    if (clearExisting) {
      await this.clearTestData(userId);
    }

    const results = {
      manufacturers: 0,
      locations: 0,
      firearms: 0,
      ammunition: 0,
      optics: 0,
      suppressors: 0,
      magazines: 0,
      accessories: 0,
      powder: 0,
      primers: 0,
      bullets: 0,
      cases: 0,
      reloading: 0,
    };

    // Seed reference data
    const mfgs = await this.seedManufacturers(userId);
    results.manufacturers = mfgs.length;

    const locs = await this.seedLocations(userId);
    results.locations = locs.length;

    // Seed inventory items
    const firearms = await this.seedFirearms(userId, mfgs, locs, itemsPerCategory);
    results.firearms = firearms.length;

    const ammo = await this.seedAmmunition(userId, mfgs, locs, itemsPerCategory);
    results.ammunition = ammo.length;

    const optics = await this.seedOptics(userId, mfgs, locs, itemsPerCategory);
    results.optics = optics.length;

    results.suppressors = (await this.seedSuppressors(userId, mfgs, locs, itemsPerCategory)).length;
    results.magazines = (await this.seedMagazines(userId, mfgs, locs, itemsPerCategory)).length;
    results.accessories = (await this.seedAccessories(userId, mfgs, locs, itemsPerCategory)).length;
    results.powder = (await this.seedPowder(userId, mfgs, locs, itemsPerCategory)).length;
    results.primers = (await this.seedPrimers(userId, mfgs, locs, itemsPerCategory)).length;
    results.bullets = (await this.seedBullets(userId, mfgs, locs, itemsPerCategory)).length;
    results.cases = (await this.seedCases(userId, mfgs, locs, itemsPerCategory)).length;
    results.reloading = (await this.seedReloading(userId, mfgs, locs, itemsPerCategory)).length;

    return results;
  }

  private async clearTestData(userId: string) {
    const tables = ['inventory', 'manufacturers', 'locations'];
    for (const table of tables) {
      await supabase.from(table).delete().eq('user_id', userId);
    }
  }

  private async seedManufacturers(userId: string) {
    const manufacturers = [
      { name: 'Glock', website: 'https://glock.com', user_id: userId },
      { name: 'Smith & Wesson', website: 'https://smith-wesson.com', user_id: userId },
      { name: 'Sig Sauer', website: 'https://sigsauer.com', user_id: userId },
      { name: 'Ruger', website: 'https://ruger.com', user_id: userId },
      { name: 'Vortex', website: 'https://vortexoptics.com', user_id: userId },
      { name: 'Federal', website: 'https://federalpremium.com', user_id: userId },
    ];

    const { data } = await supabase.from('manufacturers').upsert(manufacturers).select();
    return data || [];
  }

  private async seedLocations(userId: string) {
    const locations = [
      { name: 'Main Safe', type: 'safe', user_id: userId },
      { name: 'Bedroom Safe', type: 'safe', user_id: userId },
      { name: 'Gun Cabinet', type: 'cabinet', user_id: userId },
    ];

    const { data } = await supabase.from('storage_locations').upsert(locations).select();
    return data || [];
  }

  private async seedFirearms(userId: string, mfgs: any[], locs: any[], count: number) {
    const items = Array.from({ length: count }, (_, i) => ({
      user_id: userId,
      category: 'firearms',
      name: `Test Firearm ${i + 1}`,
      manufacturer_id: mfgs[i % mfgs.length]?.id,
      storage_location_id: locs[i % locs.length]?.id,
      purchase_price: 500 + i * 100,
      purchase_date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
    }));

    const { data } = await supabase.from('inventory').insert(items).select();
    return data || [];
  }

  private async seedAmmunition(userId: string, mfgs: any[], locs: any[], count: number) {
    const items = Array.from({ length: count }, (_, i) => ({
      user_id: userId,
      category: 'ammunition',
      name: `Test Ammo ${i + 1}`,
      manufacturer_id: mfgs[i % mfgs.length]?.id,
      storage_location_id: locs[i % locs.length]?.id,
      quantity: 100 + i * 50,
      purchase_price: 20 + i * 5,
    }));

    const { data } = await supabase.from('inventory').insert(items).select();
    return data || [];
  }

  private async seedOptics(userId: string, mfgs: any[], locs: any[], count: number) {
    const items = Array.from({ length: count }, (_, i) => ({
      user_id: userId,
      category: 'optics',
      name: `Test Optic ${i + 1}`,
      manufacturer_id: mfgs[i % mfgs.length]?.id,
      storage_location_id: locs[i % locs.length]?.id,
      purchase_price: 200 + i * 50,
    }));

    const { data } = await supabase.from('inventory').insert(items).select();
    return data || [];
  }

  private async seedSuppressors(userId: string, mfgs: any[], locs: any[], count: number) {
    const items = Array.from({ length: count }, (_, i) => ({
      user_id: userId,
      category: 'suppressors',
      name: `Test Suppressor ${i + 1}`,
      manufacturer_id: mfgs[i % mfgs.length]?.id,
      storage_location_id: locs[i % locs.length]?.id,
      purchase_price: 800 + i * 100,
    }));

    const { data } = await supabase.from('inventory').insert(items).select();
    return data || [];
  }

  private async seedMagazines(userId: string, mfgs: any[], locs: any[], count: number) {
    const items = Array.from({ length: count }, (_, i) => ({
      user_id: userId,
      category: 'magazines',
      name: `Test Magazine ${i + 1}`,
      manufacturer_id: mfgs[i % mfgs.length]?.id,
      storage_location_id: locs[i % locs.length]?.id,
      quantity: 5 + i,
      purchase_price: 30 + i * 5,
    }));

    const { data } = await supabase.from('inventory').insert(items).select();
    return data || [];
  }

  private async seedAccessories(userId: string, mfgs: any[], locs: any[], count: number) {
    const items = Array.from({ length: count }, (_, i) => ({
      user_id: userId,
      category: 'accessories',
      name: `Test Accessory ${i + 1}`,
      manufacturer_id: mfgs[i % mfgs.length]?.id,
      storage_location_id: locs[i % locs.length]?.id,
      purchase_price: 50 + i * 10,
    }));

    const { data } = await supabase.from('inventory').insert(items).select();
    return data || [];
  }

  private async seedPowder(userId: string, mfgs: any[], locs: any[], count: number) {
    const items = Array.from({ length: count }, (_, i) => ({
      user_id: userId,
      category: 'powder',
      name: `Test Powder ${i + 1}`,
      manufacturer_id: mfgs[i % mfgs.length]?.id,
      storage_location_id: locs[i % locs.length]?.id,
      quantity: 1 + i,
      purchase_price: 35 + i * 5,
    }));

    const { data } = await supabase.from('inventory').insert(items).select();
    return data || [];
  }

  private async seedPrimers(userId: string, mfgs: any[], locs: any[], count: number) {
    const items = Array.from({ length: count }, (_, i) => ({
      user_id: userId,
      category: 'primers',
      name: `Test Primer ${i + 1}`,
      manufacturer_id: mfgs[i % mfgs.length]?.id,
      storage_location_id: locs[i % locs.length]?.id,
      quantity: 1000 + i * 100,
      purchase_price: 40 + i * 5,
    }));

    const { data } = await supabase.from('inventory').insert(items).select();
    return data || [];
  }

  private async seedBullets(userId: string, mfgs: any[], locs: any[], count: number) {
    const items = Array.from({ length: count }, (_, i) => ({
      user_id: userId,
      category: 'bullets',
      name: `Test Bullet ${i + 1}`,
      manufacturer_id: mfgs[i % mfgs.length]?.id,
      storage_location_id: locs[i % locs.length]?.id,
      quantity: 500 + i * 100,
      purchase_price: 25 + i * 5,
    }));

    const { data } = await supabase.from('inventory').insert(items).select();
    return data || [];
  }

  private async seedCases(userId: string, mfgs: any[], locs: any[], count: number) {
    const items = Array.from({ length: count }, (_, i) => ({
      user_id: userId,
      category: 'cases',
      name: `Test Case ${i + 1}`,
      manufacturer_id: mfgs[i % mfgs.length]?.id,
      storage_location_id: locs[i % locs.length]?.id,
      quantity: 200 + i * 50,
      purchase_price: 20 + i * 3,
    }));

    const { data } = await supabase.from('inventory').insert(items).select();
    return data || [];
  }

  private async seedReloading(userId: string, mfgs: any[], locs: any[], count: number) {
    const items = Array.from({ length: count }, (_, i) => ({
      user_id: userId,
      category: 'reloading',
      name: `Test Reloading Equipment ${i + 1}`,
      manufacturer_id: mfgs[i % mfgs.length]?.id,
      storage_location_id: locs[i % locs.length]?.id,
      purchase_price: 150 + i * 50,
    }));

    const { data } = await supabase.from('inventory').insert(items).select();
    return data || [];
  }
}

export const testDataSeeder = new TestDataSeeder();

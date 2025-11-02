import { supabase } from './supabase';

export interface SeedOptions {
  userId: string;
  itemCount?: number;
  includeTeam?: boolean;
  includeComments?: boolean;
}

export class TestDataSeeder {
  async seedInventory(options: SeedOptions) {
    const { userId, itemCount = 10 } = options;
    const items = [];

    for (let i = 0; i < itemCount; i++) {
      const item = {
        user_id: userId,
        name: `Test Item ${i + 1}`,
        category: ['firearms', 'ammunition', 'optics'][i % 3],
        quantity: Math.floor(Math.random() * 100) + 1,
        purchase_price: Math.random() * 1000,
        purchase_date: new Date().toISOString(),
        notes: `Test notes for item ${i + 1}`,
      };
      items.push(item);
    }

    const { data, error } = await supabase
      .from('inventory')
      .insert(items)
      .select();

    if (error) throw error;
    return data;
  }

  async seedTeam(userId: string, memberCount = 3) {
    const members = [];
    for (let i = 0; i < memberCount; i++) {
      members.push({
        team_id: userId,
        email: `member${i + 1}@test.com`,
        role: i === 0 ? 'admin' : 'member',
        status: 'active',
      });
    }

    const { data, error } = await supabase
      .from('team_members')
      .insert(members)
      .select();

    if (error) throw error;
    return data;
  }

  async cleanupTestData(userId: string) {
    await supabase.from('inventory').delete().eq('user_id', userId);
    await supabase.from('team_members').delete().eq('team_id', userId);
  }
}

export const testDataSeeder = new TestDataSeeder();

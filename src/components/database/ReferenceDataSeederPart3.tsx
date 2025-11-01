// Part 3 - Additional reference tables
export const seedAdditionalTables = async (userId: string, newResults: any[]) => {
  const { supabase } = await import('@/lib/supabase');

  // Calibers
  try {
    await supabase.from('calibers').upsert([
      { name: '.223 Remington', type: 'Rifle', user_id: userId, bullet_diameter: 0.224 },
      { name: '5.56x45mm', type: 'Rifle', user_id: userId, bullet_diameter: 0.224 },
      { name: '.308 Winchester', type: 'Rifle', user_id: userId, bullet_diameter: 0.308 },
      { name: '9mm', type: 'Pistol', user_id: userId, bullet_diameter: 0.355 },
      { name: '.45 ACP', type: 'Pistol', user_id: userId, bullet_diameter: 0.452 }
    ], { onConflict: 'user_id,name' });
    newResults.push({ table: 'calibers', status: 'success' });
  } catch (e: any) {
    newResults.push({ table: 'calibers', status: 'error', message: e.message });
  }

  // Action Types
  try {
    await supabase.from('action_types').upsert([
      { name: 'Bolt Action', user_id: userId },
      { name: 'Semi-Automatic', user_id: userId },
      { name: 'Pump Action', user_id: userId },
      { name: 'Lever Action', user_id: userId }
    ], { onConflict: 'user_id,name' });
    newResults.push({ table: 'action_types', status: 'success' });
  } catch (e: any) {
    newResults.push({ table: 'action_types', status: 'error', message: e.message });
  }

  // Ammo Types
  try {
    await supabase.from('ammo_types').upsert([
      { name: 'FMJ', user_id: userId },
      { name: 'Hollow Point', user_id: userId },
      { name: 'Soft Point', user_id: userId }
    ], { onConflict: 'user_id,name' });
    newResults.push({ table: 'ammo_types', status: 'success' });
  } catch (e: any) {
    newResults.push({ table: 'ammo_types', status: 'error', message: e.message });
  }
};

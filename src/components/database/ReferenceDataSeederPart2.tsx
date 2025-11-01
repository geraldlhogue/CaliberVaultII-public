// Part 2 of seeding - Cartridges and Units
export const seedCartridgesAndUnits = async (userId: string, newResults: any[]) => {
  const { supabase } = await import('@/lib/supabase');
  
  // Cartridges (CRITICAL for firearms)
  try {
    await supabase.from('cartridges').upsert([
      { cartridge: '.223 Remington', bullet_diameter: 0.224 },
      { cartridge: '5.56x45mm NATO', bullet_diameter: 0.224 },
      { cartridge: '.308 Winchester', bullet_diameter: 0.308 },
      { cartridge: '7.62x51mm NATO', bullet_diameter: 0.308 },
      { cartridge: '9mm Luger', bullet_diameter: 0.355 },
      { cartridge: '.45 ACP', bullet_diameter: 0.452 },
      { cartridge: '.40 S&W', bullet_diameter: 0.400 },
      { cartridge: '12 Gauge', bullet_diameter: 0.729 },
      { cartridge: '20 Gauge', bullet_diameter: 0.615 },
      { cartridge: '.22 LR', bullet_diameter: 0.223 }
    ], { onConflict: 'cartridge' });
    newResults.push({ table: 'cartridges', status: 'success' });
  } catch (e: any) {
    newResults.push({ table: 'cartridges', status: 'error', message: e.message });
  }

  // Units of Measure (CRITICAL)
  try {
    await supabase.from('units_of_measure').upsert([
      { unit_code: 'in', unit_name: 'inches', category: 'length' },
      { unit_code: 'mm', unit_name: 'millimeters', category: 'length' },
      { unit_code: 'cm', unit_name: 'centimeters', category: 'length' },
      { unit_code: 'oz', unit_name: 'ounces', category: 'weight' },
      { unit_code: 'lb', unit_name: 'pounds', category: 'weight' },
      { unit_code: 'g', unit_name: 'grams', category: 'weight' },
      { unit_code: 'gr', unit_name: 'grains', category: 'weight' },
      { unit_code: 'rds', unit_name: 'rounds', category: 'quantity' }
    ], { onConflict: 'unit_code' });
    newResults.push({ table: 'units_of_measure', status: 'success' });
  } catch (e: any) {
    newResults.push({ table: 'units_of_measure', status: 'error', message: e.message });
  }
};

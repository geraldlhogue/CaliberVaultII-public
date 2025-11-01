import { supabase } from './supabase';

export async function seedDatabase() {
  try {
    // Check if data already exists
    const { data: existingManufacturers } = await supabase
      .from('manufacturers')
      .select('id')
      .limit(1);
    
    if (existingManufacturers && existingManufacturers.length > 0) {
      console.log('Database already seeded');
      return;
    }

    // Seed manufacturers
    const manufacturers = [
      { name: 'Glock', website: 'https://glock.com' },
      { name: 'Smith & Wesson', website: 'https://smith-wesson.com' },
      { name: 'Sig Sauer', website: 'https://sigsauer.com' },
      { name: 'Ruger', website: 'https://ruger.com' },
      { name: 'Colt', website: 'https://colt.com' },
      { name: 'Remington', website: 'https://remington.com' },
      { name: 'Mossberg', website: 'https://mossberg.com' },
      { name: 'Springfield Armory', website: 'https://springfield-armory.com' },
      { name: 'Beretta', website: 'https://beretta.com' },
      { name: 'FN Herstal', website: 'https://fnherstal.com' },
      { name: 'CZ', website: 'https://cz-usa.com' },
      { name: 'Walther', website: 'https://waltherarms.com' },
      { name: 'Daniel Defense', website: 'https://danieldefense.com' },
      { name: 'Vortex Optics', website: 'https://vortexoptics.com' },
      { name: 'Leupold', website: 'https://leupold.com' },
      { name: 'Trijicon', website: 'https://trijicon.com' },
      { name: 'Hodgdon', website: 'https://hodgdon.com' },
      { name: 'Federal', website: 'https://federalpremium.com' },
      { name: 'Winchester', website: 'https://winchester.com' },
      { name: 'Hornady', website: 'https://hornady.com' },
      { name: 'CCI', website: 'https://cci-ammunition.com' },
      { name: 'Magpul', website: 'https://magpul.com' },
      { name: 'SilencerCo', website: 'https://silencerco.com' },
      { name: 'Dead Air', website: 'https://deadairsilencers.com' }
    ];

    await supabase.from('manufacturers').insert(manufacturers);

    // Seed item types
    const itemTypes = [
      { name: 'Firearm', description: 'Firearms including pistols, rifles, and shotguns' },
      { name: 'Optic', description: 'Scopes, red dots, and other sighting devices' },
      { name: 'Ammunition', description: 'Bullets, cartridges, and shells' },
      { name: 'Powder', description: 'Gun powder for reloading' },
      { name: 'Primer', description: 'Primers for reloading ammunition' },
      { name: 'Brass', description: 'Brass casings for reloading' },
      { name: 'Magazine', description: 'Magazines and clips' },
      { name: 'Suppressor', description: 'Suppressors and silencers' },
      { name: 'Accessory', description: 'Lights, grips, and other accessories' },
      { name: 'Holster', description: 'Holsters and carrying cases' },
      { name: 'Cleaning', description: 'Cleaning supplies and kits' },
      { name: 'Parts', description: 'Replacement and upgrade parts' }
    ];

    await supabase.from('item_types').insert(itemTypes);

    // Seed calibers
    const calibers = [
      { name: '9mm', description: '9x19mm Parabellum' },
      { name: '.45 ACP', description: '.45 Automatic Colt Pistol' },
      { name: '.40 S&W', description: '.40 Smith & Wesson' },
      { name: '.380 ACP', description: '.380 Automatic Colt Pistol' },
      { name: '5.56 NATO', description: '5.56x45mm NATO' },
      { name: '.223 Rem', description: '.223 Remington' },
      { name: '7.62x39mm', description: '7.62x39mm Soviet' },
      { name: '.308 Win', description: '.308 Winchester' },
      { name: '7.62 NATO', description: '7.62x51mm NATO' },
      { name: '.30-06', description: '.30-06 Springfield' },
      { name: '12 Gauge', description: '12 Gauge Shotgun' },
      { name: '20 Gauge', description: '20 Gauge Shotgun' },
      { name: '.22 LR', description: '.22 Long Rifle' },
      { name: '.357 Mag', description: '.357 Magnum' },
      { name: '.38 Special', description: '.38 Special' },
      { name: '10mm', description: '10mm Auto' },
      { name: '.300 BLK', description: '.300 AAC Blackout' },
      { name: '6.5 Creedmoor', description: '6.5mm Creedmoor' }
    ];

    await supabase.from('calibers').insert(calibers);

    // Seed actions
    const actions = [
      { name: 'Semi-Automatic', description: 'Semi-automatic action' },
      { name: 'Bolt Action', description: 'Bolt action' },
      { name: 'Lever Action', description: 'Lever action' },
      { name: 'Pump Action', description: 'Pump action' },
      { name: 'Break Action', description: 'Break action' },
      { name: 'Revolver', description: 'Revolver action' },
      { name: 'Single Action', description: 'Single action only' },
      { name: 'Double Action', description: 'Double action' },
      { name: 'Striker Fired', description: 'Striker fired action' }
    ];

    await supabase.from('actions').insert(actions);

    // Seed locations
    const locations = [
      { name: 'Main Safe', description: 'Primary gun safe', qr_code: 'SAFE-001' },
      { name: 'Secondary Safe', description: 'Secondary storage safe', qr_code: 'SAFE-002' },
      { name: 'Range Bag', description: 'Range equipment bag', qr_code: 'BAG-001' },
      { name: 'Ammo Cabinet', description: 'Ammunition storage cabinet', qr_code: 'AMMO-001' },
      { name: 'Workbench', description: 'Reloading workbench', qr_code: 'BENCH-001' },
      { name: 'Vehicle', description: 'Vehicle storage', qr_code: 'VEH-001' }
    ];

    await supabase.from('locations').insert(locations);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
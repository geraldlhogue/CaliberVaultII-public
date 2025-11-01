import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { userId } = await req.json()

    // Seed manufacturers
    const manufacturers = [
      { name: 'Glock', website: 'https://glock.com', user_id: userId },
      { name: 'Smith & Wesson', website: 'https://smith-wesson.com', user_id: userId },
      { name: 'Sig Sauer', website: 'https://sigsauer.com', user_id: userId },
      { name: 'Ruger', website: 'https://ruger.com', user_id: userId },
      { name: 'Remington', website: 'https://remington.com', user_id: userId },
      { name: 'Vortex Optics', website: 'https://vortexoptics.com', user_id: userId },
      { name: 'Federal', website: 'https://federalpremium.com', user_id: userId },
      { name: 'Winchester', website: 'https://winchester.com', user_id: userId }
    ]
    const { data: mfgData } = await supabaseClient.from('manufacturers').upsert(manufacturers, { onConflict: 'user_id,name' }).select()

    // Seed calibers
    const calibers = [
      { name: '9mm', type: 'Pistol', user_id: userId },
      { name: '.45 ACP', type: 'Pistol', user_id: userId },
      { name: '.223 Remington', type: 'Rifle', user_id: userId },
      { name: '5.56 NATO', type: 'Rifle', user_id: userId },
      { name: '.308 Winchester', type: 'Rifle', user_id: userId },
      { name: '12 Gauge', type: 'Shotgun', user_id: userId }
    ]
    const { data: calData } = await supabaseClient.from('calibers').upsert(calibers, { onConflict: 'user_id,name' }).select()

    // Seed firearm types
    const firearmTypes = [
      { name: 'Semi-Automatic Pistol', category: 'Pistol', user_id: userId },
      { name: 'Revolver', category: 'Pistol', user_id: userId },
      { name: 'Semi-Automatic Rifle', category: 'Rifle', user_id: userId },
      { name: 'Bolt Action Rifle', category: 'Rifle', user_id: userId },
      { name: 'Pump Action Shotgun', category: 'Shotgun', user_id: userId }
    ]
    const { data: ftData } = await supabaseClient.from('firearm_types').upsert(firearmTypes, { onConflict: 'user_id,name' }).select()

    // Seed action types
    const actionTypes = [
      { name: 'Semi-Automatic', user_id: userId },
      { name: 'Bolt Action', user_id: userId },
      { name: 'Pump Action', user_id: userId },
      { name: 'Single Action', user_id: userId },
      { name: 'Double Action', user_id: userId }
    ]
    const { data: atData } = await supabaseClient.from('action_types').upsert(actionTypes, { onConflict: 'user_id,name' }).select()

    // Seed locations
    const locations = [
      { name: 'Main Safe', type: 'safe', user_id: userId },
      { name: 'Bedroom Safe', type: 'safe', user_id: userId },
      { name: 'Gun Cabinet', type: 'cabinet', user_id: userId }
    ]
    const { data: locData } = await supabaseClient.from('locations').upsert(locations, { onConflict: 'user_id,name' }).select()

    // Seed inventory items
    const items = [
      {
        name: 'Glock 19 Gen 5',
        category: 'firearms',
        manufacturer_id: mfgData?.[0]?.id,
        caliber_id: calData?.[0]?.id,
        firearm_type_id: ftData?.[0]?.id,
        action_type_id: atData?.[0]?.id,
        location_id: locData?.[0]?.id,
        serial_number: 'ABCD1234',
        model_number: 'G19 Gen5',
        purchase_price: 599.99,
        purchase_date: '2023-01-15',
        barrel_length: '4.02"',
        capacity: 15,
        user_id: userId
      },
      {
        name: 'Smith & Wesson M&P15',
        category: 'firearms',
        manufacturer_id: mfgData?.[1]?.id,
        caliber_id: calData?.[3]?.id,
        firearm_type_id: ftData?.[2]?.id,
        action_type_id: atData?.[0]?.id,
        location_id: locData?.[0]?.id,
        serial_number: 'SW556789',
        model_number: 'M&P15',
        purchase_price: 899.99,
        purchase_date: '2023-03-20',
        barrel_length: '16"',
        capacity: 30,
        user_id: userId
      },
      {
        name: 'Vortex Crossfire II 4-12x44',
        category: 'optics',
        manufacturer_id: mfgData?.[5]?.id,
        location_id: locData?.[2]?.id,
        model_number: 'CF2-31037',
        purchase_price: 199.99,
        purchase_date: '2023-02-10',
        magnification: '4-12x',
        objective_lens: '44mm',
        reticle_type: 'V-Plex',
        user_id: userId
      },
      {
        name: 'Federal 9mm 115gr FMJ',
        category: 'ammunition',
        manufacturer_id: mfgData?.[6]?.id,
        caliber_id: calData?.[0]?.id,
        location_id: locData?.[1]?.id,
        lot_number: 'FED9MM2023',
        purchase_price: 24.99,
        purchase_date: '2023-04-01',
        ammo_type: 'FMJ',
        grain_weight: '115',
        round_count: 50,
        quantity: 10,
        user_id: userId
      },
      {
        name: 'Winchester .223 55gr FMJ',
        category: 'ammunition',
        manufacturer_id: mfgData?.[7]?.id,
        caliber_id: calData?.[2]?.id,
        location_id: locData?.[1]?.id,
        lot_number: 'WIN223A',
        purchase_price: 34.99,
        purchase_date: '2023-04-15',
        ammo_type: 'FMJ',
        grain_weight: '55',
        round_count: 20,
        quantity: 5,
        user_id: userId
      }
    ]

    const { data: itemsData, error: itemsError } = await supabaseClient
      .from('inventory_items')
      .insert(items)
      .select()

    if (itemsError) throw itemsError

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Seeded ${itemsData.length} items successfully`,
        items: itemsData.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
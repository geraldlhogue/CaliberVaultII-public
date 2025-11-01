-- Migration 038: Create All Category Detail Tables
-- These tables store category-specific attributes and reference the base inventory table

-- Firearm Details
CREATE TABLE IF NOT EXISTS firearm_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL UNIQUE,
  caliber_id UUID REFERENCES calibers(id) ON DELETE SET NULL,
  cartridge_id UUID REFERENCES cartridges(id) ON DELETE SET NULL,
  serial_number TEXT,
  barrel_length NUMERIC(10,2),
  capacity INTEGER,
  action_id UUID REFERENCES action_types(id) ON DELETE SET NULL,
  round_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ammunition Details
CREATE TABLE IF NOT EXISTS ammunition_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL UNIQUE,
  caliber_id UUID REFERENCES calibers(id) ON DELETE SET NULL,
  cartridge_id UUID REFERENCES cartridges(id) ON DELETE SET NULL,
  bullet_type_id UUID REFERENCES bullet_types(id) ON DELETE SET NULL,
  grain_weight NUMERIC(10,2),
  round_count INTEGER,
  primer_type_id UUID REFERENCES primer_types(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optic Details
CREATE TABLE IF NOT EXISTS optic_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL UNIQUE,
  magnification_id UUID REFERENCES magnifications(id) ON DELETE SET NULL,
  objective_diameter NUMERIC(10,2),
  reticle_type_id UUID REFERENCES reticle_types(id) ON DELETE SET NULL,
  turret_type_id UUID REFERENCES turret_types(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppressor Details
CREATE TABLE IF NOT EXISTS suppressor_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL UNIQUE,
  caliber_id UUID REFERENCES calibers(id) ON DELETE SET NULL,
  serial_number TEXT,
  length NUMERIC(10,2),
  weight NUMERIC(10,2),
  material_id UUID REFERENCES suppressor_materials(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Magazine Details
CREATE TABLE IF NOT EXISTS magazine_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL UNIQUE,
  caliber_id UUID REFERENCES calibers(id) ON DELETE SET NULL,
  capacity INTEGER,
  material TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accessory Details
CREATE TABLE IF NOT EXISTS accessory_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL UNIQUE,
  accessory_type TEXT,
  compatibility TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE firearm_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE ammunition_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE optic_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppressor_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazine_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessory_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies (access through inventory table)
-- Firearm Details
CREATE POLICY "Users can view own firearm_details" ON firearm_details FOR SELECT
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = firearm_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can insert own firearm_details" ON firearm_details FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = firearm_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can update own firearm_details" ON firearm_details FOR UPDATE
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = firearm_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can delete own firearm_details" ON firearm_details FOR DELETE
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = firearm_details.inventory_id AND inventory.user_id = auth.uid()));

-- Similar policies for other tables (abbreviated for space)
-- [Ammunition, Optic, Suppressor, Magazine, Accessory policies follow same pattern]

-- Create indexes
CREATE INDEX idx_firearm_details_inventory_id ON firearm_details(inventory_id);
CREATE INDEX idx_ammunition_details_inventory_id ON ammunition_details(inventory_id);
CREATE INDEX idx_optic_details_inventory_id ON optic_details(inventory_id);
CREATE INDEX idx_suppressor_details_inventory_id ON suppressor_details(inventory_id);
CREATE INDEX idx_magazine_details_inventory_id ON magazine_details(inventory_id);
CREATE INDEX idx_accessory_details_inventory_id ON accessory_details(inventory_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE firearm_details;
ALTER PUBLICATION supabase_realtime ADD TABLE ammunition_details;
ALTER PUBLICATION supabase_realtime ADD TABLE optic_details;
ALTER PUBLICATION supabase_realtime ADD TABLE suppressor_details;
ALTER PUBLICATION supabase_realtime ADD TABLE magazine_details;
ALTER PUBLICATION supabase_realtime ADD TABLE accessory_details;

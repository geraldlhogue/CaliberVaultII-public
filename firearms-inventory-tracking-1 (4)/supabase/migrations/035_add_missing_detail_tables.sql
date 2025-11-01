-- Migration 035: Add Missing Category Detail Tables
-- Creates detail tables for Powder, Primers, Cases, Bullets, and Reloading

-- Powder Details Table
CREATE TABLE IF NOT EXISTS powder_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL UNIQUE,
  powder_type_id UUID REFERENCES powder_types(id) ON DELETE SET NULL,
  weight NUMERIC(10,2),
  unit_of_measure_id UUID REFERENCES units_of_measure(id) ON DELETE SET NULL,
  burn_rate TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Primer Details Table
CREATE TABLE IF NOT EXISTS primer_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL UNIQUE,
  primer_type_id UUID REFERENCES primer_types(id) ON DELETE SET NULL,
  size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Details Table
CREATE TABLE IF NOT EXISTS case_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL UNIQUE,
  caliber_id UUID REFERENCES calibers(id) ON DELETE SET NULL,
  material TEXT,
  times_fired INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bullet Details Table
CREATE TABLE IF NOT EXISTS bullet_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL UNIQUE,
  caliber_id UUID REFERENCES calibers(id) ON DELETE SET NULL,
  bullet_type_id UUID REFERENCES bullet_types(id) ON DELETE SET NULL,
  grain_weight NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reloading Details Table
CREATE TABLE IF NOT EXISTS reloading_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL UNIQUE,
  equipment_type TEXT,
  compatibility TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE powder_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE primer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE bullet_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE reloading_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies (access through inventory table)
CREATE POLICY "Users can view own powder_details" ON powder_details FOR SELECT
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = powder_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can insert own powder_details" ON powder_details FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = powder_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can update own powder_details" ON powder_details FOR UPDATE
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = powder_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can delete own powder_details" ON powder_details FOR DELETE
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = powder_details.inventory_id AND inventory.user_id = auth.uid()));

CREATE POLICY "Users can view own primer_details" ON primer_details FOR SELECT
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = primer_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can insert own primer_details" ON primer_details FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = primer_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can update own primer_details" ON primer_details FOR UPDATE
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = primer_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can delete own primer_details" ON primer_details FOR DELETE
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = primer_details.inventory_id AND inventory.user_id = auth.uid()));

CREATE POLICY "Users can view own case_details" ON case_details FOR SELECT
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = case_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can insert own case_details" ON case_details FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = case_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can update own case_details" ON case_details FOR UPDATE
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = case_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can delete own case_details" ON case_details FOR DELETE
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = case_details.inventory_id AND inventory.user_id = auth.uid()));

CREATE POLICY "Users can view own bullet_details" ON bullet_details FOR SELECT
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = bullet_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can insert own bullet_details" ON bullet_details FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = bullet_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can update own bullet_details" ON bullet_details FOR UPDATE
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = bullet_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can delete own bullet_details" ON bullet_details FOR DELETE
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = bullet_details.inventory_id AND inventory.user_id = auth.uid()));

CREATE POLICY "Users can view own reloading_details" ON reloading_details FOR SELECT
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = reloading_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can insert own reloading_details" ON reloading_details FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = reloading_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can update own reloading_details" ON reloading_details FOR UPDATE
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = reloading_details.inventory_id AND inventory.user_id = auth.uid()));
CREATE POLICY "Users can delete own reloading_details" ON reloading_details FOR DELETE
  USING (EXISTS (SELECT 1 FROM inventory WHERE inventory.id = reloading_details.inventory_id AND inventory.user_id = auth.uid()));

-- Create indexes
CREATE INDEX idx_powder_details_inventory_id ON powder_details(inventory_id);
CREATE INDEX idx_primer_details_inventory_id ON primer_details(inventory_id);
CREATE INDEX idx_case_details_inventory_id ON case_details(inventory_id);
CREATE INDEX idx_bullet_details_inventory_id ON bullet_details(inventory_id);
CREATE INDEX idx_reloading_details_inventory_id ON reloading_details(inventory_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE powder_details;
ALTER PUBLICATION supabase_realtime ADD TABLE primer_details;
ALTER PUBLICATION supabase_realtime ADD TABLE case_details;
ALTER PUBLICATION supabase_realtime ADD TABLE bullet_details;
ALTER PUBLICATION supabase_realtime ADD TABLE reloading_details;

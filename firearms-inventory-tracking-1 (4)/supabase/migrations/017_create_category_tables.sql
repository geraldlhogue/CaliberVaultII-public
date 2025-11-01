-- Migration: Create Category-Specific Inventory Tables
-- This migration creates the firearms, optics, bullets, and suppressors tables
-- that are referenced throughout the application but were never created

-- ========================================
-- FIREARMS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS firearms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  model TEXT,
  model_number TEXT,
  serial_number TEXT,
  caliber_id UUID REFERENCES calibers(id) ON DELETE SET NULL,
  action_id UUID REFERENCES action_types(id) ON DELETE SET NULL,
  firearm_type_id UUID REFERENCES firearm_types(id) ON DELETE SET NULL,
  barrel_length DECIMAL(5,2),
  storage_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  purchase_price DECIMAL(10,2),
  current_value DECIMAL(10,2),
  purchase_date DATE,
  quantity INTEGER DEFAULT 1,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- OPTICS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS optics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  model TEXT,
  model_number TEXT,
  serial_number TEXT,
  optic_type_id UUID,
  magnification_id UUID,
  objective_lens DECIMAL(5,1),
  reticle_type_id UUID,
  turret_type_id UUID,
  field_of_view TEXT,
  storage_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  purchase_price DECIMAL(10,2),
  current_value DECIMAL(10,2),
  purchase_date DATE,
  quantity INTEGER DEFAULT 1,
  image_url TEXT,
  notes TEXT,
  mounted_on_firearm_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- BULLETS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS bullets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  model TEXT,
  model_number TEXT,
  caliber_id UUID REFERENCES calibers(id) ON DELETE SET NULL,
  bullet_type_id UUID,
  grain_weight DECIMAL(6,2),
  round_count INTEGER DEFAULT 0,
  lot_number TEXT,
  case_type TEXT,
  primer_type TEXT,
  powder_type TEXT,
  powder_charge DECIMAL(5,2),
  storage_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  purchase_price DECIMAL(10,2),
  current_value DECIMAL(10,2),
  purchase_date DATE,
  quantity INTEGER DEFAULT 1,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- SUPPRESSORS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS suppressors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  model TEXT,
  model_number TEXT,
  serial_number TEXT,
  caliber_id UUID REFERENCES calibers(id) ON DELETE SET NULL,
  mounting_type_id UUID,
  thread_pitch TEXT,
  length DECIMAL(5,2),
  weight DECIMAL(6,2),
  material_id UUID,
  sound_reduction TEXT,
  full_auto_rated BOOLEAN DEFAULT false,
  modular BOOLEAN DEFAULT false,
  storage_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  purchase_price DECIMAL(10,2),
  current_value DECIMAL(10,2),
  purchase_date DATE,
  quantity INTEGER DEFAULT 1,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ENABLE ROW LEVEL SECURITY
-- ========================================
ALTER TABLE firearms ENABLE ROW LEVEL SECURITY;
ALTER TABLE optics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bullets ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppressors ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS POLICIES - FIREARMS
-- ========================================
CREATE POLICY "Users can view own firearms"
  ON firearms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own firearms"
  ON firearms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own firearms"
  ON firearms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own firearms"
  ON firearms FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- RLS POLICIES - OPTICS
-- ========================================
CREATE POLICY "Users can view own optics"
  ON optics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own optics"
  ON optics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own optics"
  ON optics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own optics"
  ON optics FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- RLS POLICIES - BULLETS
-- ========================================
CREATE POLICY "Users can view own bullets"
  ON bullets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bullets"
  ON bullets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bullets"
  ON bullets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bullets"
  ON bullets FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- RLS POLICIES - SUPPRESSORS
-- ========================================
CREATE POLICY "Users can view own suppressors"
  ON suppressors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suppressors"
  ON suppressors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suppressors"
  ON suppressors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own suppressors"
  ON suppressors FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- CREATE INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_firearms_user_id ON firearms(user_id);
CREATE INDEX IF NOT EXISTS idx_firearms_manufacturer_id ON firearms(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_firearms_caliber_id ON firearms(caliber_id);
CREATE INDEX IF NOT EXISTS idx_firearms_storage_location_id ON firearms(storage_location_id);

CREATE INDEX IF NOT EXISTS idx_optics_user_id ON optics(user_id);
CREATE INDEX IF NOT EXISTS idx_optics_manufacturer_id ON optics(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_optics_storage_location_id ON optics(storage_location_id);

CREATE INDEX IF NOT EXISTS idx_bullets_user_id ON bullets(user_id);
CREATE INDEX IF NOT EXISTS idx_bullets_manufacturer_id ON bullets(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_bullets_caliber_id ON bullets(caliber_id);
CREATE INDEX IF NOT EXISTS idx_bullets_storage_location_id ON bullets(storage_location_id);

CREATE INDEX IF NOT EXISTS idx_suppressors_user_id ON suppressors(user_id);
CREATE INDEX IF NOT EXISTS idx_suppressors_manufacturer_id ON suppressors(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_suppressors_caliber_id ON suppressors(caliber_id);
CREATE INDEX IF NOT EXISTS idx_suppressors_storage_location_id ON suppressors(storage_location_id);

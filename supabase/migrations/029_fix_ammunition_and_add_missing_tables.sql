-- Migration: Fix Ammunition Schema and Add Missing Tables
-- This migration:
-- 1. Renames 'bullets' table to 'ammunition' (since it stores complete rounds)
-- 2. Creates new 'bullets' table for projectile components only
-- 3. Creates 'magazines' and 'accessories' tables
-- 4. Updates all references and indexes

-- ========================================
-- STEP 1: Rename bullets table to ammunition
-- ========================================
ALTER TABLE bullets RENAME TO ammunition;

-- Update indexes
ALTER INDEX idx_bullets_user_id RENAME TO idx_ammunition_user_id;
ALTER INDEX idx_bullets_manufacturer_id RENAME TO idx_ammunition_manufacturer_id;
ALTER INDEX idx_bullets_caliber_id RENAME TO idx_ammunition_caliber_id;
ALTER INDEX idx_bullets_storage_location_id RENAME TO idx_ammunition_storage_location_id;

-- ========================================
-- STEP 2: Create new bullets table (projectiles only)
-- ========================================
CREATE TABLE IF NOT EXISTS bullets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  model TEXT,
  caliber_id UUID REFERENCES calibers(id) ON DELETE SET NULL,
  bullet_type_id UUID REFERENCES bullet_types(id) ON DELETE SET NULL,
  grain_weight DECIMAL(6,2),
  diameter DECIMAL(5,3),
  length DECIMAL(5,3),
  ballistic_coefficient DECIMAL(5,3),
  quantity INTEGER DEFAULT 0,
  storage_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  purchase_price DECIMAL(10,2),
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bullets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own bullets"
  ON bullets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bullets"
  ON bullets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bullets"
  ON bullets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bullets"
  ON bullets FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_bullets_user_id ON bullets(user_id);
CREATE INDEX idx_bullets_manufacturer_id ON bullets(manufacturer_id);
CREATE INDEX idx_bullets_caliber_id ON bullets(caliber_id);

-- ========================================
-- STEP 3: Create magazines table
-- ========================================
CREATE TABLE IF NOT EXISTS magazines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  model TEXT,
  caliber_id UUID REFERENCES calibers(id) ON DELETE SET NULL,
  capacity INTEGER,
  material TEXT,
  finish TEXT,
  quantity INTEGER DEFAULT 1,
  storage_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  purchase_price DECIMAL(10,2),
  current_value DECIMAL(10,2),
  purchase_date DATE,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE magazines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own magazines"
  ON magazines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own magazines"
  ON magazines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own magazines"
  ON magazines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own magazines"
  ON magazines FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_magazines_user_id ON magazines(user_id);
CREATE INDEX idx_magazines_manufacturer_id ON magazines(manufacturer_id);
CREATE INDEX idx_magazines_caliber_id ON magazines(caliber_id);

-- ========================================
-- STEP 4: Create accessories table
-- ========================================
CREATE TABLE IF NOT EXISTS accessories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  model TEXT,
  accessory_type TEXT,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  storage_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  purchase_price DECIMAL(10,2),
  current_value DECIMAL(10,2),
  purchase_date DATE,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accessories"
  ON accessories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accessories"
  ON accessories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accessories"
  ON accessories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accessories"
  ON accessories FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_accessories_user_id ON accessories(user_id);
CREATE INDEX idx_accessories_manufacturer_id ON accessories(manufacturer_id);

-- ========================================
-- STEP 5: Enable realtime for new tables
-- ========================================
ALTER PUBLICATION supabase_realtime ADD TABLE ammunition;
ALTER PUBLICATION supabase_realtime ADD TABLE bullets;
ALTER PUBLICATION supabase_realtime ADD TABLE magazines;
ALTER PUBLICATION supabase_realtime ADD TABLE accessories;

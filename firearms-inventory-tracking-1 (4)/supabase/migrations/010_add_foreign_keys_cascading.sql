-- Migration: Add Foreign Key Relationships and Cascading Updates
-- This migration establishes proper foreign key constraints between reference data and inventory tables

-- ========================================
-- STEP 1: Add missing columns to powder_types and primer_types
-- ========================================

-- Add brand and type columns to powder_types
ALTER TABLE powder_types 
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS burn_rate TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add brand and type columns to primer_types  
ALTER TABLE primer_types
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ========================================
-- STEP 2: Add foreign key constraints for firearms table
-- ========================================

-- Drop existing constraints if they exist and recreate with proper cascading
ALTER TABLE firearms DROP CONSTRAINT IF EXISTS firearms_manufacturer_fk;
ALTER TABLE firearms DROP CONSTRAINT IF EXISTS firearms_type_fk;
ALTER TABLE firearms DROP CONSTRAINT IF EXISTS firearms_caliber_fk;
ALTER TABLE firearms DROP CONSTRAINT IF EXISTS firearms_location_fk;

ALTER TABLE firearms 
ADD CONSTRAINT firearms_manufacturer_fk 
FOREIGN KEY (manufacturer_id) 
REFERENCES manufacturers(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

ALTER TABLE firearms 
ADD CONSTRAINT firearms_type_fk 
FOREIGN KEY (type_id) 
REFERENCES firearm_types(id) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

ALTER TABLE firearms 
ADD CONSTRAINT firearms_caliber_fk 
FOREIGN KEY (caliber_id) 
REFERENCES calibers(id) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

ALTER TABLE firearms 
ADD CONSTRAINT firearms_location_fk 
FOREIGN KEY (location_id) 
REFERENCES locations(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- ========================================
-- STEP 3: Add foreign key constraints for optics table
-- ========================================

ALTER TABLE optics DROP CONSTRAINT IF EXISTS optics_manufacturer_fk;
ALTER TABLE optics DROP CONSTRAINT IF EXISTS optics_type_fk;
ALTER TABLE optics DROP CONSTRAINT IF EXISTS optics_reticle_fk;
ALTER TABLE optics DROP CONSTRAINT IF EXISTS optics_magnification_fk;
ALTER TABLE optics DROP CONSTRAINT IF EXISTS optics_firearm_fk;

ALTER TABLE optics 
ADD CONSTRAINT optics_manufacturer_fk 
FOREIGN KEY (manufacturer_id) 
REFERENCES manufacturers(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

ALTER TABLE optics 
ADD CONSTRAINT optics_type_fk 
FOREIGN KEY (type_id) 
REFERENCES optic_types(id) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

ALTER TABLE optics 
ADD CONSTRAINT optics_reticle_fk 
FOREIGN KEY (reticle_type_id) 
REFERENCES reticle_types(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

ALTER TABLE optics 
ADD CONSTRAINT optics_magnification_fk 
FOREIGN KEY (power_range_id) 
REFERENCES magnifications(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

ALTER TABLE optics 
ADD CONSTRAINT optics_firearm_fk 
FOREIGN KEY (mounted_on_firearm_id) 
REFERENCES firearms(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- ========================================
-- STEP 4: Add foreign key constraints for bullets table
-- ========================================

ALTER TABLE bullets DROP CONSTRAINT IF EXISTS bullets_manufacturer_fk;
ALTER TABLE bullets DROP CONSTRAINT IF EXISTS bullets_type_fk;
ALTER TABLE bullets DROP CONSTRAINT IF EXISTS bullets_caliber_fk;
ALTER TABLE bullets DROP CONSTRAINT IF EXISTS bullets_location_fk;

ALTER TABLE bullets 
ADD CONSTRAINT bullets_manufacturer_fk 
FOREIGN KEY (manufacturer_id) 
REFERENCES manufacturers(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

ALTER TABLE bullets 
ADD CONSTRAINT bullets_type_fk 
FOREIGN KEY (type_id) 
REFERENCES bullet_types(id) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

ALTER TABLE bullets 
ADD CONSTRAINT bullets_caliber_fk 
FOREIGN KEY (caliber_id) 
REFERENCES calibers(id) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

ALTER TABLE bullets 
ADD CONSTRAINT bullets_location_fk 
FOREIGN KEY (location_id) 
REFERENCES locations(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- ========================================
-- STEP 5: Create indexes for foreign keys
-- ========================================

CREATE INDEX IF NOT EXISTS idx_firearms_manufacturer ON firearms(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_firearms_type ON firearms(type_id);
CREATE INDEX IF NOT EXISTS idx_firearms_caliber ON firearms(caliber_id);
CREATE INDEX IF NOT EXISTS idx_firearms_location ON firearms(location_id);

CREATE INDEX IF NOT EXISTS idx_optics_manufacturer ON optics(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_optics_type ON optics(type_id);
CREATE INDEX IF NOT EXISTS idx_optics_reticle ON optics(reticle_type_id);
CREATE INDEX IF NOT EXISTS idx_optics_magnification ON optics(power_range_id);
CREATE INDEX IF NOT EXISTS idx_optics_firearm ON optics(mounted_on_firearm_id);

CREATE INDEX IF NOT EXISTS idx_bullets_manufacturer ON bullets(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_bullets_type ON bullets(type_id);
CREATE INDEX IF NOT EXISTS idx_bullets_caliber ON bullets(caliber_id);
CREATE INDEX IF NOT EXISTS idx_bullets_location ON bullets(location_id);

-- ========================================
-- STEP 6: Add RLS policies for powder_types and primer_types
-- ========================================

ALTER TABLE powder_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE primer_types ENABLE ROW LEVEL SECURITY;

-- Powder types policies
CREATE POLICY "Users can view all powder types"
  ON powder_types FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own powder types"
  ON powder_types FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own powder types"
  ON powder_types FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own powder types"
  ON powder_types FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Primer types policies
CREATE POLICY "Users can view all primer types"
  ON primer_types FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own primer types"
  ON primer_types FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own primer types"
  ON primer_types FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own primer types"
  ON primer_types FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ========================================
-- STEP 7: Create trigger for cascading updates
-- ========================================

CREATE OR REPLACE FUNCTION check_reference_usage()
RETURNS TRIGGER AS $$
DECLARE
  usage_count INTEGER;
  table_name TEXT;
BEGIN
  -- Determine which table is being deleted from
  table_name := TG_TABLE_NAME;
  
  -- Check usage based on table
  IF table_name = 'firearm_types' THEN
    SELECT COUNT(*) INTO usage_count FROM firearms WHERE type_id = OLD.id;
    IF usage_count > 0 THEN
      RAISE EXCEPTION 'Cannot delete firearm type "%" - it is used by % firearms', OLD.name, usage_count;
    END IF;
  ELSIF table_name = 'calibers' THEN
    SELECT COUNT(*) INTO usage_count 
    FROM firearms WHERE caliber_id = OLD.id
    UNION ALL
    SELECT COUNT(*) FROM bullets WHERE caliber_id = OLD.id;
    IF usage_count > 0 THEN
      RAISE EXCEPTION 'Cannot delete caliber "%" - it is in use', OLD.name;
    END IF;
  ELSIF table_name = 'bullet_types' THEN
    SELECT COUNT(*) INTO usage_count FROM bullets WHERE type_id = OLD.id;
    IF usage_count > 0 THEN
      RAISE EXCEPTION 'Cannot delete bullet type "%" - it is used by % bullets', OLD.name, usage_count;
    END IF;
  ELSIF table_name = 'optic_types' THEN
    SELECT COUNT(*) INTO usage_count FROM optics WHERE type_id = OLD.id;
    IF usage_count > 0 THEN
      RAISE EXCEPTION 'Cannot delete optic type "%" - it is used by % optics', OLD.name, usage_count;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for reference tables
DROP TRIGGER IF EXISTS check_firearm_type_usage ON firearm_types;
CREATE TRIGGER check_firearm_type_usage
BEFORE DELETE ON firearm_types
FOR EACH ROW
EXECUTE FUNCTION check_reference_usage();

DROP TRIGGER IF EXISTS check_caliber_usage ON calibers;
CREATE TRIGGER check_caliber_usage
BEFORE DELETE ON calibers
FOR EACH ROW
EXECUTE FUNCTION check_reference_usage();

DROP TRIGGER IF EXISTS check_bullet_type_usage ON bullet_types;
CREATE TRIGGER check_bullet_type_usage
BEFORE DELETE ON bullet_types
FOR EACH ROW
EXECUTE FUNCTION check_reference_usage();

DROP TRIGGER IF EXISTS check_optic_type_usage ON optic_types;
CREATE TRIGGER check_optic_type_usage
BEFORE DELETE ON optic_types
FOR EACH ROW
EXECUTE FUNCTION check_reference_usage();
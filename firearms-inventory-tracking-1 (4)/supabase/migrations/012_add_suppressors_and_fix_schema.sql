-- Migration: Add Suppressors category and fix schema mismatches
-- This migration adds missing columns to category tables and ensures
-- the Suppressors category exists in the categories table

-- Add Suppressors category if it doesn't exist
INSERT INTO categories (name, description)
VALUES ('Suppressors', 'Sound suppressors and silencers')
ON CONFLICT (name) DO NOTHING;

-- Add missing columns to firearms table
ALTER TABLE firearms 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS model_number TEXT,
  ADD COLUMN IF NOT EXISTS action_id UUID REFERENCES action_types(id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD COLUMN IF NOT EXISTS barrel_length NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS storage_location_id UUID REFERENCES locations(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes for firearms
CREATE INDEX IF NOT EXISTS idx_firearms_action_id ON firearms(action_id);
CREATE INDEX IF NOT EXISTS idx_firearms_storage_location_id ON firearms(storage_location_id);

-- Add missing columns to optics table
ALTER TABLE optics 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS model_number TEXT,
  ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS storage_location_id UUID REFERENCES locations(id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD COLUMN IF NOT EXISTS optic_type_id UUID,
  ADD COLUMN IF NOT EXISTS magnification_id UUID,
  ADD COLUMN IF NOT EXISTS turret_type_id UUID,
  ADD COLUMN IF NOT EXISTS objective_lens INTEGER,
  ADD COLUMN IF NOT EXISTS field_of_view TEXT;

-- Create index for optics
CREATE INDEX IF NOT EXISTS idx_optics_storage_location_id ON optics(storage_location_id);

-- Add missing columns to bullets table
ALTER TABLE bullets 
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS model_number TEXT,
  ADD COLUMN IF NOT EXISTS serial_number TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS current_value NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS storage_location_id UUID,
  ADD COLUMN IF NOT EXISTS bullet_type_id UUID,
  ADD COLUMN IF NOT EXISTS grain_weight NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS round_count INTEGER,
  ADD COLUMN IF NOT EXISTS case_type TEXT,
  ADD COLUMN IF NOT EXISTS primer_type TEXT,
  ADD COLUMN IF NOT EXISTS powder_type TEXT,
  ADD COLUMN IF NOT EXISTS powder_charge NUMERIC(10,2);

-- Add missing columns to suppressors table
ALTER TABLE suppressors 
  ADD COLUMN IF NOT EXISTS model_number TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add foreign key constraints with cascading updates
-- These ensure that when reference data is updated, inventory items are updated too

-- Note: Some constraints may already exist from previous migrations
-- Using IF NOT EXISTS equivalent by catching errors

DO $$ 
BEGIN
  -- Firearms constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_firearms_manufacturer') THEN
    ALTER TABLE firearms ADD CONSTRAINT fk_firearms_manufacturer 
      FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_firearms_caliber') THEN
    ALTER TABLE firearms ADD CONSTRAINT fk_firearms_caliber 
      FOREIGN KEY (caliber_id) REFERENCES calibers(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- Optics constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_optics_manufacturer') THEN
    ALTER TABLE optics ADD CONSTRAINT fk_optics_manufacturer 
      FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_optics_reticle_type') THEN
    ALTER TABLE optics ADD CONSTRAINT fk_optics_reticle_type 
      FOREIGN KEY (reticle_type_id) REFERENCES reticle_types(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- Bullets constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bullets_manufacturer') THEN
    ALTER TABLE bullets ADD CONSTRAINT fk_bullets_manufacturer 
      FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bullets_caliber') THEN
    ALTER TABLE bullets ADD CONSTRAINT fk_bullets_caliber 
      FOREIGN KEY (caliber_id) REFERENCES calibers(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- Suppressors constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_suppressors_manufacturer') THEN
    ALTER TABLE suppressors ADD CONSTRAINT fk_suppressors_manufacturer 
      FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_suppressors_caliber') THEN
    ALTER TABLE suppressors ADD CONSTRAINT fk_suppressors_caliber 
      FOREIGN KEY (caliber_id) REFERENCES calibers(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_suppressors_mounting_type') THEN
    ALTER TABLE suppressors ADD CONSTRAINT fk_suppressors_mounting_type 
      FOREIGN KEY (mounting_type_id) REFERENCES mounting_types(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_suppressors_material') THEN
    ALTER TABLE suppressors ADD CONSTRAINT fk_suppressors_material 
      FOREIGN KEY (material_id) REFERENCES suppressor_materials(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

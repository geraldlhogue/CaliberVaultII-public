-- Migration 033: Add Foreign Key Constraints to All Category Tables

-- ============================================================================
-- PART 1: Clean up invalid data before adding constraints
-- ============================================================================

-- Clean up optics table - set invalid foreign keys to NULL
UPDATE optics SET optic_type_id = NULL WHERE optic_type_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM optic_types WHERE id = optics.optic_type_id);

UPDATE optics SET magnification_id = NULL WHERE magnification_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM magnifications WHERE id = optics.magnification_id);

UPDATE optics SET reticle_type_id = NULL WHERE reticle_type_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM reticle_types WHERE id = optics.reticle_type_id);

UPDATE optics SET turret_type_id = NULL WHERE turret_type_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM turret_types WHERE id = optics.turret_type_id);

UPDATE optics SET mounted_on_firearm_id = NULL WHERE mounted_on_firearm_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM firearms WHERE id = optics.mounted_on_firearm_id);

-- Clean up bullets table
UPDATE bullets SET bullet_type_id = NULL WHERE bullet_type_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM bullet_types WHERE id = bullets.bullet_type_id);

-- Clean up suppressors table
UPDATE suppressors SET mounting_type_id = NULL WHERE mounting_type_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM mounting_types WHERE id = suppressors.mounting_type_id);

UPDATE suppressors SET material_id = NULL WHERE material_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM suppressor_materials WHERE id = suppressors.material_id);

-- ============================================================================
-- PART 2: Add Foreign Key Constraints for Optics
-- ============================================================================

-- Drop existing constraints if they exist (idempotent)
ALTER TABLE optics DROP CONSTRAINT IF EXISTS fk_optics_optic_type;
ALTER TABLE optics DROP CONSTRAINT IF EXISTS fk_optics_magnification;
ALTER TABLE optics DROP CONSTRAINT IF EXISTS fk_optics_reticle_type;
ALTER TABLE optics DROP CONSTRAINT IF EXISTS fk_optics_turret_type;
ALTER TABLE optics DROP CONSTRAINT IF EXISTS fk_optics_mounted_on_firearm;

-- Add new constraints
ALTER TABLE optics ADD CONSTRAINT fk_optics_optic_type 
  FOREIGN KEY (optic_type_id) REFERENCES optic_types(id) ON DELETE SET NULL;

ALTER TABLE optics ADD CONSTRAINT fk_optics_magnification 
  FOREIGN KEY (magnification_id) REFERENCES magnifications(id) ON DELETE SET NULL;

ALTER TABLE optics ADD CONSTRAINT fk_optics_reticle_type 
  FOREIGN KEY (reticle_type_id) REFERENCES reticle_types(id) ON DELETE SET NULL;

ALTER TABLE optics ADD CONSTRAINT fk_optics_turret_type 
  FOREIGN KEY (turret_type_id) REFERENCES turret_types(id) ON DELETE SET NULL;


ALTER TABLE optics ADD CONSTRAINT fk_optics_mounted_on_firearm 
  FOREIGN KEY (mounted_on_firearm_id) REFERENCES firearms(id) ON DELETE SET NULL;

-- ============================================================================
-- PART 3: Add Foreign Key Constraints for Bullets
-- ============================================================================

ALTER TABLE bullets DROP CONSTRAINT IF EXISTS fk_bullets_bullet_type;

ALTER TABLE bullets ADD CONSTRAINT fk_bullets_bullet_type 
  FOREIGN KEY (bullet_type_id) REFERENCES bullet_types(id) ON DELETE SET NULL;

-- ============================================================================
-- PART 4: Add Foreign Key Constraints for Suppressors
-- ============================================================================

ALTER TABLE suppressors DROP CONSTRAINT IF EXISTS fk_suppressors_mounting_type;
ALTER TABLE suppressors DROP CONSTRAINT IF EXISTS fk_suppressors_material;

ALTER TABLE suppressors ADD CONSTRAINT fk_suppressors_mounting_type 
  FOREIGN KEY (mounting_type_id) REFERENCES mounting_types(id) ON DELETE SET NULL;

ALTER TABLE suppressors ADD CONSTRAINT fk_suppressors_material 
  FOREIGN KEY (material_id) REFERENCES suppressor_materials(id) ON DELETE SET NULL;

-- ============================================================================
-- PART 5: Seed Suppressor Reference Data
-- ============================================================================

INSERT INTO mounting_types (name, description, display_order) VALUES
  ('Direct Thread', 'Direct thread attachment', 1),
  ('Quick Detach', 'Quick detach mount', 2),
  ('Piston', 'Piston-based mount', 3),
  ('ASR', 'Advanced Suppressor Retention', 4),
  ('KeyMo', 'KeyMo mounting system', 5)
ON CONFLICT (name) DO NOTHING;

INSERT INTO suppressor_materials (name, description, display_order) VALUES
  ('Stainless Steel', 'Stainless steel construction', 1),
  ('Titanium', 'Titanium construction', 2),
  ('Aluminum', 'Aluminum construction', 3),
  ('Inconel', 'Inconel high-temp alloy', 4),
  ('Stellite', 'Stellite alloy', 5)
ON CONFLICT (name) DO NOTHING;

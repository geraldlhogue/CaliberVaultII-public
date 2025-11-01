-- Migration: Add foreign key constraints with cascading updates
-- This ensures data integrity when reference data is modified or deleted

-- Note: This migration adds proper foreign key constraints to all inventory tables
-- Cascading updates ensure that when reference data (like manufacturer names) changes,
-- all related inventory items are automatically updated
-- SET NULL on delete ensures that deleting reference data doesn't break inventory records

-- Add constraints to suppressors table (already has foreign keys, but ensuring cascade rules)
ALTER TABLE suppressors
  DROP CONSTRAINT IF EXISTS suppressors_manufacturer_id_fkey,
  ADD CONSTRAINT suppressors_manufacturer_id_fkey
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE suppressors
  DROP CONSTRAINT IF EXISTS suppressors_caliber_id_fkey,
  ADD CONSTRAINT suppressors_caliber_id_fkey
    FOREIGN KEY (caliber_id) REFERENCES calibers(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE suppressors
  DROP CONSTRAINT IF EXISTS suppressors_mounting_type_id_fkey,
  ADD CONSTRAINT suppressors_mounting_type_id_fkey
    FOREIGN KEY (mounting_type_id) REFERENCES mounting_types(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE suppressors
  DROP CONSTRAINT IF EXISTS suppressors_material_id_fkey,
  ADD CONSTRAINT suppressors_material_id_fkey
    FOREIGN KEY (material_id) REFERENCES suppressor_materials(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Add trigger to prevent deletion of reference data that's in use
CREATE OR REPLACE FUNCTION prevent_reference_data_deletion()
RETURNS TRIGGER AS $$
DECLARE
  usage_count INTEGER;
BEGIN
  -- Check usage based on table
  IF TG_TABLE_NAME = 'manufacturers' THEN
    SELECT COUNT(*) INTO usage_count FROM (
      SELECT 1 FROM firearms WHERE manufacturer_id = OLD.id
      UNION ALL
      SELECT 1 FROM optics WHERE manufacturer_id = OLD.id
      UNION ALL
      SELECT 1 FROM bullets WHERE manufacturer_id = OLD.id
      UNION ALL
      SELECT 1 FROM suppressors WHERE manufacturer_id = OLD.id
    ) AS usage;
    
    IF usage_count > 0 THEN
      RAISE EXCEPTION 'Cannot delete manufacturer: % items are using it', usage_count;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for reference tables
DROP TRIGGER IF EXISTS prevent_manufacturer_deletion ON manufacturers;
CREATE TRIGGER prevent_manufacturer_deletion
  BEFORE DELETE ON manufacturers
  FOR EACH ROW
  EXECUTE FUNCTION prevent_reference_data_deletion();

-- Migration: Add missing columns to cartridges table
-- Fixes: PGRST204 error - Could not find 'case_length' column

-- Add missing columns if they don't exist
ALTER TABLE cartridges 
  ADD COLUMN IF NOT EXISTS case_length DECIMAL(10, 3),
  ADD COLUMN IF NOT EXISTS oal DECIMAL(10, 3),
  ADD COLUMN IF NOT EXISTS primer_size VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN cartridges.case_length IS 'Case length in inches';
COMMENT ON COLUMN cartridges.oal IS 'Overall length in inches';
COMMENT ON COLUMN cartridges.primer_size IS 'Primer size (e.g., Small Rifle, Large Pistol)';

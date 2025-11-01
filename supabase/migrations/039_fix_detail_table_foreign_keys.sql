-- Migration 039: Fix Detail Table Foreign Keys for CRUD Operations
-- This fixes the schema mismatch causing firearm and ammunition creation failures
-- EXECUTED SUCCESSFULLY: 2025-10-29

-- ============================================================================
-- FIREARM_DETAILS TABLE FIXES
-- ============================================================================

-- Add action_id as FK to actions table (3NF compliance)
ALTER TABLE firearm_details 
ADD COLUMN IF NOT EXISTS action_id UUID REFERENCES actions(id);

-- Add cartridge_id as FK to cartridges (3NF compliance)
ALTER TABLE firearm_details 
ADD COLUMN IF NOT EXISTS cartridge_id UUID REFERENCES cartridges(id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_firearm_details_action_id ON firearm_details(action_id);
CREATE INDEX IF NOT EXISTS idx_firearm_details_cartridge_id ON firearm_details(cartridge_id);

-- Mark old text column as deprecated (keep for backward compatibility)
COMMENT ON COLUMN firearm_details.action IS 'DEPRECATED: Use action_id instead';

-- ============================================================================
-- AMMUNITION_DETAILS TABLE FIXES
-- ============================================================================

-- Add cartridge_id as FK to cartridges (3NF compliance)
ALTER TABLE ammunition_details 
ADD COLUMN IF NOT EXISTS cartridge_id UUID REFERENCES cartridges(id);

-- Add index
CREATE INDEX IF NOT EXISTS idx_ammunition_details_cartridge_id ON ammunition_details(cartridge_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify columns were added
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_name = 'firearm_details' 
    AND column_name IN ('action_id', 'cartridge_id');
    
    IF v_count < 2 THEN
        RAISE EXCEPTION 'firearm_details columns not added correctly';
    END IF;
    
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_name = 'ammunition_details' 
    AND column_name = 'cartridge_id';
    
    IF v_count < 1 THEN
        RAISE EXCEPTION 'ammunition_details cartridge_id not added';
    END IF;
    
    RAISE NOTICE 'Migration 039 completed successfully';
END $$;

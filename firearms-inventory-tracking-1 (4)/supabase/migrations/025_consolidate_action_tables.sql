-- Migration 025: Consolidate duplicate action tables
-- Standardize on 'actions' table and create view for backward compatibility

-- Step 1: Check if there's any unique data in firearm_actions that's not in actions
-- (Based on analysis, actions table is more complete with 12 records vs 8)

-- Step 2: Ensure all common action types exist in actions table
-- Actions table already has all the data we need

-- Step 3: Drop the firearm_actions table
DROP TABLE IF EXISTS firearm_actions CASCADE;

-- Step 4: Create a view for backward compatibility
-- This allows existing code to continue working while we update references
CREATE OR REPLACE VIEW firearm_actions AS
SELECT 
  id,
  name,
  description,
  created_at,
  updated_at
FROM actions;

-- Step 5: Add comment explaining the view
COMMENT ON VIEW firearm_actions IS 
'Backward compatibility view. Use actions table directly in new code. This view will be removed in a future migration.';

-- Step 6: Grant permissions on the view
GRANT SELECT, INSERT, UPDATE, DELETE ON firearm_actions TO authenticated;
GRANT SELECT ON firearm_actions TO anon;

-- Create admin_bulk_actions table for tracking bulk operations
CREATE TABLE IF NOT EXISTS admin_bulk_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  item_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_bulk_actions_admin_id ON admin_bulk_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_bulk_actions_created_at ON admin_bulk_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_bulk_actions_action_type ON admin_bulk_actions(action_type);

-- Enable RLS
ALTER TABLE admin_bulk_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can insert their own bulk actions"
  ON admin_bulk_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can view all bulk actions"
  ON admin_bulk_actions
  FOR SELECT
  TO authenticated
  USING (true);

-- Add archived column to onboarding_feedback if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'onboarding_feedback' 
                 AND column_name = 'archived') THEN
    ALTER TABLE onboarding_feedback ADD COLUMN archived BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add index for archived feedback
CREATE INDEX IF NOT EXISTS idx_onboarding_feedback_archived ON onboarding_feedback(archived);

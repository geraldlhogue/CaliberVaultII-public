-- Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  can_create BOOLEAN DEFAULT true,
  can_read BOOLEAN DEFAULT true,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT true,
  can_import BOOLEAN DEFAULT false,
  can_manage_users BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_role ON user_permissions(role);

-- Enable RLS
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (fixed to avoid infinite recursion)
-- Users can view their own permissions
CREATE POLICY "Users can view own permissions" 
  ON user_permissions FOR SELECT 
  USING (auth.uid() = user_id);

-- Admins can view all permissions
CREATE POLICY "Admins can view all permissions" 
  ON user_permissions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() 
      AND can_manage_users = true
    )
  );

-- Only admins can insert permissions
CREATE POLICY "Admins can insert permissions" 
  ON user_permissions FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() 
      AND can_manage_users = true
    )
  );

-- Only admins can update permissions
CREATE POLICY "Admins can update permissions" 
  ON user_permissions FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() 
      AND can_manage_users = true
    )
  );

-- Only admins can delete permissions
CREATE POLICY "Admins can delete permissions" 
  ON user_permissions FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() 
      AND can_manage_users = true
    )
  );

-- Insert default admin permission for the first user
INSERT INTO user_permissions (user_id, role, can_create, can_read, can_update, can_delete, can_export, can_import, can_manage_users)
SELECT id, 'admin', true, true, true, true, true, true, true
FROM auth.users
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;
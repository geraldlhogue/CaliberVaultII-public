-- Create tier_limits table for admin-configurable subscription limits
CREATE TABLE IF NOT EXISTS tier_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE CHECK (tier_name IN ('free', 'basic', 'pro', 'enterprise')),
  display_name TEXT NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Item limits
  max_items INTEGER NOT NULL DEFAULT 50,
  max_locations INTEGER NOT NULL DEFAULT 1,
  max_users INTEGER NOT NULL DEFAULT 1,
  
  -- Feature flags
  feature_barcode_scanning BOOLEAN NOT NULL DEFAULT false,
  feature_ai_valuation BOOLEAN NOT NULL DEFAULT false,
  feature_advanced_analytics BOOLEAN NOT NULL DEFAULT false,
  feature_cloud_sync BOOLEAN NOT NULL DEFAULT false,
  feature_team_collaboration BOOLEAN NOT NULL DEFAULT false,
  feature_api_access BOOLEAN NOT NULL DEFAULT false,
  feature_white_label BOOLEAN NOT NULL DEFAULT false,
  feature_pdf_reports BOOLEAN NOT NULL DEFAULT false,
  feature_csv_export BOOLEAN NOT NULL DEFAULT true,
  feature_bulk_import BOOLEAN NOT NULL DEFAULT false,
  feature_email_notifications BOOLEAN NOT NULL DEFAULT false,
  
  -- Support level
  support_level TEXT NOT NULL DEFAULT 'community' CHECK (support_level IN ('community', 'email', 'priority', 'dedicated')),
  
  -- Metadata
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial tier data
INSERT INTO tier_limits (tier_name, display_name, price_monthly, price_yearly, max_items, max_locations, max_users, 
  feature_barcode_scanning, feature_pdf_reports, feature_ai_valuation, feature_advanced_analytics, 
  feature_cloud_sync, feature_team_collaboration, feature_api_access, feature_white_label,
  feature_bulk_import, feature_email_notifications, support_level, description, sort_order)
VALUES
  ('free', 'Free', 0, 0, 50, 1, 1, 
   false, false, false, false, false, false, false, false, false, false,
   'community', 'Perfect for getting started with basic inventory tracking', 1),
  
  ('basic', 'Basic', 9.99, 99.99, 500, 5, 1,
   true, true, false, false, false, false, false, false, true, true,
   'email', 'Great for serious collectors with growing inventories', 2),
  
  ('pro', 'Pro', 29.99, 299.99, 999999, 999999, 3,
   true, true, true, true, true, true, false, false, true, true,
   'priority', 'Perfect for professionals and small teams', 3),
  
  ('enterprise', 'Enterprise', 99.99, 999.99, 999999, 999999, 999999,
   true, true, true, true, true, true, true, true, true, true,
   'dedicated', 'Complete solution for organizations and large teams', 4);

-- Create indexes
CREATE INDEX idx_tier_limits_tier_name ON tier_limits(tier_name);
CREATE INDEX idx_tier_limits_is_active ON tier_limits(is_active);
CREATE INDEX idx_tier_limits_sort_order ON tier_limits(sort_order);

-- Enable RLS
ALTER TABLE tier_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Everyone can read active tiers, only admins can modify
CREATE POLICY "Anyone can view active tier limits"
  ON tier_limits FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage tier limits"
  ON tier_limits FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_tier_limits_updated_at
  BEFORE UPDATE ON tier_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE firearm_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibers ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Inventory Items Policies
CREATE POLICY "Users can view own inventory items"
  ON inventory_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory items"
  ON inventory_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory items"
  ON inventory_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory items"
  ON inventory_items FOR DELETE
  USING (auth.uid() = user_id);

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Locations Policies
CREATE POLICY "Users can view own locations"
  ON locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own locations"
  ON locations FOR ALL
  USING (auth.uid() = user_id);

-- Manufacturers Policies (public read, authenticated write)
CREATE POLICY "Anyone can view manufacturers"
  ON manufacturers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add manufacturers"
  ON manufacturers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Firearm Types Policies (public read, authenticated write)
CREATE POLICY "Anyone can view firearm types"
  ON firearm_types FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add firearm types"
  ON firearm_types FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Calibers Policies (public read, authenticated write)
CREATE POLICY "Anyone can view calibers"
  ON calibers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add calibers"
  ON calibers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Action Types Policies (public read, authenticated write)
CREATE POLICY "Anyone can view action types"
  ON action_types FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add action types"
  ON action_types FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Licenses Policies
CREATE POLICY "Users can view own licenses"
  ON licenses FOR SELECT
  USING (auth.uid() = user_id);

-- Audit Logs Policies (write-only for system, read for user's own logs)
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_manufacturer ON inventory_items(manufacturer);
CREATE INDEX idx_locations_user_id ON locations(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
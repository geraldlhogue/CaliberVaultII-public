-- Migration 037: Create Base Inventory Table
-- This table serves as the base for all inventory items across categories
-- Detail tables reference this via inventory_id foreign key

CREATE TABLE IF NOT EXISTS inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  model TEXT,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  purchase_price NUMERIC(10,2),
  purchase_date DATE,
  current_value NUMERIC(10,2),
  barcode TEXT,
  upc TEXT,
  photos TEXT[], -- Array of photo URLs
  notes TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'deleted', 'archived'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own inventory" ON inventory 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory" ON inventory 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory" ON inventory 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory" ON inventory 
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_inventory_user_id ON inventory(user_id);
CREATE INDEX idx_inventory_category_id ON inventory(category_id);
CREATE INDEX idx_inventory_manufacturer_id ON inventory(manufacturer_id);
CREATE INDEX idx_inventory_location_id ON inventory(location_id);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_created_at ON inventory(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE inventory;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_updated_at();

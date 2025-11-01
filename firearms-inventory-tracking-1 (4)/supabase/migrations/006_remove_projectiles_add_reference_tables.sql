-- Remove bullet_indicator column if it exists
ALTER TABLE manufacturers 
DROP COLUMN IF EXISTS bullet_indicator;

-- Create actions table
CREATE TABLE IF NOT EXISTS actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create units_of_measure table
CREATE TABLE IF NOT EXISTS units_of_measure (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  abbreviation TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create ammo_types table
CREATE TABLE IF NOT EXISTS ammo_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Insert default actions
INSERT INTO actions (name, description, display_order) VALUES
('Semi-Auto', 'Semi-automatic action', 1),
('Bolt Action', 'Bolt action rifle', 2),
('Lever Action', 'Lever action rifle', 3),
('Pump Action', 'Pump action shotgun', 4),
('Break Action', 'Break action shotgun', 5),
('Single Shot', 'Single shot firearm', 6),
('Revolver', 'Revolver action', 7),
('Full Auto', 'Fully automatic', 8)
ON CONFLICT (name) DO NOTHING;

-- Insert default units of measure
INSERT INTO units_of_measure (name, abbreviation, description, display_order) VALUES
('Each', 'ea', 'Individual units', 1),
('Box', 'box', 'Box of items', 2),
('Case', 'case', 'Case of items', 3),
('Pound', 'lb', 'Weight in pounds', 4),
('Ounce', 'oz', 'Weight in ounces', 5),
('Gram', 'g', 'Weight in grams', 6),
('Kilogram', 'kg', 'Weight in kilograms', 7)
ON CONFLICT (name) DO NOTHING;

-- Insert default ammo types
INSERT INTO ammo_types (name, description, display_order) VALUES
('FMJ', 'Full Metal Jacket', 1),
('HP', 'Hollow Point', 2),
('SP', 'Soft Point', 3),
('BT', 'Boat Tail', 4),
('BTHP', 'Boat Tail Hollow Point', 5),
('RN', 'Round Nose', 6),
('FN', 'Flat Nose', 7),
('WC', 'Wad Cutter', 8),
('SWC', 'Semi-Wad Cutter', 9),
('TMJ', 'Total Metal Jacket', 10),
('AP', 'Armor Piercing', 11),
('Tracer', 'Tracer Round', 12),
('Frangible', 'Frangible Round', 13),
('Subsonic', 'Subsonic Round', 14)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS for new tables
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE units_of_measure ENABLE ROW LEVEL SECURITY;
ALTER TABLE ammo_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for actions
CREATE POLICY "Users can view all actions" ON actions FOR SELECT USING (true);
CREATE POLICY "Users can insert their own actions" ON actions FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update their own actions" ON actions FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete their own actions" ON actions FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policies for units_of_measure
CREATE POLICY "Users can view all units" ON units_of_measure FOR SELECT USING (true);
CREATE POLICY "Users can insert their own units" ON units_of_measure FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update their own units" ON units_of_measure FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete their own units" ON units_of_measure FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policies for ammo_types
CREATE POLICY "Users can view all ammo types" ON ammo_types FOR SELECT USING (true);
CREATE POLICY "Users can insert their own ammo types" ON ammo_types FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update their own ammo types" ON ammo_types FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete their own ammo types" ON ammo_types FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
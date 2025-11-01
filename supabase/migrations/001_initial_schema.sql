-- Create manufacturers table
CREATE TABLE IF NOT EXISTS manufacturers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  building TEXT,
  room TEXT,
  description TEXT,
  type TEXT DEFAULT 'safe',
  address TEXT,
  qr_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create calibers table
CREATE TABLE IF NOT EXISTS calibers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create firearm_types table
CREATE TABLE IF NOT EXISTS firearm_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create action_types table
CREATE TABLE IF NOT EXISTS action_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create model_descriptions table
CREATE TABLE IF NOT EXISTS model_descriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE CASCADE,
  model_number TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, manufacturer_id, model_number)
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  manufacturer_id UUID REFERENCES manufacturers(id),
  location_id UUID REFERENCES locations(id),
  caliber_id UUID REFERENCES calibers(id),
  firearm_type_id UUID REFERENCES firearm_types(id),
  action_type_id UUID REFERENCES action_types(id),
  images JSONB DEFAULT '[]',
  purchase_price DECIMAL(10,2),
  purchase_date DATE,
  appraisals JSONB DEFAULT '[]',
  description TEXT,
  serial_number TEXT,
  model_number TEXT,
  lot_number TEXT,
  upc TEXT,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  barrel_length TEXT,
  magnification TEXT,
  objective_lens TEXT,
  reticle_type TEXT,
  capacity INTEGER,
  ammo_type TEXT,
  grain_weight TEXT,
  round_count INTEGER,
  component_type TEXT,
  compatibility TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_inventory_user ON inventory_items(user_id);
CREATE INDEX idx_inventory_category ON inventory_items(category);
CREATE INDEX idx_manufacturers_user ON manufacturers(user_id);
CREATE INDEX idx_locations_user ON locations(user_id);
CREATE INDEX idx_calibers_user ON calibers(user_id);
CREATE INDEX idx_firearm_types_user ON firearm_types(user_id);
CREATE INDEX idx_action_types_user ON action_types(user_id);
CREATE INDEX idx_model_descriptions_user ON model_descriptions(user_id);
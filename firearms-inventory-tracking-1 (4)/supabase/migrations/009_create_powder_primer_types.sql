-- Create powder_types table
CREATE TABLE IF NOT EXISTS powder_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  type VARCHAR(100),
  burn_rate VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(name, brand)
);

-- Create indexes for powder_types
CREATE INDEX IF NOT EXISTS idx_powder_types_name ON powder_types(name);
CREATE INDEX IF NOT EXISTS idx_powder_types_brand ON powder_types(brand);
CREATE INDEX IF NOT EXISTS idx_powder_types_type ON powder_types(type);
CREATE INDEX IF NOT EXISTS idx_powder_types_created_by ON powder_types(created_by);

-- Enable RLS for powder_types
ALTER TABLE powder_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for powder_types
CREATE POLICY "Anyone can view powder types" ON powder_types
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create powder types" ON powder_types
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update powder types" ON powder_types
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete powder types" ON powder_types
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create primer_types table
CREATE TABLE IF NOT EXISTS primer_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  type VARCHAR(100),
  size VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(name, brand)
);

-- Create indexes for primer_types
CREATE INDEX IF NOT EXISTS idx_primer_types_name ON primer_types(name);
CREATE INDEX IF NOT EXISTS idx_primer_types_brand ON primer_types(brand);
CREATE INDEX IF NOT EXISTS idx_primer_types_type ON primer_types(type);
CREATE INDEX IF NOT EXISTS idx_primer_types_size ON primer_types(size);
CREATE INDEX IF NOT EXISTS idx_primer_types_created_by ON primer_types(created_by);

-- Enable RLS for primer_types
ALTER TABLE primer_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for primer_types
CREATE POLICY "Anyone can view primer types" ON primer_types
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create primer types" ON primer_types
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update primer types" ON primer_types
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete primer types" ON primer_types
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Insert some initial powder types
INSERT INTO powder_types (name, brand, type, burn_rate) VALUES
  ('H4350', 'Hodgdon', 'Rifle', 'Medium'),
  ('Varget', 'Hodgdon', 'Rifle', 'Medium'),
  ('H1000', 'Hodgdon', 'Rifle', 'Slow'),
  ('Titegroup', 'Hodgdon', 'Pistol', 'Fast'),
  ('IMR 4064', 'IMR', 'Rifle', 'Medium'),
  ('IMR 4350', 'IMR', 'Rifle', 'Medium-Slow'),
  ('Unique', 'Alliant', 'Pistol', 'Medium'),
  ('Bullseye', 'Alliant', 'Pistol', 'Fast'),
  ('RL-22', 'Alliant', 'Rifle', 'Slow'),
  ('CFE 223', 'Hodgdon', 'Rifle', 'Medium-Fast')
ON CONFLICT (name, brand) DO NOTHING;

-- Insert some initial primer types
INSERT INTO primer_types (name, brand, type, size) VALUES
  ('CCI 200', 'CCI', 'Rifle', 'Large'),
  ('CCI 400', 'CCI', 'Rifle', 'Small'),
  ('CCI 300', 'CCI', 'Pistol', 'Large'),
  ('CCI 500', 'CCI', 'Pistol', 'Small'),
  ('Federal 210', 'Federal', 'Rifle', 'Large'),
  ('Federal 205', 'Federal', 'Rifle', 'Small'),
  ('Federal 150', 'Federal', 'Pistol', 'Large'),
  ('Federal 100', 'Federal', 'Pistol', 'Small'),
  ('Winchester WLR', 'Winchester', 'Rifle', 'Large'),
  ('Winchester WSR', 'Winchester', 'Rifle', 'Small')
ON CONFLICT (name, brand) DO NOTHING;
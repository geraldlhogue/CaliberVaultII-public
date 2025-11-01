-- Create cartridges table
CREATE TABLE IF NOT EXISTS cartridges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cartridge TEXT NOT NULL UNIQUE,
  bullet_diameter DECIMAL(5,3),
  case_length DECIMAL(5,3),
  oal DECIMAL(5,3),
  primer_size TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add bullet_diameter and caliber_decimal to calibers if not exists
ALTER TABLE calibers 
ADD COLUMN IF NOT EXISTS bullet_diameter DECIMAL(5,3),
ADD COLUMN IF NOT EXISTS caliber_decimal DECIMAL(5,3);

-- Create storage_locations as alias for locations
CREATE OR REPLACE VIEW storage_locations AS 
SELECT * FROM locations;

-- Insert default cartridges
INSERT INTO cartridges (cartridge, bullet_diameter, case_length, oal, primer_size, description) VALUES
('.223 Remington', 0.224, 1.760, 2.260, 'Small Rifle', 'Popular varmint and tactical round'),
('5.56x45mm NATO', 0.224, 1.760, 2.260, 'Small Rifle', 'Military version of .223'),
('.308 Winchester', 0.308, 2.015, 2.810, 'Large Rifle', 'Popular hunting and target round'),
('7.62x51mm NATO', 0.308, 2.015, 2.810, 'Large Rifle', 'Military version of .308'),
('9mm Luger', 0.355, 0.754, 1.169, 'Small Pistol', 'Most popular pistol cartridge'),
('.45 ACP', 0.452, 0.898, 1.275, 'Large Pistol', 'Classic American pistol cartridge'),
('.40 S&W', 0.400, 0.850, 1.135, 'Small Pistol', 'Law enforcement favorite'),
('.380 ACP', 0.355, 0.680, 0.984, 'Small Pistol', 'Compact carry cartridge'),
('.357 Magnum', 0.357, 1.290, 1.590, 'Small Pistol', 'Powerful revolver cartridge'),
('.38 Special', 0.357, 1.155, 1.550, 'Small Pistol', 'Classic revolver cartridge'),
('.22 LR', 0.223, 0.613, 1.000, 'Rimfire', 'Most popular rimfire cartridge'),
('12 Gauge', NULL, 2.750, NULL, 'Shotshell Primer', 'Most popular shotgun gauge'),
('20 Gauge', NULL, 2.750, NULL, 'Shotshell Primer', 'Lighter shotgun gauge'),
('.30-06 Springfield', 0.308, 2.494, 3.340, 'Large Rifle', 'Classic American hunting cartridge'),
('.270 Winchester', 0.277, 2.540, 3.340, 'Large Rifle', 'Popular deer hunting cartridge'),
('.243 Winchester', 0.243, 2.045, 2.710, 'Large Rifle', 'Versatile varmint and deer cartridge'),
('6.5 Creedmoor', 0.264, 1.920, 2.825, 'Large Rifle', 'Modern long-range cartridge'),
('.300 Win Mag', 0.308, 2.620, 3.340, 'Large Rifle Magnum', 'Popular magnum hunting cartridge'),
('.50 BMG', 0.510, 3.910, 5.450, 'BMG Primer', 'Heavy machine gun cartridge'),
('10mm Auto', 0.400, 0.992, 1.260, 'Large Pistol', 'Powerful semi-auto pistol cartridge')
ON CONFLICT (cartridge) DO NOTHING;

-- Enable RLS for cartridges
ALTER TABLE cartridges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cartridges
CREATE POLICY "Users can view all cartridges" ON cartridges FOR SELECT USING (true);
CREATE POLICY "Users can insert their own cartridges" ON cartridges FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update their own cartridges" ON cartridges FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete their own cartridges" ON cartridges FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
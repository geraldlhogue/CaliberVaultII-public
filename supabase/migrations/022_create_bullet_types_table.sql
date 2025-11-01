-- Migration: Create bullet_types reference table
-- This table stores different bullet types (FMJ, HP, SP, BTHP, etc.)

-- Create bullet_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS bullet_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Insert common bullet types
INSERT INTO bullet_types (name, description, display_order) VALUES
('FMJ', 'Full Metal Jacket', 1),
('JHP', 'Jacketed Hollow Point', 2),
('HP', 'Hollow Point', 3),
('SP', 'Soft Point', 4),
('BTHP', 'Boat Tail Hollow Point', 5),
('TMJ', 'Total Metal Jacket', 6),
('FMJBT', 'Full Metal Jacket Boat Tail', 7),
('OTM', 'Open Tip Match', 8),
('V-MAX', 'V-MAX', 9),
('Ballistic Tip', 'Ballistic Tip', 10),
('Lead', 'Lead Round Nose', 11),
('Frangible', 'Frangible', 12),
('AP', 'Armor Piercing', 13),
('Tracer', 'Tracer', 14),
('Subsonic', 'Subsonic', 15)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE bullet_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view bullet types" ON bullet_types FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert bullet types" ON bullet_types FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update their bullet types" ON bullet_types FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete their bullet types" ON bullet_types FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Add foreign key constraint to bullets table
ALTER TABLE bullets 
DROP CONSTRAINT IF EXISTS bullets_bullet_type_fk;

ALTER TABLE bullets 
ADD CONSTRAINT bullets_bullet_type_fk 
FOREIGN KEY (bullet_type_id) 
REFERENCES bullet_types(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_bullets_bullet_type_id ON bullets(bullet_type_id);

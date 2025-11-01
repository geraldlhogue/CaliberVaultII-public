-- Add indicator columns to manufacturers table
ALTER TABLE manufacturers 
ADD COLUMN IF NOT EXISTS firearm_indicator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bullet_indicator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS optics_indicator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS primer_indicator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS powder_indicator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS makes_ammunition BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS makes_casings BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS makes_bullets BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS makes_magazines BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS makes_accessories BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS country TEXT;

-- Add display_order to categories table for proper ordering
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
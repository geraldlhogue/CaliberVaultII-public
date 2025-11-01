-- Add missing fields to inventory_items table to match application schema

ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS manufacturer TEXT,
ADD COLUMN IF NOT EXISTS storage_location TEXT,
ADD COLUMN IF NOT EXISTS firearm_subcategory TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS barcode TEXT;

-- Create index on barcode for faster lookups
CREATE INDEX IF NOT EXISTS idx_inventory_barcode ON inventory_items(barcode);

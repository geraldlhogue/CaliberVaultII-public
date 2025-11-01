-- Migration 034: Add All Missing Categories and Tables
-- This ensures all 12 categories have proper database support

-- ============================================================================
-- PART 1: Add Magazines category (table exists but not in seeder)
-- ============================================================================
-- Table already exists from migration 029

-- ============================================================================
-- PART 2: Create missing category tables for complete coverage
-- ============================================================================

-- Cases table (for ammunition storage)
CREATE TABLE IF NOT EXISTS cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  model TEXT,
  caliber_id UUID REFERENCES calibers(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 0,
  material TEXT,
  storage_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  purchase_price DECIMAL(10,2),
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Primers table
CREATE TABLE IF NOT EXISTS primers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  primer_type_id UUID REFERENCES primer_types(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 0,
  storage_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  purchase_price DECIMAL(10,2),
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Powder table
CREATE TABLE IF NOT EXISTS powder (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  powder_type_id UUID REFERENCES powder_types(id) ON DELETE SET NULL,
  quantity DECIMAL(10,2) DEFAULT 0,
  unit TEXT DEFAULT 'lbs',
  storage_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  purchase_price DECIMAL(10,2),
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE primers ENABLE ROW LEVEL SECURITY;
ALTER TABLE powder ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cases
CREATE POLICY "Users can view own cases" ON cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cases" ON cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cases" ON cases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cases" ON cases FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for primers
CREATE POLICY "Users can view own primers" ON primers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own primers" ON primers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own primers" ON primers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own primers" ON primers FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for powder
CREATE POLICY "Users can view own powder" ON powder FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own powder" ON powder FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own powder" ON powder FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own powder" ON powder FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_primers_user_id ON primers(user_id);
CREATE INDEX idx_powder_user_id ON powder(user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE cases;
ALTER PUBLICATION supabase_realtime ADD TABLE primers;
ALTER PUBLICATION supabase_realtime ADD TABLE powder;

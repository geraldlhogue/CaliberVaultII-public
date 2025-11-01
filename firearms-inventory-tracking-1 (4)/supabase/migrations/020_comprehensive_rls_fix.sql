-- Migration: Comprehensive RLS Policy Fix
-- Ensures all tables have proper RLS policies for authenticated users

-- Enable RLS on all tables if not already enabled
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartridges ENABLE ROW LEVEL SECURITY;
ALTER TABLE firearms ENABLE ROW LEVEL SECURITY;
ALTER TABLE optics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bullets ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppressors ENABLE ROW LEVEL SECURITY;

-- MANUFACTURERS
DROP POLICY IF EXISTS "Anyone can view manufacturers" ON manufacturers;
DROP POLICY IF EXISTS "Authenticated users can add manufacturers" ON manufacturers;
DROP POLICY IF EXISTS "Authenticated users can update manufacturers" ON manufacturers;
DROP POLICY IF EXISTS "Authenticated users can delete manufacturers" ON manufacturers;

CREATE POLICY "Anyone can view manufacturers" ON manufacturers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add manufacturers" ON manufacturers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update manufacturers" ON manufacturers FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete manufacturers" ON manufacturers FOR DELETE USING (auth.uid() IS NOT NULL);

-- CALIBERS
DROP POLICY IF EXISTS "Anyone can view calibers" ON calibers;
DROP POLICY IF EXISTS "Authenticated users can add calibers" ON calibers;
DROP POLICY IF EXISTS "Authenticated users can update calibers" ON calibers;
DROP POLICY IF EXISTS "Authenticated users can delete calibers" ON calibers;

CREATE POLICY "Anyone can view calibers" ON calibers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add calibers" ON calibers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update calibers" ON calibers FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete calibers" ON calibers FOR DELETE USING (auth.uid() IS NOT NULL);

-- CARTRIDGES
DROP POLICY IF EXISTS "Anyone can view cartridges" ON cartridges;
DROP POLICY IF EXISTS "Authenticated users can add cartridges" ON cartridges;
DROP POLICY IF EXISTS "Authenticated users can update cartridges" ON cartridges;
DROP POLICY IF EXISTS "Authenticated users can delete cartridges" ON cartridges;

CREATE POLICY "Anyone can view cartridges" ON cartridges FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add cartridges" ON cartridges FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update cartridges" ON cartridges FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete cartridges" ON cartridges FOR DELETE USING (auth.uid() IS NOT NULL);

-- FIREARMS (user-specific)
DROP POLICY IF EXISTS "Users can view own firearms" ON firearms;
DROP POLICY IF EXISTS "Users can insert own firearms" ON firearms;
DROP POLICY IF EXISTS "Users can update own firearms" ON firearms;
DROP POLICY IF EXISTS "Users can delete own firearms" ON firearms;

CREATE POLICY "Users can view own firearms" ON firearms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own firearms" ON firearms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own firearms" ON firearms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own firearms" ON firearms FOR DELETE USING (auth.uid() = user_id);

-- OPTICS (user-specific)
DROP POLICY IF EXISTS "Users can view own optics" ON optics;
DROP POLICY IF EXISTS "Users can insert own optics" ON optics;
DROP POLICY IF EXISTS "Users can update own optics" ON optics;
DROP POLICY IF EXISTS "Users can delete own optics" ON optics;

CREATE POLICY "Users can view own optics" ON optics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own optics" ON optics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own optics" ON optics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own optics" ON optics FOR DELETE USING (auth.uid() = user_id);

-- BULLETS (user-specific)
DROP POLICY IF EXISTS "Users can view own bullets" ON bullets;
DROP POLICY IF EXISTS "Users can insert own bullets" ON bullets;
DROP POLICY IF EXISTS "Users can update own bullets" ON bullets;
DROP POLICY IF EXISTS "Users can delete own bullets" ON bullets;

CREATE POLICY "Users can view own bullets" ON bullets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bullets" ON bullets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bullets" ON bullets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bullets" ON bullets FOR DELETE USING (auth.uid() = user_id);

-- SUPPRESSORS (user-specific)
DROP POLICY IF EXISTS "Users can view own suppressors" ON suppressors;
DROP POLICY IF EXISTS "Users can insert own suppressors" ON suppressors;
DROP POLICY IF EXISTS "Users can update own suppressors" ON suppressors;
DROP POLICY IF EXISTS "Users can delete own suppressors" ON suppressors;

CREATE POLICY "Users can view own suppressors" ON suppressors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own suppressors" ON suppressors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own suppressors" ON suppressors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own suppressors" ON suppressors FOR DELETE USING (auth.uid() = user_id);

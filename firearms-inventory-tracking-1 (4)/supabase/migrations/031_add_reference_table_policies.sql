-- Migration 031: Add RLS Policies and Seed Data for Reference Tables

-- ============================================================================
-- PART 1: Enable RLS on Reference Tables
-- ============================================================================

ALTER TABLE optic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE magnifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reticle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE turret_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE mounting_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppressor_materials ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 2: Create RLS Policies (Anyone can read, authenticated can modify)
-- ============================================================================

-- Optic Types
CREATE POLICY "Anyone can view optic types" ON optic_types FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add optic types" ON optic_types FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update optic types" ON optic_types FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete optic types" ON optic_types FOR DELETE USING (auth.uid() IS NOT NULL);

-- Magnifications
CREATE POLICY "Anyone can view magnifications" ON magnifications FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add magnifications" ON magnifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update magnifications" ON magnifications FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete magnifications" ON magnifications FOR DELETE USING (auth.uid() IS NOT NULL);

-- Reticle Types
CREATE POLICY "Anyone can view reticle types" ON reticle_types FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add reticle types" ON reticle_types FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update reticle types" ON reticle_types FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete reticle types" ON reticle_types FOR DELETE USING (auth.uid() IS NOT NULL);

-- Turret Types
CREATE POLICY "Anyone can view turret types" ON turret_types FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add turret types" ON turret_types FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update turret types" ON turret_types FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete turret types" ON turret_types FOR DELETE USING (auth.uid() IS NOT NULL);

-- Mounting Types
CREATE POLICY "Anyone can view mounting types" ON mounting_types FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add mounting types" ON mounting_types FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update mounting types" ON mounting_types FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete mounting types" ON mounting_types FOR DELETE USING (auth.uid() IS NOT NULL);

-- Suppressor Materials
CREATE POLICY "Anyone can view suppressor materials" ON suppressor_materials FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add suppressor materials" ON suppressor_materials FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update suppressor materials" ON suppressor_materials FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete suppressor materials" ON suppressor_materials FOR DELETE USING (auth.uid() IS NOT NULL);

-- Migration 023: Complete Reference Tables and Feature Tables
-- This migration creates the missing field_of_view_ranges table and adds
-- proper indexes to feature tables (test_quality_scores, quality_gate_config, stock_alert_rules)

-- ============================================================================
-- PART 1: Create field_of_view_ranges table
-- ============================================================================

CREATE TABLE IF NOT EXISTS field_of_view_ranges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  magnification TEXT NOT NULL,
  min_fov DECIMAL(6,2),
  max_fov DECIMAL(6,2),
  typical_fov DECIMAL(6,2),
  unit TEXT DEFAULT 'degrees',
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(magnification)
);

-- Create indexes for field_of_view_ranges
CREATE INDEX IF NOT EXISTS idx_fov_magnification ON field_of_view_ranges(magnification);
CREATE INDEX IF NOT EXISTS idx_fov_active ON field_of_view_ranges(is_active);
CREATE INDEX IF NOT EXISTS idx_fov_display_order ON field_of_view_ranges(display_order);

-- Enable RLS
ALTER TABLE field_of_view_ranges ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view FOV ranges" ON field_of_view_ranges
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add FOV ranges" ON field_of_view_ranges
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update FOV ranges" ON field_of_view_ranges
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete FOV ranges" ON field_of_view_ranges
  FOR DELETE USING (auth.uid() IS NOT NULL);

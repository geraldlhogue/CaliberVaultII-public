-- Migration 024: Seed FOV data and add indexes to feature tables

-- ============================================================================
-- PART 1: Seed field_of_view_ranges
-- ============================================================================

INSERT INTO field_of_view_ranges (magnification, min_fov, max_fov, typical_fov, unit, description, display_order) VALUES
  ('1x', 100.0, 180.0, 120.0, 'degrees', 'Red dots and holographic sights', 1),
  ('2x', 30.0, 50.0, 40.0, 'degrees', 'Low power magnifiers', 2),
  ('3x', 20.0, 35.0, 27.0, 'degrees', 'Medium magnifiers', 3),
  ('4x', 15.0, 25.0, 20.0, 'degrees', 'ACOG and similar', 4),
  ('1-4x', 15.0, 100.0, 25.0, 'degrees', 'Low power variable optics (LPVO)', 5),
  ('1-6x', 12.0, 100.0, 20.0, 'degrees', 'LPVO extended range', 6),
  ('1-8x', 10.0, 100.0, 18.0, 'degrees', 'LPVO extended range', 7),
  ('2-10x', 8.0, 40.0, 12.0, 'degrees', 'Mid-range variable', 8),
  ('3-9x', 8.0, 30.0, 12.0, 'degrees', 'Popular hunting scope', 9),
  ('4-12x', 6.0, 20.0, 9.0, 'degrees', 'Versatile hunting/target', 10),
  ('4-16x', 5.0, 20.0, 7.5, 'degrees', 'Long range hunting', 11),
  ('5-25x', 3.0, 15.0, 5.0, 'degrees', 'Precision long range', 12),
  ('6-24x', 3.0, 12.0, 4.5, 'degrees', 'Target and tactical', 13),
  ('10x', 8.0, 12.0, 10.0, 'degrees', 'Fixed 10x magnification', 14),
  ('16x', 5.0, 8.0, 6.0, 'degrees', 'Fixed 16x magnification', 15),
  ('20x', 4.0, 6.0, 5.0, 'degrees', 'Fixed 20x magnification', 16),
  ('25x', 3.0, 5.0, 4.0, 'degrees', 'Fixed 25x magnification', 17)
ON CONFLICT (magnification) DO NOTHING;

-- ============================================================================
-- PART 2: Add indexes to test_quality_scores
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_test_quality_user_id ON test_quality_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_test_quality_file_path ON test_quality_scores(file_path);
CREATE INDEX IF NOT EXISTS idx_test_quality_overall_score ON test_quality_scores(overall_score);
CREATE INDEX IF NOT EXISTS idx_test_quality_created_at ON test_quality_scores(created_at);
CREATE INDEX IF NOT EXISTS idx_test_quality_pr_number ON test_quality_scores(pr_number);
CREATE INDEX IF NOT EXISTS idx_test_quality_branch ON test_quality_scores(branch_name);

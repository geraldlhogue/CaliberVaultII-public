-- Migration 032: Seed Reference Data for All Categories

-- ============================================================================
-- PART 1: Seed Optic Types
-- ============================================================================

INSERT INTO optic_types (name, description, display_order) VALUES
  ('Scope', 'Traditional rifle scope with magnification', 1),
  ('Red Dot', 'Non-magnified red dot sight', 2),
  ('Holographic', 'Holographic weapon sight', 3),
  ('Magnifier', 'Magnifier for red dot sights', 4),
  ('Iron Sights', 'Traditional iron sights', 5)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- PART 2: Seed Magnifications
-- ============================================================================

INSERT INTO magnifications (name, description, display_order) VALUES
  ('1x', 'No magnification', 1),
  ('2x', '2x magnification', 2),
  ('3x', '3x magnification', 3),
  ('4x', '4x magnification', 4),
  ('3-9x', 'Variable 3-9x magnification', 5),
  ('4-12x', 'Variable 4-12x magnification', 6),
  ('5-25x', 'Variable 5-25x magnification', 7),
  ('6-24x', 'Variable 6-24x magnification', 8),
  ('1-4x', 'Variable 1-4x magnification', 9),
  ('1-6x', 'Variable 1-6x magnification', 10),
  ('1-8x', 'Variable 1-8x magnification', 11),
  ('2-10x', 'Variable 2-10x magnification', 12)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- PART 3: Seed Reticle Types
-- ============================================================================

INSERT INTO reticle_types (name, description, display_order) VALUES
  ('Crosshair', 'Simple crosshair reticle', 1),
  ('Mil-Dot', 'Mil-dot ranging reticle', 2),
  ('BDC', 'Bullet drop compensating reticle', 3),
  ('Illuminated', 'Illuminated reticle', 4),
  ('MOA', 'MOA-based reticle', 5),
  ('MRAD', 'MRAD-based reticle', 6),
  ('Duplex', 'Duplex crosshair', 7),
  ('German #4', 'German #4 reticle', 8),
  ('Horus', 'Horus grid reticle', 9),
  ('Tremor', 'Tremor ranging reticle', 10)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- PART 4: Seed Turret Types
-- ============================================================================

INSERT INTO turret_types (name, description, display_order) VALUES
  ('Capped', 'Capped turrets for protection', 1),
  ('Exposed', 'Exposed tactical turrets', 2),
  ('Zero-Stop', 'Zero-stop turrets', 3),
  ('Locking', 'Locking turrets', 4),
  ('Tool-less', 'Tool-less adjustment turrets', 5)
ON CONFLICT (name) DO NOTHING;

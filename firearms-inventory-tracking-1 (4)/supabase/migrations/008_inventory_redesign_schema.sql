-- Migration: Inventory Redesign Schema
-- This migration creates the new category-specific tables and reference tables
-- for the inventory redesign

-- First, create user_profiles table if it doesn't exist (needed for auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- User Profiles Policies (drop if exists and recreate)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ========================================
-- REFERENCE TABLES (Table-Driven Fields)
-- ========================================
-- 3. Bullets: Items with category containing 'bullet', 'projectile'
-- 4. Powder: Items with category containing 'powder'
-- 5. Primers: Items with category containing 'primer'
-- 6. Casings: Items with category containing 'brass', 'casing'

-- Data migration function to be run separately
CREATE OR REPLACE FUNCTION migrate_inventory_to_new_schema()
RETURNS void AS $$
BEGIN
  -- Migration logic will be implemented based on existing data patterns
  -- This is a placeholder for the actual migration
  RAISE NOTICE 'Data migration from inventory_items to new tables needs to be implemented';
END;
$$ LANGUAGE plpgsql;
-- Migration: Fix Firearms Serial Number Unique Constraint
-- Allow multiple NULL serial numbers while preventing duplicate non-NULL serial numbers

-- Drop the existing unique constraint
ALTER TABLE firearms DROP CONSTRAINT IF EXISTS firearms_user_id_serial_number_key;

-- Create a partial unique index that only applies when serial_number IS NOT NULL
-- This allows multiple firearms with NULL serial numbers (for firearms without serial numbers)
-- while still preventing duplicate serial numbers for actual serial numbers
CREATE UNIQUE INDEX IF NOT EXISTS firearms_user_serial_unique 
ON firearms(user_id, serial_number) 
WHERE serial_number IS NOT NULL;

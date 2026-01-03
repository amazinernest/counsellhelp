-- Counselor Availability Schema Migration
-- Run this in Supabase SQL Editor

-- Add availability_hours column to counselor_profiles
-- Format: JSONB with days as keys and array of time ranges as values
-- Example: {"monday": [{"start": "09:00", "end": "17:00"}], "tuesday": [], ...}

ALTER TABLE counselor_profiles 
ADD COLUMN IF NOT EXISTS availability_hours JSONB DEFAULT '{
  "monday": [],
  "tuesday": [],
  "wednesday": [],
  "thursday": [],
  "friday": [],
  "saturday": [],
  "sunday": []
}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN counselor_profiles.availability_hours IS 'JSON object with day names as keys and arrays of {start, end} time objects as values';

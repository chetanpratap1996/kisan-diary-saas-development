-- Migration: Add farmer profile fields and farm detail fields
-- Run this if you have an existing PostgreSQL database

ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS village VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS pincode VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS pm_kisan_id VARCHAR(50);

ALTER TABLE farms ADD COLUMN IF NOT EXISTS land_type VARCHAR(50);
ALTER TABLE farms ADD COLUMN IF NOT EXISTS irrigation_source VARCHAR(50);
ALTER TABLE farms ADD COLUMN IF NOT EXISTS soil_type VARCHAR(50);

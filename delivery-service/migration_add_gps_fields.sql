-- Migration: Add GPS coordinates for restaurant and delivery locations
-- Date: 2025-12-02
-- Purpose: Fix map display issue - add real GPS coordinates instead of hardcoded values

ALTER TABLE deliveries 
ADD COLUMN restaurant_lat DOUBLE DEFAULT NULL AFTER restaurant_address,
ADD COLUMN restaurant_lng DOUBLE DEFAULT NULL AFTER restaurant_lat,
ADD COLUMN delivery_lat DOUBLE DEFAULT NULL AFTER delivery_full_name,
ADD COLUMN delivery_lng DOUBLE DEFAULT NULL AFTER delivery_lat;

-- Update existing records with default HCM coordinates (optional)
-- UPDATE deliveries 
-- SET 
--   restaurant_lat = 10.7769,
--   restaurant_lng = 106.7009,
--   delivery_lat = 10.7245,
--   delivery_lng = 106.7412
-- WHERE restaurant_lat IS NULL;

SELECT 'Migration completed: Added GPS fields to deliveries table' as status;

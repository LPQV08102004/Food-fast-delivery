-- Fix null version field in products table
-- This script updates all products with null version to 0

UPDATE products SET version = 0 WHERE version IS NULL;

-- Ensure the column has a default value for future inserts
ALTER TABLE products MODIFY COLUMN version BIGINT DEFAULT 0;

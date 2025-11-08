-- Migration script để thêm các cột payment và delivery vào bảng orders
-- Chỉ chạy script này nếu Hibernate không tự động tạo được

USE order_service;

-- Thêm các cột payment
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) COMMENT 'card, wallet, cash',
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) COMMENT 'SUCCESS, FAILED, PENDING';

-- Thêm các cột delivery information
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS delivery_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS delivery_address VARCHAR(500),
ADD COLUMN IF NOT EXISTS delivery_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

-- Kiểm tra kết quả
DESCRIBE orders;


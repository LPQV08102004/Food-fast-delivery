-- Migration script để thêm liên kết giữa Restaurant và User (role RESTAURANT)
-- Thực thi script này để cập nhật cơ sở dữ liệu

-- Bước 1: Thêm cột user_id vào bảng restaurants (nếu chưa có)
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS user_id BIGINT;

-- Bước 2: Thêm cột description
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS description VARCHAR(1000);

-- Bước 3: Thêm cột rating với giá trị mặc định
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS rating DOUBLE PRECISION DEFAULT 0.0;

-- Bước 4: Thêm cột is_active với giá trị mặc định
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Bước 5: Cập nhật các giá trị NULL thành giá trị mặc định
UPDATE restaurants SET rating = 0.0 WHERE rating IS NULL;
UPDATE restaurants SET is_active = TRUE WHERE is_active IS NULL;

-- Bước 6: Thêm constraint NOT NULL cho user_id sau khi dữ liệu đã được cập nhật
-- CHÚ Ý: Bạn cần cập nhật dữ liệu hiện có trước khi thực thi lệnh này
-- ALTER TABLE restaurants
-- ALTER COLUMN user_id SET NOT NULL;

-- Bước 7: Thêm unique constraint cho user_id (mỗi user chỉ có 1 restaurant)
-- CHÚ Ý: Chỉ thực thi sau khi đã cập nhật user_id cho các restaurant hiện có
-- ALTER TABLE restaurants
-- ADD CONSTRAINT uk_restaurant_user_id UNIQUE (user_id);

-- Bước 8: Thêm index cho user_id để tăng tốc độ query
CREATE INDEX IF NOT EXISTS idx_restaurant_user_id ON restaurants(user_id);

-- Bước 9: Thêm index cho is_active
CREATE INDEX IF NOT EXISTS idx_restaurant_is_active ON restaurants(is_active);

-- Lưu ý:
-- 1. Trước khi thêm constraint NOT NULL và UNIQUE cho user_id,
--    bạn cần đảm bảo tất cả các restaurant hiện có đều có user_id hợp lệ
-- 2. Đảm bảo rằng trong bảng users đã có role RESTAURANT
-- 3. Mỗi user có role RESTAURANT chỉ được có tối đa 1 restaurant

-- Ví dụ cập nhật user_id cho restaurant hiện có (sửa theo dữ liệu thực tế):
-- UPDATE restaurants SET user_id = 1 WHERE id = 1;
-- UPDATE restaurants SET user_id = 2 WHERE id = 2;


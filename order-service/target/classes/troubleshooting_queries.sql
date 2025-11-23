-- =============================================================================
-- TROUBLESHOOTING SQL QUERIES - Orders Page Loading Issues
-- =============================================================================
-- Hướng dẫn sử dụng:
-- 1. Kết nối vào MySQL: docker exec -it mysql-db mysql -u root -p
-- 2. Switch database: USE order_db;
-- 3. Thay [USER_ID_HERE] bằng userId thực tế của user gặp vấn đề
-- =============================================================================

USE order_db;

-- =============================================================================
-- BƯỚC 1: KIỂM TRA CƠ BẢN - User có orders không?
-- =============================================================================

-- Query 1.1: Đếm số lượng orders của user
SELECT
    'Total Orders' as metric,
    COUNT(*) as count
FROM orders
WHERE userId = [USER_ID_HERE];

-- Query 1.2: Xem danh sách orders gần nhất
SELECT
    id,
    userId,
    status,
    totalPrice,
    paymentMethod,
    paymentStatus,
    createdAt,
    updatedAt
FROM orders
WHERE userId = [USER_ID_HERE]
ORDER BY createdAt DESC
LIMIT 10;

-- Query 1.3: Kiểm tra phân bố theo status
SELECT
    status,
    COUNT(*) as count,
    SUM(totalPrice) as total_revenue
FROM orders
WHERE userId = [USER_ID_HERE]
GROUP BY status;

-- =============================================================================
-- BƯỚC 2: KIỂM TRA DỮ LIỆU HỎNG (DATA CORRUPTION)
-- =============================================================================

-- Query 2.1: Orders thiếu totalPrice hoặc có giá trị âm
SELECT
    id,
    userId,
    totalPrice,
    status,
    createdAt
FROM orders
WHERE userId = [USER_ID_HERE]
  AND (totalPrice IS NULL OR totalPrice < 0);

-- Query 2.2: Orders không có items (orphan orders)
SELECT
    o.id,
    o.userId,
    o.totalPrice,
    o.status,
    o.createdAt,
    COUNT(oi.id) as items_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.userId = [USER_ID_HERE]
GROUP BY o.id, o.userId, o.totalPrice, o.status, o.createdAt
HAVING items_count = 0;

-- Query 2.3: Order items thiếu thông tin quan trọng
SELECT
    oi.id,
    oi.order_id,
    oi.productId,
    oi.productName,
    oi.quantity,
    oi.price,
    o.userId
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.userId = [USER_ID_HERE]
  AND (
    oi.price IS NULL
    OR oi.quantity IS NULL
    OR oi.quantity <= 0
    OR oi.productName IS NULL
    OR oi.productName = ''
  );

-- Query 2.4: Orders có status không hợp lệ
SELECT
    id,
    userId,
    status,
    totalPrice,
    createdAt
FROM orders
WHERE userId = [USER_ID_HERE]
  AND status NOT IN ('NEW', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED', 'CANCELLED');

-- Query 2.5: Orders có paymentStatus không hợp lệ
SELECT
    id,
    userId,
    paymentMethod,
    paymentStatus,
    totalPrice,
    createdAt
FROM orders
WHERE userId = [USER_ID_HERE]
  AND (
    paymentStatus IS NULL
    OR paymentStatus NOT IN ('SUCCESS', 'FAILED', 'PENDING')
  );

-- Query 2.6: Orders có totalPrice không khớp với tổng items
SELECT
    o.id,
    o.totalPrice as order_total,
    COALESCE(SUM(oi.price * oi.quantity), 0) as calculated_total,
    ABS(o.totalPrice - COALESCE(SUM(oi.price * oi.quantity), 0)) as difference
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.userId = [USER_ID_HERE]
GROUP BY o.id, o.totalPrice
HAVING difference > 0.01;  -- Cho phép sai số 1 cent

-- =============================================================================
-- BƯỚC 3: KIỂM TRA HIỆU SUẤT (PERFORMANCE)
-- =============================================================================

-- Query 3.1: Kiểm tra user có quá nhiều orders không
SELECT
    userId,
    COUNT(*) as total_orders,
    MIN(createdAt) as first_order_date,
    MAX(createdAt) as last_order_date,
    DATEDIFF(MAX(createdAt), MIN(createdAt)) as days_active,
    COUNT(*) / (DATEDIFF(MAX(createdAt), MIN(createdAt)) + 1) as avg_orders_per_day
FROM orders
WHERE userId = [USER_ID_HERE]
GROUP BY userId;

-- Query 3.2: Kiểm tra orders có quá nhiều items không
SELECT
    o.id,
    o.createdAt,
    COUNT(oi.id) as items_count,
    o.totalPrice
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.userId = [USER_ID_HERE]
GROUP BY o.id, o.createdAt, o.totalPrice
ORDER BY items_count DESC
LIMIT 10;

-- Query 3.3: Kiểm tra bảng có index chưa
SHOW INDEX FROM orders WHERE Column_name = 'userId';
SHOW INDEX FROM order_items WHERE Column_name = 'order_id';

-- =============================================================================
-- BƯỚC 4: SỬA DỮ LIỆU HỎNG (DATA REPAIR)
-- =============================================================================
-- ⚠️ CẢNH BÁO: Chỉ chạy sau khi đã backup database!
-- =============================================================================

-- Fix 4.1: Sửa orders thiếu totalPrice (tính lại từ items)
UPDATE orders o
SET totalPrice = (
    SELECT COALESCE(SUM(price * quantity), 0)
    FROM order_items
    WHERE order_id = o.id
)
WHERE o.userId = [USER_ID_HERE]
  AND o.totalPrice IS NULL;

-- Fix 4.2: Sửa paymentStatus NULL thành PENDING
UPDATE orders
SET paymentStatus = 'PENDING'
WHERE userId = [USER_ID_HERE]
  AND paymentStatus IS NULL;

-- Fix 4.3: Xóa order items hỏng (⚠️ Cẩn thận!)
-- Tạo backup trước:
-- CREATE TABLE order_items_backup_20251116 AS SELECT * FROM order_items;

DELETE FROM order_items
WHERE order_id IN (
    SELECT id FROM orders WHERE userId = [USER_ID_HERE]
)
AND (price IS NULL OR quantity IS NULL OR quantity <= 0);

-- Fix 4.4: Xóa orders không có items (⚠️ Cẩn thận!)
DELETE o FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.userId = [USER_ID_HERE]
  AND oi.id IS NULL;

-- =============================================================================
-- BƯỚC 5: TẠO INDEX ĐỂ TĂNG HIỆU SUẤT
-- =============================================================================

-- Kiểm tra index hiện tại
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'order_db'
  AND TABLE_NAME IN ('orders', 'order_items');

-- Tạo index nếu chưa có (cải thiện performance)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(userId);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(createdAt);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- =============================================================================
-- BƯỚC 6: KIỂM TRA USER ACCOUNT (nếu cần)
-- =============================================================================

-- Switch sang user database
USE user_db;

-- Kiểm tra thông tin user
SELECT
    id,
    username,
    email,
    role,
    enabled,
    created_at
FROM users
WHERE id = [USER_ID_HERE];

-- =============================================================================
-- BƯỚC 7: EXPORT DATA ĐỂ PHÂN TÍCH
-- =============================================================================

-- Export orders của user ra file CSV (chạy từ terminal)
-- mysql -u root -p -e "SELECT * FROM orders WHERE userId = [USER_ID_HERE]" order_db > user_orders.csv

-- =============================================================================
-- BƯỚC 8: TẠO TEST DATA (nếu cần test)
-- =============================================================================

-- Tạo 1 order mẫu để test
-- INSERT INTO orders (userId, totalPrice, status, paymentMethod, paymentStatus, createdAt, updatedAt)
-- VALUES ([USER_ID_HERE], 25.50, 'DELIVERED', 'card', 'SUCCESS', NOW(), NOW());

-- Lấy orderId vừa tạo
-- SET @order_id = LAST_INSERT_ID();

-- Tạo order items mẫu
-- INSERT INTO order_items (order_id, productId, productName, quantity, price)
-- VALUES
-- (@order_id, 1, 'Pizza Margherita', 2, 10.00),
-- (@order_id, 2, 'Coca Cola', 1, 2.50);

-- =============================================================================
-- USEFUL MONITORING QUERIES
-- =============================================================================

-- Kiểm tra tổng quan toàn hệ thống
SELECT
    COUNT(DISTINCT userId) as total_users,
    COUNT(*) as total_orders,
    SUM(totalPrice) as total_revenue,
    AVG(totalPrice) as avg_order_value
FROM orders;

-- Top users với nhiều orders nhất
SELECT
    userId,
    COUNT(*) as order_count,
    SUM(totalPrice) as total_spent
FROM orders
GROUP BY userId
ORDER BY order_count DESC
LIMIT 10;


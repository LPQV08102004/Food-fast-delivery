-- Migration: Tạo bảng drones và seed data
-- Date: 2025-11-30
-- Purpose: Quản lý drone giao hàng

-- Tạo bảng drones
CREATE TABLE IF NOT EXISTS drones (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    drone_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    status ENUM('AVAILABLE','BUSY','MAINTENANCE','CHARGING','OFFLINE') NOT NULL DEFAULT 'AVAILABLE',
    battery_level INT NOT NULL DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),

    -- GPS location
    current_lat DOUBLE,
    current_lng DOUBLE,

    -- Thông số kỹ thuật
    max_speed DOUBLE NOT NULL DEFAULT 50.0,
    max_range DOUBLE NOT NULL DEFAULT 10.0,
    max_payload DOUBLE NOT NULL DEFAULT 3.0,

    -- Thống kê
    total_deliveries INT NOT NULL DEFAULT 0,
    total_distance DOUBLE NOT NULL DEFAULT 0.0,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_maintenance_at TIMESTAMP,

    INDEX idx_status (status),
    INDEX idx_battery (battery_level),
    INDEX idx_location (current_lat, current_lng)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed data: Tạo 10 drone mẫu cho hệ thống
INSERT INTO drones (drone_code, name, status, battery_level, current_lat, current_lng, max_speed, max_range, max_payload) VALUES
-- Drones sẵn sàng (khu vực Quận 1 - HCM)
('DRONE-A001', 'Sky Falcon Alpha 1', 'AVAILABLE', 98, 10.7769, 106.7009, 55.0, 12.0, 3.5),
('DRONE-A002', 'Sky Falcon Alpha 2', 'AVAILABLE', 95, 10.7821, 106.6958, 52.0, 11.0, 3.0),
('DRONE-A003', 'Sky Falcon Alpha 3', 'AVAILABLE', 100, 10.7750, 106.7050, 50.0, 10.0, 3.0),

-- Drones sẵn sàng (khu vực Quận 3)
('DRONE-B001', 'Sky Falcon Beta 1', 'AVAILABLE', 88, 10.7892, 106.7123, 48.0, 10.0, 2.8),
('DRONE-B002', 'Sky Falcon Beta 2', 'AVAILABLE', 92, 10.7800, 106.7100, 50.0, 10.5, 3.0),

-- Drones sẵn sàng (khu vực Quận 7)
('DRONE-C001', 'Sky Falcon Gamma 1', 'AVAILABLE', 85, 10.7340, 106.7220, 53.0, 11.5, 3.2),
('DRONE-C002', 'Sky Falcon Gamma 2', 'AVAILABLE', 90, 10.7280, 106.7180, 51.0, 11.0, 3.0),

-- Drone đang giao hàng
('DRONE-X001', 'Sky Express 1', 'BUSY', 72, 10.7650, 106.6920, 60.0, 15.0, 4.0),

-- Drone đang bảo trì
('DRONE-M001', 'Sky Maintenance 1', 'MAINTENANCE', 0, 10.7769, 106.7009, 50.0, 10.0, 3.0),

-- Drone đang sạc
('DRONE-CH01', 'Sky Charger 1', 'CHARGING', 45, 10.7769, 106.7009, 50.0, 10.0, 3.0);

-- Cập nhật bảng deliveries để add thêm field ETA và distance
ALTER TABLE deliveries
ADD COLUMN IF NOT EXISTS estimated_arrival TIMESTAMP AFTER completed_at,
ADD COLUMN IF NOT EXISTS distance_remaining DOUBLE AFTER current_lng,
ADD COLUMN IF NOT EXISTS current_speed DOUBLE AFTER distance_remaining;

-- Tạo index cho performance
CREATE INDEX IF NOT EXISTS idx_deliveries_drone_id ON deliveries(drone_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);

-- View: Thống kê drone
CREATE OR REPLACE VIEW drone_statistics AS
SELECT
    status,
    COUNT(*) as count,
    AVG(battery_level) as avg_battery,
    SUM(total_deliveries) as total_deliveries,
    SUM(total_distance) as total_distance
FROM drones
GROUP BY status;

-- View: Active deliveries với drone info
CREATE OR REPLACE VIEW active_deliveries_with_drone AS
SELECT
    d.id as delivery_id,
    d.order_id,
    d.status as delivery_status,
    d.drone_id,
    dr.name as drone_name,
    dr.battery_level,
    dr.current_lat as drone_lat,
    dr.current_lng as drone_lng,
    d.delivery_address,
    d.estimated_arrival,
    d.distance_remaining,
    d.created_at
FROM deliveries d
LEFT JOIN drones dr ON d.drone_id = dr.drone_code
WHERE d.status IN ('ASSIGNED', 'PICKING_UP', 'PICKED_UP', 'DELIVERING');

-- Verify installation
SELECT 'Drones table created successfully!' as message;
SELECT COUNT(*) as total_drones FROM drones;
SELECT status, COUNT(*) as count FROM drones GROUP BY status;


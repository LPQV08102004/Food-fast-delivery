package vn.cnpm.delivery_service.model;

/**
 * Enum trạng thái của Drone
 */
public enum DroneStatus {
    AVAILABLE,      // Sẵn sàng nhận đơn
    BUSY,           // Đang giao hàng
    MAINTENANCE,    // Bảo trì
    CHARGING,       // Đang sạc pin
    OFFLINE         // Offline/không hoạt động
}



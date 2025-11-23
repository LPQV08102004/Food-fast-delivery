package vn.cnpm.delivery_service.model;

public enum DeliveryStatus {
    PENDING,           // Chờ gán drone
    ASSIGNED,          // Đã gán drone
    PICKING_UP,        // Drone đang đến nhà hàng
    PICKED_UP,         // Drone đã lấy hàng
    DELIVERING,        // Đang giao hàng
    COMPLETED,         // Hoàn thành
    CANCELLED          // Đã hủy
}

package vn.cnpm.order_service.model;

public enum OrderStatus {
    NEW,               // Đơn hàng mới
    CONFIRMED,         // Đã xác nhận
    PREPARING,         // Nhà hàng đang chế biến
    READY,             // Món ăn đã sẵn sàng
    PICKED_UP,         // Drone đã lấy hàng
    DELIVERING,        // Đang giao hàng
    DELIVERED,         // Đã giao hàng thành công
    CANCELLED          // Đã hủy
}

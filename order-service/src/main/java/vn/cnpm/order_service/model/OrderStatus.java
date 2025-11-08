package vn.cnpm.order_service.model;

public enum OrderStatus {
    NEW,
    PAYMENT_PENDING,
    PAID,
    CANCELLED,
    FAILED,
    PREPARING,
    CONFIRMED,
    DELIVERED
}

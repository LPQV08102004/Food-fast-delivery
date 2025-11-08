package vn.cnpm.order_service.DTO;

import vn.cnpm.order_service.model.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private Long userId;
    private Double totalPrice;
    private OrderStatus status;
    private String paymentMethod;
    private String paymentStatus;
    private Instant createdAt;
    private Instant updatedAt;
    private List<OrderItemResponse> orderItems;

    @Data
    @Builder
    public static class OrderItemResponse {
        private Long productId;
        private String productName;  // Thêm tên sản phẩm
        private Integer quantity;
        private Double price;
    }
}

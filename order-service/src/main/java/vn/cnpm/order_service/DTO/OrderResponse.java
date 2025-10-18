package vn.cnpm.order_service.DTO;

import vn.cnpm.order_service.model.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private Long userId;
    private String product;
    private Double price;
    private OrderStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}

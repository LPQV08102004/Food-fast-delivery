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
    private Double totalPrice;
    private OrderStatus status;
    private List<OrderItemResponse> items;
    @Data
    @Builder
    public static class OrderItemResponse {
    private Long productId;
    private Integer quantity;
    private Double price;}
}


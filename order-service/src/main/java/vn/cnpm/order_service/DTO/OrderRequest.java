package vn.cnpm.order_service.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    @NotNull
    private Long userId;
    private List<OrderItemRequest> items;
    private Double totalPrice;  // Thêm totalPrice để nhận từ frontend

    @Data
    public static class OrderItemRequest {
        private long productId;
        private int quantity;
    }
}

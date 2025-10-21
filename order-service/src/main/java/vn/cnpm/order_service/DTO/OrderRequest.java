package vn.cnpm.order_service.DTO;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    @NotNull
    private Long userId;
    private List<OrderItemRequest> items;
    @Data
    public static class OrderItemRequest {
        private long productId;
        private int quantity;
    }
}

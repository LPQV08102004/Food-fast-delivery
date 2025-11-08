package vn.cnpm.order_service.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    @NotNull
    private Long userId;
    private List<OrderItemRequest> items;
    private Double totalPrice;

    // Thêm thông tin payment
    private String paymentMethod;  // card, wallet, cash
    private DeliveryInfo deliveryInfo;

    @Data
    public static class OrderItemRequest {
        private long productId;
        private int quantity;
    }

    @Data
    public static class DeliveryInfo {
        private String fullName;
        private String phone;
        private String address;
        private String city;
        private String notes;
    }
}

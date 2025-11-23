package vn.cnpm.order_service.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    @NotNull
    private Long userId;
    
    @NotNull(message = "Restaurant ID is required")
    private Long restaurantId;  // ID nhà hàng
    
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
        @NotNull(message = "Full name is required")
        private String fullName;
        
        @NotNull(message = "Phone is required")
        private String phone;
        
        @NotNull(message = "Address is required")
        private String address;
        
        @NotNull(message = "City is required")
        private String city;
        
        private String notes;
    }
}

package vn.cnpm.order_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreatedEvent implements Serializable {
    private Long orderId;
    private Long userId;
    private Long restaurantId;
    private Double totalPrice;
    private String paymentMethod;
    private String deliveryAddress;
    private String deliveryPhone;
    private String deliveryFullName;
}


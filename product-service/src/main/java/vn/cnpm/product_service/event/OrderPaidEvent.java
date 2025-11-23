package vn.cnpm.product_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPaidEvent implements Serializable {
    private Long orderId;
    private Long userId;
    private Long restaurantId;
    private Double totalPrice;
    private String deliveryAddress;
    private String deliveryPhone;
    private String deliveryFullName;
}

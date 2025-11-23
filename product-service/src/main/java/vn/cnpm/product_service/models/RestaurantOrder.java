package vn.cnpm.product_service.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "restaurant_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;  // ID đơn hàng từ Order Service
    private Long restaurantId;
    private Long userId;
    private Double totalPrice;
    private String status;  // PENDING_CONFIRMATION, PREPARING, READY

    // Delivery info
    private String deliveryFullName;
    private String deliveryPhone;
    private String deliveryAddress;

    private Instant createdAt;
    private Instant confirmedAt;  // Thời điểm nhà hàng xác nhận
    private Instant readyAt;      // Thời điểm món ăn sẵn sàng

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}

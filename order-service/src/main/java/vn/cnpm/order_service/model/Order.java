package vn.cnpm.order_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long restaurantId;  // ID nhà hàng
    private Double totalPrice;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    // Thêm thông tin payment
    private String paymentMethod;  // card, wallet, cash
    private String paymentStatus;  // SUCCESS, FAILED, PENDING

    // Thêm thông tin delivery
    private String deliveryFullName;
    private String deliveryPhone;
    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryNotes;
    
    // Thông tin drone giao hàng
    private String droneId;
    private Instant pickedUpAt;  // Thời điểm drone lấy hàng
    private Instant deliveredAt; // Thời điểm giao hàng thành công

    private Instant createdAt;
    private Instant updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        updatedAt = createdAt;
        if (status == null) status = OrderStatus.NEW;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}

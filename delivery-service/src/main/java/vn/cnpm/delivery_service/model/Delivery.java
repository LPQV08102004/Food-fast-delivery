package vn.cnpm.delivery_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "deliveries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Delivery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;
    private String droneId;  // ID của drone
    
    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;
    
    // Restaurant info
    private Long restaurantId;
    private String restaurantAddress;
    
    // Customer delivery info
    private String deliveryAddress;
    private String deliveryPhone;
    private String deliveryFullName;
    
    // Timestamps
    private Instant createdAt;       // Khi nhận yêu cầu
    private Instant assignedAt;      // Khi gán drone
    private Instant pickedUpAt;      // Khi drone lấy hàng
    private Instant deliveringAt;    // Khi bắt đầu giao
    private Instant completedAt;     // Khi hoàn thành
    
    // Drone location tracking (giả lập)
    private Double currentLat;
    private Double currentLng;
    private String notes;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        if (status == null) {
            status = DeliveryStatus.PENDING;
        }
    }
}

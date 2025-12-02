package vn.cnpm.order_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCompletedEvent implements Serializable {
    private Long orderId;
    private String droneId;
    private Instant completedAt;
    private Double deliveryLat;
    private Double deliveryLng;
}

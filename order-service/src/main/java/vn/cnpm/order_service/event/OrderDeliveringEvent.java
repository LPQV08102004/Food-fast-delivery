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
public class OrderDeliveringEvent implements Serializable {
    private Long orderId;
    private String droneId;
    private Double currentLat;
    private Double currentLng;
    private Double estimatedMinutes;
}

package vn.cnpm.order_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Event for real-time GPS updates
 * Sent every 5 seconds during delivery
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DroneLocationUpdateEvent implements Serializable {
    private Long orderId;
    private String droneId;
    private String status; // PICKING_UP, PICKED_UP, DELIVERING
    private Double currentLat;
    private Double currentLng;
    private Double distanceRemaining; // km
    private Double currentSpeed; // km/h
    private Long estimatedArrivalSeconds; // seconds
}

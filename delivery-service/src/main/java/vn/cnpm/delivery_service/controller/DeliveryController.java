package vn.cnpm.delivery_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.cnpm.delivery_service.model.Delivery;
import vn.cnpm.delivery_service.repository.DeliveryRepository;
import vn.cnpm.delivery_service.service.DroneService;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
@Slf4j
public class DeliveryController {

    private final DeliveryRepository deliveryRepository;
    private final DroneService droneService;

    /**
     * Lấy tất cả deliveries
     */
    @GetMapping
    public ResponseEntity<List<Delivery>> getAllDeliveries() {
        return ResponseEntity.ok(deliveryRepository.findAll());
    }

    /**
     * Lấy delivery theo orderId
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<Delivery> getDeliveryByOrderId(@PathVariable Long orderId) {
        return deliveryRepository.findByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lấy tất cả deliveries đang hoạt động
     */
    @GetMapping("/active")
    public ResponseEntity<List<Delivery>> getActiveDeliveries() {
        return ResponseEntity.ok(droneService.getActiveDeliveries());
    }

    /**
     * Lấy deliveries theo droneId
     */
    @GetMapping("/drone/{droneId}")
    public ResponseEntity<List<Delivery>> getDeliveriesByDrone(@PathVariable String droneId) {
        return ResponseEntity.ok(deliveryRepository.findByDroneId(droneId));
    }

    /**
     * Cập nhật vị trí drone (cho tracking)
     */
    @PutMapping("/{deliveryId}/location")
    public ResponseEntity<Delivery> updateDroneLocation(
            @PathVariable Long deliveryId,
            @RequestParam Double lat,
            @RequestParam Double lng) {
        try {
            Delivery updated = droneService.updateDroneLocation(deliveryId, lat, lng);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Failed to update drone location", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Lấy thông tin GPS tracking chi tiết
     * GET /api/deliveries/{deliveryId}/gps-tracking
     */
    @GetMapping("/{deliveryId}/gps-tracking")
    public ResponseEntity<?> getGpsTracking(@PathVariable Long deliveryId) {
        try {
            Delivery delivery = deliveryRepository.findById(deliveryId)
                    .orElseThrow(() -> new RuntimeException("Delivery not found"));

            java.util.Map<String, Object> tracking = new java.util.HashMap<>();
            tracking.put("deliveryId", delivery.getId());
            tracking.put("orderId", delivery.getOrderId());
            tracking.put("droneId", delivery.getDroneId());
            tracking.put("status", delivery.getStatus());
            tracking.put("currentLocation", java.util.Map.of(
                    "lat", delivery.getCurrentLat() != null ? delivery.getCurrentLat() : 0,
                    "lng", delivery.getCurrentLng() != null ? delivery.getCurrentLng() : 0
            ));
            tracking.put("distanceRemaining", delivery.getDistanceRemaining());
            tracking.put("currentSpeed", delivery.getCurrentSpeed());
            tracking.put("estimatedArrival", delivery.getEstimatedArrival());
            tracking.put("customerAddress", delivery.getDeliveryAddress());

            return ResponseEntity.ok(tracking);
        } catch (Exception e) {
            log.error("Failed to get GPS tracking", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{deliveryId}/complete")
    public ResponseEntity<Delivery> completeDelivery(@PathVariable Long deliveryId) {
        try {
            Delivery updated = droneService.completeDelivery(deliveryId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Failed to complete delivery", e);
            return ResponseEntity.badRequest().build();
        }
    }
}

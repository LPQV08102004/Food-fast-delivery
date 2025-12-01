package vn.cnpm.delivery_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cnpm.delivery_service.model.Delivery;
import vn.cnpm.delivery_service.model.DeliveryStatus;
import vn.cnpm.delivery_service.model.Drone;
import vn.cnpm.delivery_service.repository.DeliveryRepository;
import vn.cnpm.delivery_service.repository.DroneRepository;

import java.time.Instant;
import java.util.List;

/**
 * Service quản lý drone delivery
 * Giả lập logic giao hàng bằng drone
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DroneService {

    private final DeliveryRepository deliveryRepository;
    private final DroneRepository droneRepository;

    /**
     * Tự động gán drone thông minh cho đơn hàng mới
     * Tìm drone gần nhất, có pin đủ
     */
    @Transactional
    public Delivery assignDrone(Delivery delivery) {
        String droneId = "DRONE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        // Tìm drone sẵn sàng gần nhà hàng nhất
        // Parse restaurant address to get approximate lat/lng (simplified)
        Double restaurantLat = 10.7769; // Default HCM center
        Double restaurantLng = 106.7009;

        Optional<Drone> availableDrone = droneRepository.findNearestAvailableDrone(restaurantLat, restaurantLng);

        Drone drone;
        if (availableDrone.isPresent()) {
            drone = availableDrone.get();
            log.info("Found available drone: {}", drone.getDroneCode());
        } else {
            // Fallback: Tìm bất kỳ drone available nào
            List<Drone> availableDrones = droneRepository.findAvailableDrones();
            if (!availableDrones.isEmpty()) {
                drone = availableDrones.get(0);
                log.info("Using fallback drone: {}", drone.getDroneCode());
            } else {
                log.error("No available drones found!");
                throw new RuntimeException("No available drones at the moment. Please try again later.");
            }
        }

        // Gán drone cho delivery
        delivery.setDroneId(drone.getDroneCode());
        delivery.setPickedUpAt(Instant.now());

        log.info("Drone {} picked up order {} from restaurant",
        // Cập nhật trạng thái drone
        drone.markAsBusy();
        drone.updateLocation(restaurantLat, restaurantLng);
        droneRepository.save(drone);

        log.info("Drone {} assigned to order {}", drone.getDroneCode(), delivery.getOrderId());

        // Tự động chuyển sang PICKING_UP
    public Delivery startDelivery(Long deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));

        if (delivery.getStatus() != DeliveryStatus.PICKED_UP) {
            throw new RuntimeException("Delivery not in PICKED_UP status");
        }

        delivery.setStatus(DeliveryStatus.DELIVERING);
        delivery.setDeliveringAt(Instant.now());
        
        // Giả lập vị trí GPS của drone
        delivery.setCurrentLat(10.7769 + random.nextDouble() * 0.1);  // HCM area
        delivery.setCurrentLng(106.7009 + random.nextDouble() * 0.1);
        
        log.info("Drone {} started delivering order {} to customer", 
                delivery.getDroneId(), delivery.getOrderId());
        
        return deliveryRepository.save(delivery);
    }

    /**
     * Hoàn thành giao hàng
     */
    public Delivery completeDelivery(Long deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));

        if (delivery.getStatus() != DeliveryStatus.DELIVERING) {
            throw new RuntimeException("Delivery not in DELIVERING status");
        }

        delivery.setStatus(DeliveryStatus.COMPLETED);
        delivery.setCompletedAt(Instant.now());
        
        log.info("Drone {} completed delivery for order {}", 
                delivery.getDroneId(), delivery.getOrderId());
        
        return deliveryRepository.save(delivery);
    }

    /**
     * Lấy tất cả delivery đang hoạt động
     */
    public List<Delivery> getActiveDeliveries() {
        return deliveryRepository.findAll().stream()
                .filter(d -> d.getStatus() != DeliveryStatus.COMPLETED 
                        && d.getStatus() != DeliveryStatus.CANCELLED)
                .toList();
    }

    /**
     * Cập nhật vị trí GPS của drone
     */
    @Transactional
    public Delivery updateDroneLocation(Long deliveryId, Double lat, Double lng) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));
        
        delivery.setCurrentLat(lat);
        delivery.setCurrentLng(lng);
        
        return deliveryRepository.save(delivery);
    }
}


package vn.cnpm.delivery_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cnpm.delivery_service.model.Delivery;
import vn.cnpm.delivery_service.model.DeliveryStatus;
import vn.cnpm.delivery_service.model.Drone;
import vn.cnpm.delivery_service.model.DroneStatus;
import vn.cnpm.delivery_service.repository.DeliveryRepository;
import vn.cnpm.delivery_service.repository.DroneRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

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
    private final Random random = new Random();

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
                drone.getDroneCode(), delivery.getOrderId());
        // Cập nhật trạng thái drone
        drone.markAsBusy();
        drone.updateLocation(restaurantLat, restaurantLng);
        droneRepository.save(drone);

        log.info("Drone {} assigned to order {}", drone.getDroneCode(), delivery.getOrderId());

        return deliveryRepository.save(delivery);
    }

    /**
     * Bắt đầu giao hàng
     */
    @Transactional
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

    // ==================== DRONE MANAGEMENT METHODS ====================

    /**
     * Lấy tất cả drone
     */
    public List<Drone> getAllDrones() {
        return droneRepository.findAll();
    }

    /**
     * Lấy drone theo ID
     */
    public Optional<Drone> getDroneById(Long id) {
        return droneRepository.findById(id);
    }

    /**
     * Lấy drone theo code
     */
    public Optional<Drone> getDroneByCode(String droneCode) {
        return droneRepository.findByDroneCode(droneCode);
    }

    /**
     * Lấy tất cả drone sẵn sàng
     */
    public List<Drone> getAvailableDrones() {
        return droneRepository.findAvailableDrones();
    }

    /**
     * Lấy drone theo status
     */
    public List<Drone> getDronesByStatus(DroneStatus status) {
        return droneRepository.findByStatus(status);
    }

    /**
     * Đếm số drone theo status
     */
    public long countDronesByStatus(DroneStatus status) {
        return droneRepository.countByStatus(status);
    }

    /**
     * Tạo drone mới
     */
    @Transactional
    public Drone createDrone(Drone drone) {
        // Validate drone code is unique
        if (droneRepository.findByDroneCode(drone.getDroneCode()).isPresent()) {
            throw new RuntimeException("Drone with code " + drone.getDroneCode() + " already exists");
        }
        
        log.info("Creating new drone: {}", drone.getDroneCode());
        return droneRepository.save(drone);
    }

    /**
     * Cập nhật drone
     */
    @Transactional
    public Drone updateDrone(Long id, Drone droneDetails) {
        Drone drone = droneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Drone not found with id: " + id));

        // Update fields
        if (droneDetails.getDroneCode() != null) {
            drone.setDroneCode(droneDetails.getDroneCode());
        }
        if (droneDetails.getName() != null) {
            drone.setName(droneDetails.getName());
        }
        if (droneDetails.getStatus() != null) {
            drone.setStatus(droneDetails.getStatus());
        }
        if (droneDetails.getBatteryLevel() != null) {
            drone.setBatteryLevel(droneDetails.getBatteryLevel());
        }
        if (droneDetails.getCurrentLat() != null) {
            drone.setCurrentLat(droneDetails.getCurrentLat());
        }
        if (droneDetails.getCurrentLng() != null) {
            drone.setCurrentLng(droneDetails.getCurrentLng());
        }
        if (droneDetails.getMaxSpeed() != null) {
            drone.setMaxSpeed(droneDetails.getMaxSpeed());
        }
        if (droneDetails.getMaxRange() != null) {
            drone.setMaxRange(droneDetails.getMaxRange());
        }
        if (droneDetails.getMaxPayload() != null) {
            drone.setMaxPayload(droneDetails.getMaxPayload());
        }

        log.info("Updated drone: {}", drone.getDroneCode());
        return droneRepository.save(drone);
    }

    /**
     * Xóa drone
     */
    @Transactional
    public void deleteDrone(Long id) {
        Drone drone = droneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Drone not found with id: " + id));
        
        log.info("Deleting drone: {}", drone.getDroneCode());
        droneRepository.delete(drone);
    }

    /**
     * Cập nhật battery level
     */
    @Transactional
    public Drone updateBatteryLevel(Long id, Integer level) {
        Drone drone = droneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Drone not found with id: " + id));
        
        drone.setBatteryLevel(level);
        
        // Auto update status based on battery level
        if (level < 20) {
            drone.setStatus(DroneStatus.CHARGING);
        } else if (drone.getStatus() == DroneStatus.CHARGING && level >= 80) {
            drone.setStatus(DroneStatus.AVAILABLE);
        }
        
        log.info("Updated battery for drone {} to {}%", drone.getDroneCode(), level);
        return droneRepository.save(drone);
    }

    /**
     * Giả lập drone lấy hàng từ nhà hàng
     */
    @Transactional
    public Delivery simulatePickup(Long deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));
        
        delivery.setStatus(DeliveryStatus.PICKED_UP);
        delivery.setPickedUpAt(Instant.now());
        
        log.info("Drone {} picked up order {}", delivery.getDroneId(), delivery.getOrderId());
        
        return deliveryRepository.save(delivery);
    }
}



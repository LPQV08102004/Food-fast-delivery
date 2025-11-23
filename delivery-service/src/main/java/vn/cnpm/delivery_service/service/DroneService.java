package vn.cnpm.delivery_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.cnpm.delivery_service.model.Delivery;
import vn.cnpm.delivery_service.model.DeliveryStatus;
import vn.cnpm.delivery_service.repository.DeliveryRepository;

import java.time.Instant;
import java.util.List;
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
    private final Random random = new Random();

    /**
     * Tự động gán drone cho đơn hàng mới
     */
    public Delivery assignDrone(Delivery delivery) {
        // Giả lập: Tạo ID drone ngẫu nhiên
        String droneId = "DRONE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        delivery.setDroneId(droneId);
        delivery.setStatus(DeliveryStatus.ASSIGNED);
        delivery.setAssignedAt(Instant.now());
        
        log.info("Drone {} assigned to order {}", droneId, delivery.getOrderId());
        
        // Giả lập: Drone tự động bắt đầu bay đến nhà hàng
        delivery.setStatus(DeliveryStatus.PICKING_UP);
        
        return deliveryRepository.save(delivery);
    }

    /**
     * Giả lập drone đến nhà hàng và lấy món ăn
     */
    public Delivery simulatePickup(Long deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));

        if (delivery.getStatus() != DeliveryStatus.PICKING_UP) {
            throw new RuntimeException("Delivery not in PICKING_UP status");
        }

        delivery.setStatus(DeliveryStatus.PICKED_UP);
        delivery.setPickedUpAt(Instant.now());
        
        log.info("Drone {} picked up order {} from restaurant", 
                delivery.getDroneId(), delivery.getOrderId());
        
        return deliveryRepository.save(delivery);
    }

    /**
     * Drone bắt đầu giao hàng đến khách
     */
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
     * Theo dõi vị trí drone (giả lập)
     */
    public Delivery updateDroneLocation(Long deliveryId, Double lat, Double lng) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));
        
        delivery.setCurrentLat(lat);
        delivery.setCurrentLng(lng);
        
        return deliveryRepository.save(delivery);
    }
}

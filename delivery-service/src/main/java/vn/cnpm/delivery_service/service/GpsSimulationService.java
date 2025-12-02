package vn.cnpm.delivery_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cnpm.delivery_service.model.Delivery;
import vn.cnpm.delivery_service.model.DeliveryStatus;
import vn.cnpm.delivery_service.model.Drone;
import vn.cnpm.delivery_service.repository.DeliveryRepository;
import vn.cnpm.delivery_service.repository.DroneRepository;
import vn.cnpm.delivery_service.util.GeoPoint;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Random;

/**
 * Service giả lập GPS tracking cho drone
 * Tự động cập nhật vị trí drone mỗi 5 giây
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GpsSimulationService {

    private final DeliveryRepository deliveryRepository;
    private final DroneRepository droneRepository;
    private final Random random = new Random();

    // Tốc độ drone trung bình (km/h)
    private static final double AVERAGE_DRONE_SPEED = 45.0;

    // Khoảng cách mỗi lần update (km) - với update interval 5s
    // 45 km/h = 0.0125 km/s => 0.0625 km mỗi 5s
    private static final double DISTANCE_PER_UPDATE = (AVERAGE_DRONE_SPEED / 3600.0) * 5.0;

    /**
     * Scheduled task chạy mỗi 5 giây để cập nhật vị trí drone
     */
    @Scheduled(fixedRate = 5000, initialDelay = 10000) // 5s interval, delay 10s để app khởi động
    @Transactional
    public void updateAllActiveDroneLocations() {
        List<Delivery> activeDeliveries = deliveryRepository.findAll().stream()
                .filter(d -> d.getStatus() == DeliveryStatus.PICKING_UP
                          || d.getStatus() == DeliveryStatus.PICKED_UP
                          || d.getStatus() == DeliveryStatus.DELIVERING)
                .toList();

        if (!activeDeliveries.isEmpty()) {
            log.debug("Updating GPS for {} active deliveries", activeDeliveries.size());
        }

        for (Delivery delivery : activeDeliveries) {
            try {
                updateDroneLocationForDelivery(delivery);
            } catch (Exception e) {
                log.error("Error updating GPS for delivery {}: {}", delivery.getId(), e.getMessage());
            }
        }
    }

    /**
     * Cập nhật vị trí GPS cho một delivery
     */
    private void updateDroneLocationForDelivery(Delivery delivery) {
        Optional<Drone> droneOpt = droneRepository.findByDroneCode(delivery.getDroneId());
        if (droneOpt.isEmpty()) {
            log.warn("Drone not found: {}", delivery.getDroneId());
            return;
        }

        Drone drone = droneOpt.get();

        // Parse địa chỉ thành GPS (giả lập - production nên dùng Geocoding API)
        GeoPoint restaurantLocation = parseAddressToGPS(delivery.getRestaurantAddress());
        GeoPoint customerLocation = parseAddressToGPS(delivery.getDeliveryAddress());

        // Lưu GPS của nhà hàng và khách hàng vào delivery nếu chưa có
        if (delivery.getRestaurantLat() == null || delivery.getRestaurantLng() == null) {
            delivery.setRestaurantLat(restaurantLocation.getLat());
            delivery.setRestaurantLng(restaurantLocation.getLng());
        }
        if (delivery.getDeliveryLat() == null || delivery.getDeliveryLng() == null) {
            delivery.setDeliveryLat(customerLocation.getLat());
            delivery.setDeliveryLng(customerLocation.getLng());
        }

        // Lấy vị trí hiện tại của drone
        GeoPoint currentLocation = new GeoPoint(
                drone.getCurrentLat() != null ? drone.getCurrentLat() : restaurantLocation.getLat(),
                drone.getCurrentLng() != null ? drone.getCurrentLng() : restaurantLocation.getLng()
        );

        GeoPoint nextLocation;
        double distanceRemaining;

        // Xác định đích đến dựa vào status
        if (delivery.getStatus() == DeliveryStatus.PICKING_UP) {
            // Đang bay đến nhà hàng
            nextLocation = moveTowards(currentLocation, restaurantLocation, DISTANCE_PER_UPDATE);
            distanceRemaining = nextLocation.distanceTo(restaurantLocation);

            // Nếu đã đến nhà hàng, chuyển status
            if (distanceRemaining < 0.05) { // < 50m
                delivery.setStatus(DeliveryStatus.PICKED_UP);
                delivery.setPickedUpAt(Instant.now());
                log.info("Drone {} picked up order {} from restaurant",
                        drone.getDroneCode(), delivery.getOrderId());

                // Tự động chuyển sang DELIVERING
                delivery.setStatus(DeliveryStatus.DELIVERING);
                delivery.setDeliveringAt(Instant.now());
                nextLocation = restaurantLocation; // Đứng yên tại nhà hàng
            }

        } else {
            // Đang giao hàng cho khách
            nextLocation = moveTowards(currentLocation, customerLocation, DISTANCE_PER_UPDATE);
            distanceRemaining = nextLocation.distanceTo(customerLocation);

            // Nếu đã đến khách, hoàn thành
            if (distanceRemaining < 0.05) { // < 50m
                delivery.setStatus(DeliveryStatus.COMPLETED);
                delivery.setCompletedAt(Instant.now());

                // Release drone
                drone.markAsAvailable();
                drone.setTotalDeliveries(drone.getTotalDeliveries() + 1);
                double totalDistance = restaurantLocation.distanceTo(customerLocation);
                drone.setTotalDistance(drone.getTotalDistance() + totalDistance);
                drone.consumeBattery(totalDistance);

                log.info("Drone {} completed delivery for order {}",
                        drone.getDroneCode(), delivery.getOrderId());
            }
        }

        // Cập nhật GPS
        drone.updateLocation(nextLocation.getLat(), nextLocation.getLng());
        delivery.setCurrentLat(nextLocation.getLat());
        delivery.setCurrentLng(nextLocation.getLng());
        delivery.setDistanceRemaining(distanceRemaining);
        delivery.setCurrentSpeed(AVERAGE_DRONE_SPEED);

        // Tính ETA
        if (distanceRemaining > 0) {
            double hoursRemaining = distanceRemaining / AVERAGE_DRONE_SPEED;
            long secondsRemaining = (long) (hoursRemaining * 3600);
            delivery.setEstimatedArrival(Instant.now().plusSeconds(secondsRemaining));
        }

        droneRepository.save(drone);
        deliveryRepository.save(delivery);

        log.debug("Drone {} at {} - Distance remaining: {:.2f} km",
                drone.getDroneCode(), nextLocation, distanceRemaining);
    }

    /**
     * Di chuyển từ điểm A đến B một khoảng cách nhất định
     */
    private GeoPoint moveTowards(GeoPoint from, GeoPoint to, double maxDistance) {
        double totalDistance = from.distanceTo(to);

        if (totalDistance <= maxDistance) {
            return to; // Đã đến đích
        }

        double ratio = maxDistance / totalDistance;
        return from.interpolate(to, ratio);
    }

    /**
     * Parse địa chỉ thành GPS (giả lập)
     * Production: Dùng Google Geocoding API hoặc OpenStreetMap Nominatim
     */
    public GeoPoint parseAddressToGPS(String address) {
        // Giả lập: Random GPS trong khu vực HCM
        // Quận 1: 10.7769, 106.7009
        // Thêm random offset trong phạm vi ±0.05 degrees (~5km)

        double baseLat = 10.7769;
        double baseLng = 106.7009;

        // Hash address để có kết quả consistent
        int hash = address != null ? address.hashCode() : 0;
        Random r = new Random(hash);

        double lat = baseLat + (r.nextDouble() - 0.5) * 0.1;  // ±5km
        double lng = baseLng + (r.nextDouble() - 0.5) * 0.1;

        return new GeoPoint(lat, lng);
    }

    /**
     * Tính ETA từ khoảng cách và tốc độ
     */
    public Instant calculateETA(double distanceKm, double speedKmh) {
        double hours = distanceKm / speedKmh;
        long seconds = (long) (hours * 3600);
        return Instant.now().plusSeconds(seconds);
    }

    /**
     * Tính khoảng cách giữa 2 địa chỉ
     */
    public double calculateDistance(String addressA, String addressB) {
        GeoPoint pointA = parseAddressToGPS(addressA);
        GeoPoint pointB = parseAddressToGPS(addressB);
        return pointA.distanceTo(pointB);
    }
}


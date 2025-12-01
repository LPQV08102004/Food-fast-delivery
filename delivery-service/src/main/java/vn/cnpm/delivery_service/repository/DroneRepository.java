package vn.cnpm.delivery_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.cnpm.delivery_service.model.Drone;
import vn.cnpm.delivery_service.model.DroneStatus;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho Drone
 */
@Repository
public interface DroneRepository extends JpaRepository<Drone, Long> {

    /**
     * Tìm drone theo mã code
     */
    Optional<Drone> findByDroneCode(String droneCode);

    /**
     * Tìm tất cả drone theo status
     */
    List<Drone> findByStatus(DroneStatus status);

    /**
     * Tìm drone sẵn sàng giao hàng (AVAILABLE và pin >= 30%)
     */
    @Query("SELECT d FROM Drone d WHERE d.status = 'AVAILABLE' AND d.batteryLevel >= 30 ORDER BY d.batteryLevel DESC")
    List<Drone> findAvailableDrones();

    /**
     * Tìm drone gần vị trí nhất (sẵn sàng)
     * Note: Simple implementation, production nên dùng PostGIS
     */
    @Query(value = "SELECT * FROM drones " +
            "WHERE status = 'AVAILABLE' AND battery_level >= 30 " +
            "ORDER BY SQRT(POW(current_lat - :lat, 2) + POW(current_lng - :lng, 2)) ASC " +
            "LIMIT 1", nativeQuery = true)
    Optional<Drone> findNearestAvailableDrone(Double lat, Double lng);

    /**
     * Đếm số drone theo status
     */
    long countByStatus(DroneStatus status);

    /**
     * Kiểm tra drone code đã tồn tại chưa
     */
    boolean existsByDroneCode(String droneCode);
}


package vn.cnpm.delivery_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.cnpm.delivery_service.model.Drone;
import vn.cnpm.delivery_service.model.DroneStatus;
import vn.cnpm.delivery_service.service.DroneService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST API Controller cho quản lý Drone
 */
@RestController
@RequestMapping("/api/drones")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // Allow frontend access
public class DroneController {

    private final DroneService droneService;

    /**
     * Lấy tất cả drone
     * GET /api/drones
     */
    @GetMapping
    public ResponseEntity<List<Drone>> getAllDrones() {
        log.info("GET /api/drones - Get all drones");
        List<Drone> drones = droneService.getAllDrones();
        return ResponseEntity.ok(drones);
    }

    /**
     * Lấy drone theo ID
     * GET /api/drones/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Drone> getDroneById(@PathVariable Long id) {
        log.info("GET /api/drones/{} - Get drone by ID", id);
        return droneService.getDroneById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lấy drone theo code
     * GET /api/drones/code/{droneCode}
     */
    @GetMapping("/code/{droneCode}")
    public ResponseEntity<Drone> getDroneByCode(@PathVariable String droneCode) {
        log.info("GET /api/drones/code/{} - Get drone by code", droneCode);
        return droneService.getDroneByCode(droneCode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lấy tất cả drone sẵn sàng
     * GET /api/drones/available
     */
    @GetMapping("/available")
    public ResponseEntity<List<Drone>> getAvailableDrones() {
        log.info("GET /api/drones/available - Get available drones");
        List<Drone> drones = droneService.getAvailableDrones();
        return ResponseEntity.ok(drones);
    }

    /**
     * Lấy drone theo status
     * GET /api/drones/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Drone>> getDronesByStatus(@PathVariable DroneStatus status) {
        log.info("GET /api/drones/status/{} - Get drones by status", status);
        List<Drone> drones = droneService.getDronesByStatus(status);
        return ResponseEntity.ok(drones);
    }

    /**
     * Tạo drone mới
     * POST /api/drones
     */
    @PostMapping
    public ResponseEntity<?> createDrone(@RequestBody Drone drone) {
        try {
            log.info("POST /api/drones - Create new drone: {}", drone.getDroneCode());
            Drone created = droneService.createDrone(drone);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            log.error("Error creating drone: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cập nhật drone
     * PUT /api/drones/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDrone(
            @PathVariable Long id,
            @RequestBody Drone drone) {
        try {
            log.info("PUT /api/drones/{} - Update drone", id);
            Drone updated = droneService.updateDrone(id, drone);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Error updating drone: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Xóa drone
     * DELETE /api/drones/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDrone(@PathVariable Long id) {
        try {
            log.info("DELETE /api/drones/{} - Delete drone", id);
            droneService.deleteDrone(id);
            return ResponseEntity.ok(Map.of("message", "Drone deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting drone: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cập nhật pin drone
     * PUT /api/drones/{id}/battery
     */
    @PutMapping("/{id}/battery")
    public ResponseEntity<?> updateBattery(
            @PathVariable Long id,
            @RequestParam Integer level) {
        try {
            log.info("PUT /api/drones/{}/battery - Update battery to {}%", id, level);

            if (level < 0 || level > 100) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Battery level must be between 0 and 100"));
            }

            Drone updated = droneService.updateBatteryLevel(id, level);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Error updating battery: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Lấy thống kê drone
     * GET /api/drones/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getDroneStatistics() {
        log.info("GET /api/drones/statistics - Get drone statistics");

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", droneService.getAllDrones().size());
        stats.put("available", droneService.countDronesByStatus(DroneStatus.AVAILABLE));
        stats.put("busy", droneService.countDronesByStatus(DroneStatus.BUSY));
        stats.put("maintenance", droneService.countDronesByStatus(DroneStatus.MAINTENANCE));
        stats.put("charging", droneService.countDronesByStatus(DroneStatus.CHARGING));
        stats.put("offline", droneService.countDronesByStatus(DroneStatus.OFFLINE));

        // Tính average battery
        List<Drone> allDrones = droneService.getAllDrones();
        double avgBattery = allDrones.stream()
                .mapToInt(Drone::getBatteryLevel)
                .average()
                .orElse(0.0);
        stats.put("averageBattery", Math.round(avgBattery * 10.0) / 10.0);

        // Tổng deliveries
        long totalDeliveries = allDrones.stream()
                .mapToInt(Drone::getTotalDeliveries)
                .sum();
        stats.put("totalDeliveries", totalDeliveries);

        // Tổng distance
        double totalDistance = allDrones.stream()
                .mapToDouble(Drone::getTotalDistance)
                .sum();
        stats.put("totalDistance", Math.round(totalDistance * 10.0) / 10.0);

        return ResponseEntity.ok(stats);
    }
}


package vn.cnpm.delivery_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * Entity quản lý thông tin Drone
 */
@Entity
@Table(name = "drones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Drone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String droneCode;  // DRONE-XXXXXXXX

    @Column(length = 100)
    private String name;  // Tên drone (VD: Sky Falcon 1)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DroneStatus status = DroneStatus.AVAILABLE;

    @Column(nullable = false)
    private Integer batteryLevel = 100;  // % pin (0-100)

    // Vị trí GPS hiện tại
    private Double currentLat;
    private Double currentLng;

    // Thông số kỹ thuật
    @Column(nullable = false)
    private Double maxSpeed = 50.0;  // km/h

    @Column(nullable = false)
    private Double maxRange = 10.0;  // km - Tầm bay tối đa

    @Column(nullable = false)
    private Double maxPayload = 3.0;  // kg - Trọng tải tối đa

    // Thống kê
    @Column(nullable = false)
    private Integer totalDeliveries = 0;  // Tổng số đơn đã giao

    @Column(nullable = false)
    private Double totalDistance = 0.0;  // Tổng km đã bay

    // Timestamps
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    private Instant lastMaintenanceAt;  // Lần bảo trì gần nhất

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    /**
     * Kiểm tra drone có sẵn sàng nhận đơn không
     */
    public boolean isAvailableForDelivery() {
        return status == DroneStatus.AVAILABLE && batteryLevel >= 30;
    }

    /**
     * Cập nhật vị trí GPS
     */
    public void updateLocation(Double lat, Double lng) {
        this.currentLat = lat;
        this.currentLng = lng;
        this.updatedAt = Instant.now();
    }

    /**
     * Đánh dấu drone đang bận
     */
    public void markAsBusy() {
        this.status = DroneStatus.BUSY;
        this.updatedAt = Instant.now();
    }

    /**
     * Đánh dấu drone sẵn sàng
     */
    public void markAsAvailable() {
        this.status = DroneStatus.AVAILABLE;
        this.updatedAt = Instant.now();
    }

    /**
     * Giảm pin (mỗi km bay tiêu tốn ~2% pin)
     */
    public void consumeBattery(double distance) {
        int consumed = (int) Math.ceil(distance * 2);
        this.batteryLevel = Math.max(0, this.batteryLevel - consumed);
        this.updatedAt = Instant.now();
    }

    /**
     * Sạc đầy pin
     */
    public void chargeBattery() {
        this.batteryLevel = 100;
        this.status = DroneStatus.AVAILABLE;
        this.updatedAt = Instant.now();
    }
}


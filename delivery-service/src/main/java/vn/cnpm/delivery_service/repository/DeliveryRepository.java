package vn.cnpm.delivery_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.cnpm.delivery_service.model.Delivery;
import vn.cnpm.delivery_service.model.DeliveryStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    Optional<Delivery> findByOrderId(Long orderId);
    List<Delivery> findByStatus(DeliveryStatus status);
    List<Delivery> findByDroneId(String droneId);
}

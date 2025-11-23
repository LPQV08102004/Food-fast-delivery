package vn.cnpm.product_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.cnpm.product_service.models.RestaurantOrder;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantOrderRepository extends JpaRepository<RestaurantOrder, Long> {
    Optional<RestaurantOrder> findByOrderId(Long orderId);
    List<RestaurantOrder> findByRestaurantId(Long restaurantId);
    List<RestaurantOrder> findByRestaurantIdAndStatus(Long restaurantId, String status);
}

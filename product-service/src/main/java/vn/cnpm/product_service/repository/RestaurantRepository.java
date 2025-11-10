package vn.cnpm.product_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.cnpm.product_service.models.Restaurant;
import java.util.List;
import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByNameContainingIgnoreCase(String name);

    // Tìm restaurant theo userId (mỗi user chỉ có 1 restaurant)
    Optional<Restaurant> findByUserId(Long userId);

    // Kiểm tra xem userId đã có restaurant chưa
    boolean existsByUserId(Long userId);

    // Tìm các restaurant đang hoạt động
    List<Restaurant> findByIsActiveTrue();

    // Tìm restaurant theo userId và isActive
    Optional<Restaurant> findByUserIdAndIsActiveTrue(Long userId);
}

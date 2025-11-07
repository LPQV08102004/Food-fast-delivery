package vn.cnpm.product_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.cnpm.product_service.models.Restaurant;
import java.util.List;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    public List<Restaurant> findByNameContainingIgnoreCase(String name);

}

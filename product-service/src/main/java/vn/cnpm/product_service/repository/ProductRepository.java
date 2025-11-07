package vn.cnpm.product_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.cnpm.product_service.models.Product;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product,Long> {
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByCategoryName(String categoryName);
    List<Product> findByNameContainingIgnoreCase(String name);

    // Tìm products theo restaurant_id
    List<Product> findByRestaurantId(Long restaurantId);
}

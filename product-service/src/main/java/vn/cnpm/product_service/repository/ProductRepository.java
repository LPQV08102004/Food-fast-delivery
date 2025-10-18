package vn.cnpm.product_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.cnpm.product_service.models.Product;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product,Long> {
    public List<Product> findByCategoryId(Long categoryId);
}

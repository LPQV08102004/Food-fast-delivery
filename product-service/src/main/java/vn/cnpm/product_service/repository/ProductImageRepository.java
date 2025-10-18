package vn.cnpm.product_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.cnpm.product_service.models.Product_image;

public interface ProductImageRepository extends JpaRepository<Product_image, Long> {
}

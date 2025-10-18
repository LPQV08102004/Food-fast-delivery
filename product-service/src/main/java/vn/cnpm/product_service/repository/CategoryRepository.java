package vn.cnpm.product_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.cnpm.product_service.models.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}

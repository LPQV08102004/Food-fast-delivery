package vn.cnpm.product_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.cnpm.product_service.models.Product;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product,Long> {
    public List<Product> findByCategoryId(Long categoryId);
    public List<Product> findByCategoryName(String categoryName);

}

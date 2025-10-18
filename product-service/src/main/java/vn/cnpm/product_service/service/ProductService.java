package vn.cnpm.product_service.service;

import vn.cnpm.product_service.dto.ProductRequest;
import vn.cnpm.product_service.dto.ProductResponse;
import java.util.List;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request);
    ProductResponse getProductById(Long id);
    List<ProductResponse> getAllProducts();
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
}

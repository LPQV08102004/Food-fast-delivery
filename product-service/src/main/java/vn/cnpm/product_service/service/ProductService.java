package vn.cnpm.product_service.service;

import vn.cnpm.product_service.dto.ProductRequest;
import vn.cnpm.product_service.dto.ProductResponse;
import vn.cnpm.product_service.repository.ProductRepository;

import java.util.List;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request);
    ProductResponse getProductById(Long id);
    List<ProductResponse> getProductsByCategoryId(Long id);
    List<ProductResponse> getProductsByRestaurantId(Long id);
    List<ProductResponse> getProductsByNameContaining(String name);
    List<ProductResponse> getProductsByCategoryName(String name);
    List<ProductResponse> getAllProducts();
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
}

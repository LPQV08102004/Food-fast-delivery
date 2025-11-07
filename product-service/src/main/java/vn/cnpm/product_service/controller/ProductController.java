package vn.cnpm.product_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import vn.cnpm.product_service.dto.ProductRequest;
import vn.cnpm.product_service.dto.ProductResponse;
import vn.cnpm.product_service.service.ProductService;
import java.util.List;


@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    @Autowired
    private final ProductService productService;
    @PostMapping
    public ProductResponse createProduct(@RequestBody ProductRequest request) {
        return productService.createProduct(request);
    }
    @GetMapping("/{id}")
    public ProductResponse getProductById(@PathVariable("id") Long id) {
        return productService.getProductById(id);
    }
    @GetMapping("/search")
    public List<ProductResponse> getProductsByNameContaining(@RequestParam("name") String name) {
        return productService.getProductsByNameContaining(name);
    }
    @PutMapping("/{id}")
    public ProductResponse updateProduct(@PathVariable("id") Long id, @RequestBody ProductRequest request) {
        return productService.updateProduct(id, request);
    }
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable("id") Long id) {
        productService.deleteProduct(id);
    }
    @GetMapping
    public List<ProductResponse> getAllProducts() {
        return productService.getAllProducts();
    }
    @GetMapping("/category/{categoryId}")
    public List<ProductResponse> getProductsByCategoryId(@PathVariable("categoryId") Long categoryId) {
        return productService.getProductsByCategoryId(categoryId);
    }
    @GetMapping("/restaurant/{restaurantId}")
    public List<ProductResponse> getProductsByRestaurantId(@PathVariable("restaurantId") Long restaurantId) {
        return productService.getProductsByRestaurantId(restaurantId);
    }
    @GetMapping("/category/by-name")
    public List<ProductResponse> getProductsByCategoryName(@RequestParam("categoryName") String categoryName) {
        return productService.getProductsByCategoryName(categoryName);
    }
}

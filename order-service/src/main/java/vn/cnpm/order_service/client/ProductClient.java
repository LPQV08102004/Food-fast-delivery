package vn.cnpm.order_service.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import vn.cnpm.order_service.DTO.ProductDTO;

@FeignClient(name = "PRODUCT-SERVICE", fallback = ProductClientFallback.class)
public interface ProductClient {
    
    @CircuitBreaker(name = "productService")
    @Retry(name = "productService")
    @GetMapping("/api/products/{id}")
    ProductDTO getProductById(@PathVariable("id") Long id);

    @CircuitBreaker(name = "productService")
    @Retry(name = "productService")
    @PutMapping("/api/products/{id}/reduce-stock/{quantity}")
    ResponseEntity<Void> reduceStock(@PathVariable("id") Long id, @PathVariable("quantity") int quantity);

    @CircuitBreaker(name = "productService")
    @Retry(name = "productService")
    @PutMapping("/api/products/{id}/restore-stock/{quantity}")
    ResponseEntity<Void> restoreStock(@PathVariable("id") Long id, @PathVariable("quantity") int quantity);
}

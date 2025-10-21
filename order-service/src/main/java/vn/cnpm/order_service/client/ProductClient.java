package vn.cnpm.order_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import vn.cnpm.order_service.DTO.ProductDTO;
import vn.cnpm.order_service.DTO.ProductResponse;
@FeignClient(name = "product-service", url = "http://localhost:8082")
public interface ProductClient {
        @GetMapping("/api/products/{id}")
        ProductDTO getProductById(@PathVariable("id") Long id);

        @PutMapping("/api/products/{id}/reduce-stock/{quantity}")
        void reduceStock(@PathVariable("id") Long id, @PathVariable("quantity") int quantity);
}

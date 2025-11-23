package vn.cnpm.order_service.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import vn.cnpm.order_service.DTO.ProductDTO;

@Slf4j
@Component
public class ProductClientFallback implements ProductClient {
    
    @Override
    public ProductDTO getProductById(Long id) {
        log.error("Product service is unavailable. Cannot fetch product: {}", id);
        throw new RuntimeException("Product service is currently unavailable. Please try again later.");
    }
    
    @Override
    public ResponseEntity<Void> reduceStock(Long id, int quantity) {
        log.error("Product service is unavailable. Cannot reduce stock for product: {} quantity: {}", id, quantity);
        throw new RuntimeException("Product service unavailable - cannot process order");
    }

    @Override
    public ResponseEntity<Void> restoreStock(Long id, int quantity) {
        log.error("Product service is unavailable. Cannot restore stock for product: {} quantity: {}", id, quantity);
        throw new RuntimeException("Product service unavailable - cannot restore stock");
    }
}

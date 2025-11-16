package vn.cnpm.order_service.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import vn.cnpm.order_service.DTO.ProductDTO;

@Slf4j
@Component
public class ProductClientFallback implements ProductClient {
    
    @Override
    public ProductDTO getProductById(Long id) {
        log.error("Product service is unavailable. Returning fallback response for product: {}", id);
        
        // Return a basic product DTO with unavailable status
        ProductDTO fallbackProduct = new ProductDTO();
        fallbackProduct.setId(id);
        fallbackProduct.setName("Product Unavailable");
        fallbackProduct.setPrice(0.0);
        fallbackProduct.setStock(0);
        
        return fallbackProduct;
    }
    
    @Override
    public void reduceStock(Long id, int quantity) {
        log.error("Product service is unavailable. Cannot reduce stock for product: {} quantity: {}", id, quantity);
        throw new RuntimeException("Product service unavailable - stock reduction failed");
    }
}

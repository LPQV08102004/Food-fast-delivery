package vn.cnpm.order_service.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import vn.cnpm.order_service.DTO.PaymentDTO;

@Slf4j
@Component
public class PaymentClientFallback implements PaymentClient {
    
    @Override
    public PaymentDTO createPayment(PaymentDTO request) {
        log.error("Payment service is unavailable. Returning fallback response for order: {}", request.getOrderId());
        
        // Return a pending payment status as fallback
        PaymentDTO fallbackResponse = new PaymentDTO();
        fallbackResponse.setOrderId(request.getOrderId());
        fallbackResponse.setAmount(request.getAmount());
        fallbackResponse.setStatus("PENDING");
        fallbackResponse.setPaymentMethod("FALLBACK");
        
        return fallbackResponse;
    }
}

package vn.cnpm.order_service.client;

import vn.cnpm.order_service.DTO.PaymentDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "PAYMENT-SERVICE")
public interface PaymentClient {
    @PostMapping("/api/payments")
    PaymentDTO createPayment(@RequestBody PaymentDTO request);
}

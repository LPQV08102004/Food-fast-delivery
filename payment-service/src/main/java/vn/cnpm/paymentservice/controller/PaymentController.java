package vn.cnpm.paymentservice.controller;

import vn.cnpm.paymentservice.DTO.PaymentRequest;
import vn.cnpm.paymentservice.DTO.PaymentResponse;
import vn.cnpm.paymentservice.exception.PaymentException;
import vn.cnpm.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentRequest req,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey
    ) {
        // Validate payment method
        if (req.getPaymentMethod() == null || req.getPaymentMethod().isBlank()) {
            log.error("Payment method is required");
            throw new PaymentException("Payment method is required");
        }
        
        String paymentMethod = req.getPaymentMethod().toUpperCase();
        if (!"MOMO".equals(paymentMethod)) {
            log.error("Unsupported payment method: {}", req.getPaymentMethod());
            throw new PaymentException("Only MOMO payment method is supported at this time");
        }
        
        log.info("Creating payment for order {} with method {}", req.getOrderId(), paymentMethod);
        PaymentResponse res = paymentService.process(req, idempotencyKey);
        
        // Verify that payment URL was generated
        if (res.getMomoPayUrl() == null || res.getMomoPayUrl().isEmpty()) {
            log.error("Payment created but MoMo URL is missing for order {}", req.getOrderId());
            throw new PaymentException("Failed to generate MoMo payment URL. Please try again.");
        }
        
        return ResponseEntity.ok(res);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getByOrder(@PathVariable Long orderId) {
        return paymentService.findByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

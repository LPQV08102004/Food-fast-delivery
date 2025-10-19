package vn.cnpm.paymentservice.controller;

import vn.cnpm.paymentservice.DTO.PaymentRequest;
import vn.cnpm.paymentservice.DTO.PaymentResponse;
import vn.cnpm.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentRequest req,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey
    ) {
        PaymentResponse res = paymentService.process(req, idempotencyKey);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getByOrder(@PathVariable Long orderId) {
        return paymentService.findByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

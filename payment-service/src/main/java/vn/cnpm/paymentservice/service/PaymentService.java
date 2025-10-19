package vn.cnpm.paymentservice.service;

import vn.cnpm.paymentservice.DTO.PaymentRequest;
import vn.cnpm.paymentservice.DTO.PaymentResponse;

import java.util.Optional;

public interface PaymentService {
    PaymentResponse process(PaymentRequest req, String idempotencyKey);
    Optional<PaymentResponse> findByOrderId(Long orderId);
}

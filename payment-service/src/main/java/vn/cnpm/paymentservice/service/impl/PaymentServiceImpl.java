package vn.cnpm.paymentservice.service.impl;

import vn.cnpm.paymentservice.DTO.PaymentRequest;
import vn.cnpm.paymentservice.DTO.PaymentResponse;
import vn.cnpm.paymentservice.exception.PaymentException;
import vn.cnpm.paymentservice.model.Payment;
import vn.cnpm.paymentservice.model.PaymentStatus;
import vn.cnpm.paymentservice.repository.PaymentRepository;
import vn.cnpm.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository repository;
    private final Random random = new Random();

    @Override
    @Transactional
    public PaymentResponse process(PaymentRequest req, String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<Payment> existing = repository.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent()) {
                return mapToResponse(existing.get());
            }
        }

        repository.findByOrderId(req.getOrderId()).ifPresent(p -> {
            if (p.getStatus() == PaymentStatus.SUCCESS) {
                throw new PaymentException("Order already paid: " + req.getOrderId());
            }
        });

        Payment p = Payment.builder()
                .orderId(req.getOrderId())
                .amount(req.getAmount())
                .status(PaymentStatus.FAILED)
                .idempotencyKey(idempotencyKey)
                .attemptCount(1)
                .build();

        boolean success = random.nextInt(100) < 80;
        p.setStatus(success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);

        Payment saved = repository.save(p);


        return mapToResponse(saved);
    }

    @Override
    public Optional<PaymentResponse> findByOrderId(Long orderId) {
        return repository.findByOrderId(orderId).map(this::mapToResponse);
    }

    private PaymentResponse mapToResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .orderId(p.getOrderId())
                .amount(p.getAmount())
                .status(p.getStatus())
                .idempotencyKey(p.getIdempotencyKey())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}

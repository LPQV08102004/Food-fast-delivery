package vn.cnpm.paymentservice.repository;

import vn.cnpm.paymentservice.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
    Optional<Payment> findByIdempotencyKey(String idempotencyKey);
    Optional<Payment> findByMomoOrderId(String momoOrderId);
}

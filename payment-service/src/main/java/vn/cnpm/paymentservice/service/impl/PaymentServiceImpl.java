package vn.cnpm.paymentservice.service.impl;

import vn.cnpm.paymentservice.DTO.PaymentRequest;
import vn.cnpm.paymentservice.DTO.PaymentResponse;
import vn.cnpm.paymentservice.exception.PaymentException;
import vn.cnpm.paymentservice.model.Payment;
import vn.cnpm.paymentservice.model.PaymentMethod;
import vn.cnpm.paymentservice.model.PaymentStatus;
import vn.cnpm.paymentservice.repository.PaymentRepository;
import vn.cnpm.paymentservice.service.MoMoService;
import vn.cnpm.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository repository;
    private final MoMoService momoService;

    @Override
    @Transactional
    public PaymentResponse process(PaymentRequest req, String idempotencyKey) {
        // Check for idempotency
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<Payment> existing = repository.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent()) {
                log.info("Returning existing payment for idempotency key: {}", idempotencyKey);
                return mapToResponse(existing.get());
            }
        }

        // Check if order already paid
        repository.findByOrderId(req.getOrderId()).ifPresent(p -> {
            if (p.getStatus() == PaymentStatus.SUCCESS) {
                throw new PaymentException("Order already paid: " + req.getOrderId());
            }
        });

        // Determine payment method
        PaymentMethod method = PaymentMethod.MOMO; // Default to MoMo
        if (req.getPaymentMethod() != null) {
            try {
                method = PaymentMethod.valueOf(req.getPaymentMethod().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid payment method: {}, defaulting to MOMO", req.getPaymentMethod());
            }
        }

        Payment payment = Payment.builder()
                .orderId(req.getOrderId())
                .amount(req.getAmount())
                .status(PaymentStatus.PENDING)
                .paymentMethod(method)
                .idempotencyKey(idempotencyKey)
                .attemptCount(1)
                .build();

        // Process based on payment method
        if (method == PaymentMethod.MOMO) {
            try {
                String orderInfo = "Thanh toán đơn hàng #" + req.getOrderId();
                com.mservice.models.PaymentResponse momoResponse = momoService.createPayment(
                        req.getOrderId(),
                        req.getAmount(),
                        orderInfo
                );

                if (momoResponse != null && momoResponse.getResultCode() == 0) {
                    // Kiểm tra bắt buộc phải có URL thanh toán
                    if (momoResponse.getPayUrl() == null || momoResponse.getPayUrl().isEmpty()) {
                        payment.setStatus(PaymentStatus.FAILED);
                        payment.setMomoMessage("MoMo payment URL is missing - Payment gateway may be unavailable");
                        log.error("MoMo payment URL missing for order {} - Gateway not working properly", req.getOrderId());
                        throw new PaymentException("MoMo payment gateway is not available. Please try again later.");
                    }
                    
                    payment.setMomoRequestId(momoResponse.getRequestId());
                    payment.setMomoOrderId(momoResponse.getOrderId());
                    payment.setMomoPayUrl(momoResponse.getPayUrl());
                    payment.setMomoResultCode(momoResponse.getResultCode());
                    payment.setMomoMessage(momoResponse.getMessage());
                    payment.setStatus(PaymentStatus.PENDING);
                    log.info("MoMo payment initiated successfully for order {} - PayURL: {}", req.getOrderId(), momoResponse.getPayUrl());
                } else {
                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setMomoResultCode(momoResponse != null ? momoResponse.getResultCode() : -1);
                    payment.setMomoMessage(momoResponse != null ? momoResponse.getMessage() : "MoMo API error");
                    log.error("MoMo payment failed for order {}: {}", req.getOrderId(),
                            momoResponse != null ? momoResponse.getMessage() : "Unknown error");
                    throw new PaymentException("Failed to create MoMo payment: " + 
                            (momoResponse != null ? momoResponse.getMessage() : "Unknown error"));
                }
            } catch (PaymentException e) {
                // Re-throw PaymentException
                throw e;
            } catch (Exception e) {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setMomoMessage("Exception: " + e.getMessage());
                log.error("Exception creating MoMo payment for order {}", req.getOrderId(), e);
                throw new PaymentException("MoMo payment service error: " + e.getMessage());
            }
        } else {
            // Các phương thức thanh toán khác chưa được tích hợp
            payment.setStatus(PaymentStatus.FAILED);
            payment.setMomoMessage("Payment method not supported: " + method);
            log.error("Unsupported payment method {} for order {}", method, req.getOrderId());
            throw new PaymentException("Payment method " + method + " is not supported. Please use MOMO.");
        }

        Payment saved = repository.save(payment);
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
                .momoPayUrl(p.getMomoPayUrl())
                .momoRequestId(p.getMomoRequestId())
                .momoOrderId(p.getMomoOrderId())
                .momoResultCode(p.getMomoResultCode())
                .momoMessage(p.getMomoMessage())
                .build();
    }
}

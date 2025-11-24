package vn.cnpm.paymentservice.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import vn.cnpm.paymentservice.config.RabbitMQConfig;
import vn.cnpm.paymentservice.event.OrderCreatedEvent;
import vn.cnpm.paymentservice.event.OrderPaidEvent;
import vn.cnpm.paymentservice.event.PaymentProcessedEvent;
import vn.cnpm.paymentservice.model.Payment;
import vn.cnpm.paymentservice.model.PaymentMethod;
import vn.cnpm.paymentservice.model.PaymentStatus;
import vn.cnpm.paymentservice.repository.PaymentRepository;
import vn.cnpm.paymentservice.service.MoMoService;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventConsumer {

    private final PaymentRepository paymentRepository;
    private final PaymentEventPublisher paymentEventPublisher;
    private final MoMoService momoService;

    @RabbitListener(queues = RabbitMQConfig.ORDER_CREATED_QUEUE)
    public void handleOrderCreatedEvent(OrderCreatedEvent event) {
        try {
            log.info("Received OrderCreatedEvent for orderId: {}", event.getOrderId());

            // Map payment method string to enum (safe fallback)
            PaymentMethod method = PaymentMethod.fromString(event.getPaymentMethod());

            // Create payment record with PENDING status
            Payment payment = Payment.builder()
                    .orderId(event.getOrderId())
                    .amount(event.getTotalPrice())
                    .paymentMethod(method)
                    .status(PaymentStatus.PENDING)
                    .attemptCount(1)
                    .build();

            // Process payment based on method
            if (method == PaymentMethod.MOMO) {
                // Integrate with MoMo Payment Gateway
                try {
                    String orderInfo = "Thanh toán đơn hàng #" + event.getOrderId();
                    com.mservice.models.PaymentResponse momoResponse = momoService.createPayment(
                            event.getOrderId(),
                            event.getTotalPrice(),
                            orderInfo
                    );

                    if (momoResponse != null && momoResponse.getResultCode() == 0) {
                        // MoMo payment URL created successfully
                        if (momoResponse.getPayUrl() != null && !momoResponse.getPayUrl().isEmpty()) {
                            payment.setMomoRequestId(momoResponse.getRequestId());
                            payment.setMomoOrderId(momoResponse.getOrderId());
                            payment.setMomoPayUrl(momoResponse.getPayUrl());
                            payment.setMomoResultCode(momoResponse.getResultCode());
                            payment.setMomoMessage(momoResponse.getMessage());
                            payment.setStatus(PaymentStatus.PENDING);
                            log.info("MoMo payment URL created for orderId: {} - URL: {}", 
                                    event.getOrderId(), momoResponse.getPayUrl());
                        } else {
                            payment.setStatus(PaymentStatus.FAILED);
                            payment.setMomoMessage("MoMo payment URL is missing");
                            log.error("MoMo payment URL missing for orderId: {}", event.getOrderId());
                        }
                    } else {
                        payment.setStatus(PaymentStatus.FAILED);
                        payment.setMomoResultCode(momoResponse != null ? momoResponse.getResultCode() : -1);
                        payment.setMomoMessage(momoResponse != null ? momoResponse.getMessage() : "MoMo API error");
                        log.error("MoMo payment failed for orderId: {}: {}", event.getOrderId(),
                                momoResponse != null ? momoResponse.getMessage() : "Unknown error");
                    }
                } catch (Exception e) {
                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setMomoMessage("MoMo integration error: " + e.getMessage());
                    log.error("Exception creating MoMo payment for orderId: {}", event.getOrderId(), e);
                }
            } else if (method == PaymentMethod.CASH) {
                // Cash on delivery - auto approve
                payment.setStatus(PaymentStatus.SUCCESS);
                log.info("Cash payment auto-approved for orderId: {}", event.getOrderId());
            } else {
                // Unsupported payment method
                payment.setStatus(PaymentStatus.FAILED);
                payment.setMomoMessage("Unsupported payment method: " + method);
                log.error("Unsupported payment method {} for orderId: {}", method, event.getOrderId());
            }

            // Save payment
            Payment savedPayment = paymentRepository.save(payment);

            // Publish payment processed event
            PaymentProcessedEvent paymentEvent = PaymentProcessedEvent.builder()
                    .orderId(event.getOrderId())
                    .paymentId(savedPayment.getId())
                    .status(payment.getStatus().name())
                    .message(payment.getStatus() == PaymentStatus.SUCCESS ? "Payment successful" : 
                            payment.getStatus() == PaymentStatus.PENDING ? "Payment pending" : "Payment failed")
                    .build();

            paymentEventPublisher.publishPaymentProcessedEvent(paymentEvent);

            // If payment successful (CASH only), publish OrderPaidEvent for Restaurant Service
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                OrderPaidEvent orderPaidEvent = OrderPaidEvent.builder()
                        .orderId(event.getOrderId())
                        .userId(event.getUserId())
                        .restaurantId(event.getRestaurantId())
                        .totalPrice(event.getTotalPrice())
                        .deliveryAddress(event.getDeliveryAddress())
                        .deliveryPhone(event.getDeliveryPhone())
                        .deliveryFullName(event.getDeliveryFullName())
                        .build();

                paymentEventPublisher.publishOrderPaidEvent(orderPaidEvent);
                log.info("OrderPaidEvent published for restaurant notification");
            }

        } catch (Exception e) {
            log.error("Failed to process OrderCreatedEvent for orderId: {}",
                    event.getOrderId(), e);

            // Publish failed payment event
            PaymentProcessedEvent failedEvent = PaymentProcessedEvent.builder()
                    .orderId(event.getOrderId())
                    .paymentId(null)
                    .status("FAILED")
                    .message("Payment processing error: " + e.getMessage())
                    .build();

            try {
                paymentEventPublisher.publishPaymentProcessedEvent(failedEvent);
            } catch (Exception ex) {
                log.error("Failed to publish payment failed event", ex);
            }
        }
    }
}

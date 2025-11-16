package vn.cnpm.paymentservice.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import vn.cnpm.paymentservice.config.RabbitMQConfig;
import vn.cnpm.paymentservice.event.OrderCreatedEvent;
import vn.cnpm.paymentservice.event.PaymentProcessedEvent;
import vn.cnpm.paymentservice.model.Payment;
import vn.cnpm.paymentservice.model.PaymentMethod;
import vn.cnpm.paymentservice.model.PaymentStatus;
import vn.cnpm.paymentservice.repository.PaymentRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventConsumer {

    private final PaymentRepository paymentRepository;
    private final PaymentEventPublisher paymentEventPublisher;

    @RabbitListener(queues = RabbitMQConfig.ORDER_CREATED_QUEUE)
    public void handleOrderCreatedEvent(OrderCreatedEvent event) {
        try {
            log.info("Received OrderCreatedEvent for orderId: {}", event.getOrderId());

            // Map payment method string to enum (safe fallback)
            PaymentMethod method = PaymentMethod.fromString(event.getPaymentMethod());

            // Create payment record
            Payment payment = Payment.builder()
                    .orderId(event.getOrderId())
                    .amount(event.getTotalPrice())
                    .paymentMethod(method)
                    .status(PaymentStatus.PENDING)
                    .build();

            // Process payment (simulate payment processing)
            boolean paymentSuccess = processPayment(payment);

            if (paymentSuccess) {
                payment.setStatus(PaymentStatus.SUCCESS);
                log.info("Payment processed successfully for orderId: {}", event.getOrderId());
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                log.warn("Payment failed for orderId: {}", event.getOrderId());
            }

            // Save payment
            Payment savedPayment = paymentRepository.save(payment);

            // Publish payment processed event
            PaymentProcessedEvent paymentEvent = PaymentProcessedEvent.builder()
                    .orderId(event.getOrderId())
                    .paymentId(savedPayment.getId())
                    .status(payment.getStatus().name())
                    .message(paymentSuccess ? "Payment successful" : "Payment failed")
                    .build();

            paymentEventPublisher.publishPaymentProcessedEvent(paymentEvent);

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

    private boolean processPayment(Payment payment) {
        // Simulate payment processing
        // In real application, this would call external payment gateway
        try {
            Thread.sleep(1000); // Simulate processing time

            // Simulate 90% success rate
            return Math.random() > 0.1;

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
}

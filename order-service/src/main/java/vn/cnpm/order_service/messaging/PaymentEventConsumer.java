package vn.cnpm.order_service.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import vn.cnpm.order_service.config.RabbitMQConfig;
import vn.cnpm.order_service.event.PaymentProcessedEvent;
import vn.cnpm.order_service.model.Order;
import vn.cnpm.order_service.model.OrderStatus;
import vn.cnpm.order_service.repository.OrderRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventConsumer {

    private final OrderRepository orderRepository;

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_PROCESSED_QUEUE)
    public void handlePaymentProcessedEvent(PaymentProcessedEvent event) {
        try {
            log.info("Received PaymentProcessedEvent for orderId: {}, status: {}",
                    event.getOrderId(), event.getStatus());

            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));

            // Update order based on payment status
            order.setPaymentStatus(event.getStatus());

            if ("SUCCESS".equals(event.getStatus())) {
                order.setStatus(OrderStatus.CONFIRMED);
                log.info("Order {} confirmed after successful payment", event.getOrderId());
            } else {
                order.setStatus(OrderStatus.CANCELLED);
                log.warn("Order {} cancelled due to payment failure: {}",
                        event.getOrderId(), event.getMessage());
            }

            orderRepository.save(order);
            log.info("Order {} updated successfully", event.getOrderId());

        } catch (Exception e) {
            log.error("Failed to process PaymentProcessedEvent for orderId: {}",
                    event.getOrderId(), e);
            // In production, you might want to send to a dead letter queue
            throw new RuntimeException("Failed to process payment event", e);
        }
    }
}

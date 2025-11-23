package vn.cnpm.order_service.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import vn.cnpm.order_service.client.ProductClient;
import vn.cnpm.order_service.config.RabbitMQConfig;
import vn.cnpm.order_service.event.PaymentProcessedEvent;
import vn.cnpm.order_service.model.Order;
import vn.cnpm.order_service.model.OrderItem;
import vn.cnpm.order_service.model.OrderStatus;
import vn.cnpm.order_service.repository.OrderRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventConsumer {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;

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
                log.info("Order {} marked as CONFIRMED after successful payment", event.getOrderId());
            } else {
                order.setStatus(OrderStatus.CANCELLED);
                log.warn("Order {} cancelled due to payment failure: {}",
                        event.getOrderId(), event.getMessage());
                
                // COMPENSATION: Restore stock since payment failed
                restoreStockForCancelledOrder(order);
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
    
    /**
     * Restore stock for cancelled order (compensation logic)
     */
    private void restoreStockForCancelledOrder(Order order) {
        log.info("Restoring stock for cancelled order {}", order.getId());
        
        for (OrderItem item : order.getOrderItems()) {
            try {
                productClient.restoreStock(item.getProductId(), item.getQuantity());
                log.info("Restored stock for product {} quantity {} (order {})", 
                        item.getProductId(), item.getQuantity(), order.getId());
            } catch (Exception e) {
                log.error("CRITICAL: Failed to restore stock for product {} (order {}) - manual intervention required!",
                        item.getProductId(), order.getId(), e);
                // Log to a monitoring system or send alert
                // In production, this should trigger an alert for manual stock adjustment
            }
        }
    }
}

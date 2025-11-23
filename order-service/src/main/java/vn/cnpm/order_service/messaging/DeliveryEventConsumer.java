package vn.cnpm.order_service.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import vn.cnpm.order_service.config.RabbitMQConfig;
import vn.cnpm.order_service.event.OrderPickedUpEvent;
import vn.cnpm.order_service.model.Order;
import vn.cnpm.order_service.model.OrderStatus;
import vn.cnpm.order_service.repository.OrderRepository;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeliveryEventConsumer {

    private final OrderRepository orderRepository;

    @RabbitListener(queues = RabbitMQConfig.ORDER_PICKED_UP_QUEUE)
    public void handleOrderPickedUpEvent(OrderPickedUpEvent event) {
        try {
            log.info("Received OrderPickedUpEvent for orderId: {}, droneId: {}",
                    event.getOrderId(), event.getDroneId());

            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));

            // Cập nhật thông tin drone và trạng thái
            order.setDroneId(event.getDroneId());
            order.setStatus(OrderStatus.PICKED_UP);
            order.setPickedUpAt(Instant.now());

            orderRepository.save(order);
            log.info("Order {} updated to PICKED_UP by drone {}", 
                    event.getOrderId(), event.getDroneId());

        } catch (Exception e) {
            log.error("Failed to process OrderPickedUpEvent for orderId: {}",
                    event.getOrderId(), e);
            throw new RuntimeException("Failed to process order picked up event", e);
        }
    }
}

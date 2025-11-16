package vn.cnpm.order_service.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import vn.cnpm.order_service.config.RabbitMQConfig;
import vn.cnpm.order_service.event.OrderCreatedEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishOrderCreatedEvent(OrderCreatedEvent event) {
        try {
            log.info("Publishing OrderCreatedEvent for orderId: {}", event.getOrderId());
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.ORDER_EXCHANGE,
                    RabbitMQConfig.ORDER_CREATED_ROUTING_KEY,
                    event
            );
            log.info("OrderCreatedEvent published successfully for orderId: {}", event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to publish OrderCreatedEvent for orderId: {}", event.getOrderId(), e);
            throw new RuntimeException("Failed to publish order created event", e);
        }
    }
}


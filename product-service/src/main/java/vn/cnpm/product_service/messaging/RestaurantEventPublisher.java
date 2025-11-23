package vn.cnpm.product_service.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import vn.cnpm.product_service.config.RabbitMQConfig;
import vn.cnpm.product_service.event.OrderReadyEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class RestaurantEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishOrderReadyEvent(OrderReadyEvent event) {
        try {
            log.info("Publishing OrderReadyEvent for orderId: {} to Delivery Service",
                    event.getOrderId());

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.RESTAURANT_EXCHANGE,
                    RabbitMQConfig.ORDER_READY_ROUTING_KEY,
                    event
            );

            log.info("OrderReadyEvent published successfully for orderId: {}",
                    event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to publish OrderReadyEvent for orderId: {}",
                    event.getOrderId(), e);
            throw new RuntimeException("Failed to publish order ready event", e);
        }
    }
}

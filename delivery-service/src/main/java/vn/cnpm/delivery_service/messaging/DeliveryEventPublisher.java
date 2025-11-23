package vn.cnpm.delivery_service.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import vn.cnpm.delivery_service.config.RabbitMQConfig;
import vn.cnpm.delivery_service.event.OrderPickedUpEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeliveryEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishOrderPickedUpEvent(OrderPickedUpEvent event) {
        try {
            log.info("Publishing OrderPickedUpEvent for orderId: {} by drone {}",
                    event.getOrderId(), event.getDroneId());

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.DELIVERY_EXCHANGE,
                    RabbitMQConfig.ORDER_PICKED_UP_ROUTING_KEY,
                    event
            );

            log.info("OrderPickedUpEvent published successfully");
        } catch (Exception e) {
            log.error("Failed to publish OrderPickedUpEvent for orderId: {}",
                    event.getOrderId(), e);
            throw new RuntimeException("Failed to publish order picked up event", e);
        }
    }
}

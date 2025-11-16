package vn.cnpm.paymentservice.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import vn.cnpm.paymentservice.config.RabbitMQConfig;
import vn.cnpm.paymentservice.event.PaymentProcessedEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishPaymentProcessedEvent(PaymentProcessedEvent event) {
        try {
            log.info("Publishing PaymentProcessedEvent for orderId: {}, status: {}",
                    event.getOrderId(), event.getStatus());

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.PAYMENT_EXCHANGE,
                    RabbitMQConfig.PAYMENT_PROCESSED_ROUTING_KEY,
                    event
            );

            log.info("PaymentProcessedEvent published successfully for orderId: {}",
                    event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to publish PaymentProcessedEvent for orderId: {}",
                    event.getOrderId(), e);
            throw new RuntimeException("Failed to publish payment processed event", e);
        }
    }
}

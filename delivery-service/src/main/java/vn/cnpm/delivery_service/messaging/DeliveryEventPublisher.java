package vn.cnpm.delivery_service.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import vn.cnpm.delivery_service.config.RabbitMQConfig;
import vn.cnpm.delivery_service.event.DroneLocationUpdateEvent;
import vn.cnpm.delivery_service.event.OrderCompletedEvent;
import vn.cnpm.delivery_service.event.OrderDeliveringEvent;
import vn.cnpm.delivery_service.event.OrderPickedUpEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeliveryEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    /**
     * Thông báo drone đã lấy hàng từ nhà hàng
     */
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

    /**
     * Thông báo drone bắt đầu giao hàng cho khách
     */
    public void publishOrderDeliveringEvent(OrderDeliveringEvent event) {
        try {
            log.info("Publishing OrderDeliveringEvent for orderId: {} by drone {}",
                    event.getOrderId(), event.getDroneId());

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.DELIVERY_EXCHANGE,
                    RabbitMQConfig.ORDER_DELIVERING_ROUTING_KEY,
                    event
            );

            log.debug("OrderDeliveringEvent published successfully");
        } catch (Exception e) {
            log.error("Failed to publish OrderDeliveringEvent for orderId: {}",
                    event.getOrderId(), e);
        }
    }

    /**
     * Thông báo drone đã giao hàng thành công
     */
    public void publishOrderCompletedEvent(OrderCompletedEvent event) {
        try {
            log.info("Publishing OrderCompletedEvent for orderId: {} by drone {}",
                    event.getOrderId(), event.getDroneId());

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.DELIVERY_EXCHANGE,
                    RabbitMQConfig.ORDER_COMPLETED_ROUTING_KEY,
                    event
            );

            log.info("OrderCompletedEvent published successfully");
        } catch (Exception e) {
            log.error("Failed to publish OrderCompletedEvent for orderId: {}",
                    event.getOrderId(), e);
        }
    }

    /**
     * Cập nhật vị trí GPS real-time của drone
     * Gửi mỗi 5 giây trong quá trình giao hàng
     */
    public void publishDroneLocationUpdate(DroneLocationUpdateEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.DELIVERY_EXCHANGE,
                    RabbitMQConfig.DRONE_LOCATION_UPDATE_ROUTING_KEY,
                    event
            );

            log.debug("Drone location update published for order: {} - Lat: {}, Lng: {}, Distance: {} km",
                    event.getOrderId(), event.getCurrentLat(), event.getCurrentLng(), 
                    event.getDistanceRemaining());
        } catch (Exception e) {
            log.error("Failed to publish drone location update for orderId: {}",
                    event.getOrderId(), e);
        }
    }
}

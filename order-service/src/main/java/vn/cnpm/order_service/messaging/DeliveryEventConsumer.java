package vn.cnpm.order_service.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import vn.cnpm.order_service.config.RabbitMQConfig;
import vn.cnpm.order_service.event.DroneLocationUpdateEvent;
import vn.cnpm.order_service.event.OrderCompletedEvent;
import vn.cnpm.order_service.event.OrderDeliveringEvent;
import vn.cnpm.order_service.event.OrderPickedUpEvent;
import vn.cnpm.order_service.model.Order;
import vn.cnpm.order_service.model.OrderStatus;
import vn.cnpm.order_service.repository.OrderRepository;
import vn.cnpm.order_service.service.WebSocketService;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeliveryEventConsumer {

    private final OrderRepository orderRepository;
    private final WebSocketService webSocketService;

    /**
     * Xử lý event khi drone đã lấy hàng từ nhà hàng
     */
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

    /**
     * Xử lý event khi drone bắt đầu giao hàng cho khách
     */
    @RabbitListener(queues = RabbitMQConfig.ORDER_DELIVERING_QUEUE)
    public void handleOrderDeliveringEvent(OrderDeliveringEvent event) {
        try {
            log.info("Received OrderDeliveringEvent for orderId: {}, droneId: {}, ETA: {} minutes",
                    event.getOrderId(), event.getDroneId(), event.getEstimatedMinutes());

            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));

            // Cập nhật trạng thái đang giao hàng
            order.setStatus(OrderStatus.DELIVERING);

            orderRepository.save(order);
            log.info("Order {} updated to DELIVERING status", event.getOrderId());

            // Gửi notification đến customer qua WebSocket
            webSocketService.sendDeliveryUpdate(order.getUserId(), order.getId(), event);

        } catch (Exception e) {
            log.error("Failed to process OrderDeliveringEvent for orderId: {}",
                    event.getOrderId(), e);
        }
    }

    /**
     * Xử lý event khi drone đã giao hàng thành công
     */
    @RabbitListener(queues = RabbitMQConfig.ORDER_COMPLETED_QUEUE)
    public void handleOrderCompletedEvent(OrderCompletedEvent event) {
        try {
            log.info("Received OrderCompletedEvent for orderId: {}, droneId: {} at {}",
                    event.getOrderId(), event.getDroneId(), event.getCompletedAt());

            Order order = orderRepository.findById(event.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));

            // Cập nhật trạng thái hoàn thành
            order.setStatus(OrderStatus.DELIVERED);
            order.setDeliveredAt(event.getCompletedAt());

            orderRepository.save(order);
            log.info("Order {} completed successfully by drone {}", 
                    event.getOrderId(), event.getDroneId());

            // Gửi notification hoàn thành đến customer
            webSocketService.sendDeliveryUpdate(order.getUserId(), order.getId(), event);

        } catch (Exception e) {
            log.error("Failed to process OrderCompletedEvent for orderId: {}",
                    event.getOrderId(), e);
        }
    }

    /**
     * Xử lý GPS update real-time từ drone
     * Event này gửi mỗi 5 giây
     */
    @RabbitListener(queues = RabbitMQConfig.DRONE_LOCATION_UPDATE_QUEUE)
    public void handleDroneLocationUpdate(DroneLocationUpdateEvent event) {
        try {
            log.debug("Drone location update for order {}: Lat={}, Lng={}, Distance={}km, ETA={}s",
                    event.getOrderId(), event.getCurrentLat(), event.getCurrentLng(),
                    event.getDistanceRemaining(), event.getEstimatedArrivalSeconds());

            // Lấy order để biết userId
            Order order = orderRepository.findById(event.getOrderId()).orElse(null);
            if (order != null) {
                // Forward đến WebSocket cho frontend nhận real-time
                webSocketService.sendDroneLocationUpdate(order.getUserId(), order.getId(), event);
            }

        } catch (Exception e) {
            log.error("Failed to process DroneLocationUpdate for orderId: {}",
                    event.getOrderId(), e);
        }
    }
}

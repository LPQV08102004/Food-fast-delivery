package vn.cnpm.delivery_service.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import vn.cnpm.delivery_service.config.RabbitMQConfig;
import vn.cnpm.delivery_service.event.OrderPickedUpEvent;
import vn.cnpm.delivery_service.event.OrderReadyEvent;
import vn.cnpm.delivery_service.model.Delivery;
import vn.cnpm.delivery_service.model.DeliveryStatus;
import vn.cnpm.delivery_service.repository.DeliveryRepository;
import vn.cnpm.delivery_service.service.DroneService;

import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderReadyEventConsumer {

    private final DeliveryRepository deliveryRepository;
    private final DroneService droneService;
    private final DeliveryEventPublisher eventPublisher;

    @RabbitListener(queues = RabbitMQConfig.ORDER_READY_QUEUE)
    public void handleOrderReadyEvent(OrderReadyEvent event) {
        try {
            log.info("Received OrderReadyEvent for orderId: {} from restaurant {}",
                    event.getOrderId(), event.getRestaurantId());

            // Tạo delivery record
            Delivery delivery = Delivery.builder()
                    .orderId(event.getOrderId())
                    .restaurantId(event.getRestaurantId())
                    .restaurantAddress(event.getRestaurantAddress())
                    .deliveryAddress(event.getDeliveryAddress())
                    .deliveryPhone(event.getDeliveryPhone())
                    .deliveryFullName(event.getDeliveryFullName())
                    .status(DeliveryStatus.PENDING)
                    .build();

            delivery = deliveryRepository.save(delivery);
            log.info("Delivery record created for order {}", event.getOrderId());

            // Tự động gán drone
            delivery = droneService.assignDrone(delivery);
            log.info("Drone {} assigned to order {}", delivery.getDroneId(), event.getOrderId());

            // Giả lập quá trình giao hàng tự động (async)
            Long deliveryId = delivery.getId();
            String droneId = delivery.getDroneId();
            Long orderId = event.getOrderId();

            CompletableFuture.runAsync(() -> {
                try {
                    // Giả lập: Drone bay đến nhà hàng (3 giây)
                    Thread.sleep(3000);
                    log.info("Drone {} arriving at restaurant for order {}", droneId, orderId);
                    
                    // Drone lấy hàng
                    Delivery updated = droneService.simulatePickup(deliveryId);
                    log.info("Drone {} picked up order {}", droneId, orderId);

                    // Phát sự kiện OrderPickedUpEvent
                    OrderPickedUpEvent pickedUpEvent = OrderPickedUpEvent.builder()
                            .orderId(orderId)
                            .droneId(droneId)
                            .build();
                    eventPublisher.publishOrderPickedUpEvent(pickedUpEvent);

                    // Giả lập: Bắt đầu giao hàng
                    Thread.sleep(2000);
                    droneService.startDelivery(deliveryId);
                    log.info("Drone {} started delivering order {}", droneId, orderId);

                    // Giả lập: Giao hàng thành công (5 giây)
                    Thread.sleep(5000);
                    droneService.completeDelivery(deliveryId);
                    log.info("Drone {} completed delivery for order {}", droneId, orderId);

                } catch (Exception e) {
                    log.error("Error in drone delivery simulation for order {}", orderId, e);
                }
            });

        } catch (Exception e) {
            log.error("Failed to process OrderReadyEvent for orderId: {}",
                    event.getOrderId(), e);
            throw new RuntimeException("Failed to process order ready event", e);
        }
    }
}

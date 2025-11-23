package vn.cnpm.product_service.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import vn.cnpm.product_service.event.OrderPaidEvent;
import vn.cnpm.product_service.models.RestaurantOrder;
import vn.cnpm.product_service.repository.RestaurantOrderRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderPaidEventConsumer {

    private final RestaurantOrderRepository restaurantOrderRepository;

    @RabbitListener(queues = "order.paid.queue")
    public void handleOrderPaidEvent(OrderPaidEvent event) {
        try {
            log.info("Received OrderPaidEvent for orderId: {}, restaurantId: {}",
                    event.getOrderId(), event.getRestaurantId());

            // Tạo bản ghi đơn hàng mới cho nhà hàng
            RestaurantOrder restaurantOrder = RestaurantOrder.builder()
                    .orderId(event.getOrderId())
                    .restaurantId(event.getRestaurantId())
                    .userId(event.getUserId())
                    .totalPrice(event.getTotalPrice())
                    .status("PENDING_CONFIRMATION")  // Chờ nhà hàng xác nhận
                    .deliveryAddress(event.getDeliveryAddress())
                    .deliveryPhone(event.getDeliveryPhone())
                    .deliveryFullName(event.getDeliveryFullName())
                    .build();

            restaurantOrderRepository.save(restaurantOrder);
            log.info("Restaurant order created for orderId: {}", event.getOrderId());

        } catch (Exception e) {
            log.error("Failed to process OrderPaidEvent for orderId: {}",
                    event.getOrderId(), e);
            throw new RuntimeException("Failed to process order paid event", e);
        }
    }
}

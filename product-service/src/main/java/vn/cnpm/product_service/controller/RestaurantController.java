package vn.cnpm.product_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.cnpm.product_service.dto.RestaurantResponse;
import vn.cnpm.product_service.dto.RestaurantResquest;
import vn.cnpm.product_service.event.OrderReadyEvent;
import vn.cnpm.product_service.messaging.RestaurantEventPublisher;
import vn.cnpm.product_service.models.Restaurant;
import vn.cnpm.product_service.models.RestaurantOrder;
import vn.cnpm.product_service.repository.RestaurantOrderRepository;
import vn.cnpm.product_service.repository.RestaurantRepository;
import vn.cnpm.product_service.service.RestaurantService;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
@Slf4j
public class RestaurantController {
    private final RestaurantService restaurantService;
    private final RestaurantOrderRepository restaurantOrderRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantEventPublisher eventPublisher;

    @GetMapping
    public List<RestaurantResponse> getAllRestaurants() {
        return restaurantService.getAllRestaurants();
    }

    @GetMapping("/{id}")
    public RestaurantResponse getRestaurantById(@PathVariable Long id) {
        return restaurantService.getRestaurantById(id);
    }

    // Endpoint mới: Lấy restaurant theo userId
    @GetMapping("/user/{userId}")
    public ResponseEntity<RestaurantResponse> getRestaurantByUserId(@PathVariable Long userId) {
        return restaurantService.getRestaurantByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint mới: Lấy danh sách restaurant đang hoạt động
    @GetMapping("/active")
    public List<RestaurantResponse> getActiveRestaurants() {
        return restaurantService.getActiveRestaurants();
    }

    @PostMapping
    public RestaurantResponse createRestaurant(@RequestBody RestaurantResquest request) {
        return restaurantService.createRestaurant(request);
    }

    @PutMapping("/{id}")
    public RestaurantResponse updateRestaurant(@PathVariable Long id, @RequestBody RestaurantResquest request) {
        return restaurantService.updateRestaurant(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteRestaurant(@PathVariable Long id) {
        restaurantService.deleteRestaurant(id);
    }

    // =============== Restaurant Order Management APIs ===============

    /**
     * Lấy danh sách đơn hàng của nhà hàng
     */
    @GetMapping("/{restaurantId}/orders")
    public ResponseEntity<List<RestaurantOrder>> getRestaurantOrders(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) String status) {
        List<RestaurantOrder> orders;
        if (status != null && !status.isBlank()) {
            orders = restaurantOrderRepository.findByRestaurantIdAndStatus(restaurantId, status);
        } else {
            orders = restaurantOrderRepository.findByRestaurantId(restaurantId);
        }
        return ResponseEntity.ok(orders);
    }

    /**
     * Nhà hàng xác nhận nhận đơn hàng
     * Chuyển trạng thái từ PENDING_CONFIRMATION -> PREPARING
     */
    @PostMapping("/orders/{orderId}/confirm")
    public ResponseEntity<RestaurantOrder> confirmOrder(@PathVariable Long orderId) {
        try {
            RestaurantOrder order = restaurantOrderRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            if (!"PENDING_CONFIRMATION".equals(order.getStatus())) {
                return ResponseEntity.badRequest().build();
            }

            order.setStatus("PREPARING");
            order.setConfirmedAt(Instant.now());
            restaurantOrderRepository.save(order);

            log.info("Restaurant {} confirmed order {}", order.getRestaurantId(), orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("Failed to confirm order {}", orderId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Nhà hàng đánh dấu món ăn đã sẵn sàng
     * Chuyển trạng thái từ PREPARING -> READY
     * Phát sự kiện OrderReadyEvent để Delivery Service nhận
     */
    @PostMapping("/orders/{orderId}/ready")
    public ResponseEntity<RestaurantOrder> markOrderReady(@PathVariable Long orderId) {
        try {
            RestaurantOrder order = restaurantOrderRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            if (!"PREPARING".equals(order.getStatus())) {
                return ResponseEntity.badRequest().build();
            }

            // Lấy thông tin nhà hàng
            Restaurant restaurant = restaurantRepository.findById(order.getRestaurantId())
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));

            // Cập nhật trạng thái
            order.setStatus("READY");
            order.setReadyAt(Instant.now());
            restaurantOrderRepository.save(order);

            // Phát sự kiện OrderReadyEvent
            OrderReadyEvent event = OrderReadyEvent.builder()
                    .orderId(order.getOrderId())
                    .restaurantId(order.getRestaurantId())
                    .restaurantAddress(restaurant.getAddress())
                    .deliveryAddress(order.getDeliveryAddress())
                    .deliveryPhone(order.getDeliveryPhone())
                    .deliveryFullName(order.getDeliveryFullName())
                    .build();

            eventPublisher.publishOrderReadyEvent(event);

            log.info("Restaurant {} marked order {} as READY", order.getRestaurantId(), orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("Failed to mark order {} as ready", orderId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
